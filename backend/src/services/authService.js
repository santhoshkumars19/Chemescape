const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');
const { generateToken } = require('../utils/jwt');

const DATA_DIR = path.resolve(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'registered_users.json');

// Clean state - only real registered users are stored
// Pre-configured official Admin and Teacher credentials
const DEFAULT_SEED_USERS = [
  {
    id: 'usr-admin-edunova',
    name: 'Admin',
    email: 'admin@edunova',
    password: '$2b$10$oJyBZwj1id.2D8xmP8tVGuVdKzQVFxiqUmnyrmK6GbgM46uz2v8vu',
    plainFallback: 'admin@123',
    role: 'ADMIN',
    avatar: '🛡️',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
  {
    id: 'usr-teacher-edunova',
    name: 'Teacher',
    email: 'teacher@edunova',
    password: '$2b$10$9t5ysf3P8eze0FWwKYhtGuCfv.vNRzVWRkSqlcN1LmNMOMQipTx5e',
    plainFallback: 'teacher@123',
    role: 'TEACHER',
    avatar: '👨‍🏫',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-01T00:00:00.000Z',
  },
];

class AuthService {
  constructor() {
    this.initLocalStorage();
  }

  initLocalStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify(DEFAULT_SEED_USERS, null, 2), 'utf8');
      } else {
        const users = this.getLocalUsers();
        let changed = false;
        for (const seed of DEFAULT_SEED_USERS) {
          const idx = users.findIndex(u =>
            u.email.toLowerCase() === seed.email.toLowerCase() ||
            u.id === seed.id ||
            u.email.toLowerCase() === `${seed.email.toLowerCase()}.com`
          );
          if (idx === -1) {
            users.push(seed);
            changed = true;
          } else {
            // Guarantee correct credentials and role
            if (users[idx].plainFallback !== seed.plainFallback || users[idx].role !== seed.role) {
              users[idx] = { ...users[idx], ...seed };
              changed = true;
            }
          }
        }
        if (changed) {
          this.saveLocalUsers(users);
        }
      }
    } catch (err) {
      console.error('[AuthService] Error initializing local user store:', err.message);
    }
  }

  getLocalUsers() {
    try {
      if (fs.existsSync(USERS_FILE)) {
        const raw = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('[AuthService] Error reading local users:', err.message);
    }
    return [];
  }

  saveLocalUsers(users) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (err) {
      console.error('[AuthService] Error saving local users:', err.message);
    }
  }

  findLocalUserByEmail(email) {
    if (!email) return null;
    const normalized = email.toLowerCase().trim();
    const base = normalized.replace(/\.com$/, '');
    const withCom = normalized.endsWith('.com') ? normalized : `${normalized}.com`;

    const users = this.getLocalUsers();
    let found = users.find(u => {
      const uEmail = u.email.toLowerCase();
      return uEmail === normalized || uEmail === base || uEmail === withCom;
    });

    if (!found) {
      found = DEFAULT_SEED_USERS.find(u => {
        const uEmail = u.email.toLowerCase();
        return uEmail === normalized || uEmail === base || uEmail === withCom;
      });
    }
    return found || null;
  }

  findLocalUserById(id) {
    if (!id) return null;
    const users = this.getLocalUsers();
    return users.find(u => u.id === id) || null;
  }

  /**
   * Helper to strip sensitive password field from user object
   */
  sanitizeUser(user) {
    if (!user) return null;
    const { password, plainFallback, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Register a new Student user
   * Guarantees account creation even if remote database is unreachable
   */
  async register({ name, email, password, role }) {
    if (!name || !name.trim()) {
      const error = new Error('Name is required');
      error.statusCode = 400;
      throw error;
    }
    if (!email || !email.trim()) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }
    if (!password || password.length < 6) {
      const error = new Error('Password must be at least 6 characters');
      error.statusCode = 400;
      throw error;
    }

    const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
    const assignedRole = role && validRoles.includes(role.toUpperCase()) ? role.toUpperCase() : 'STUDENT';
    const assignedAvatar = assignedRole === 'TEACHER' ? '👨‍🏫' : assignedRole === 'ADMIN' ? '🛡️' : '🎓';

    const normalizedEmail = email.toLowerCase().trim();
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let createdUser = null;

    // 1. Try Prisma first if DB is accessible
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        const error = new Error('Email already registered');
        error.statusCode = 409;
        throw error;
      }

      const newUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: assignedRole,
          avatar: assignedAvatar,
        },
      });

      createdUser = newUser;

      // Sync copy to local storage
      const localUsers = this.getLocalUsers();
      if (!localUsers.some(u => u.email.toLowerCase() === normalizedEmail)) {
        localUsers.push({
          ...newUser,
          createdAt: newUser.createdAt.toISOString(),
          updatedAt: newUser.updatedAt.toISOString(),
        });
        this.saveLocalUsers(localUsers);
      }
    } catch (dbErr) {
      if (dbErr.statusCode === 409) {
        throw dbErr;
      }

      console.warn('[AuthService] Database unavailable during register, persisting to local store:', dbErr.message);

      // 2. Offline / Local fallback
      const localUsers = this.getLocalUsers();
      const existingInLocal = localUsers.find(u => u.email.toLowerCase() === normalizedEmail);
      if (existingInLocal) {
        const error = new Error('Email already registered');
        error.statusCode = 409;
        throw error;
      }

      const localUser = {
        id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: assignedRole,
        avatar: assignedAvatar,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      localUsers.push(localUser);
      this.saveLocalUsers(localUsers);
      createdUser = localUser;
    }

    const sanitized = this.sanitizeUser(createdUser);
    const token = generateToken({
      userId: sanitized.id,
      role: sanitized.role,
      name: sanitized.name,
      email: sanitized.email,
    });

    return {
      user: sanitized,
      token,
    };
  }

  /**
   * Authenticate user & issue JWT
   */
  async login({ email, password }) {
    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = null;

    // 1. Try Prisma first
    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
    } catch (dbErr) {
      console.warn('[AuthService] Database unavailable during login, checking local store:', dbErr.message);
    }

    // 2. If not found in DB or DB threw an error, check local user store
    if (!user) {
      user = this.findLocalUserByEmail(normalizedEmail);
    }



    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // 4. Verify password
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (e) {
      isPasswordValid = false;
    }

    // Fallback: check plain text fallback for seed accounts
    if (!isPasswordValid && user.plainFallback && password === user.plainFallback) {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Get all registered users dynamically
   * Accessible for Teacher & Admin modules
   */
  async getAllUsers(roleFilter = null) {
    let users = [];
    try {
      const where = roleFilter && roleFilter !== 'ALL' ? { role: roleFilter.toUpperCase() } : {};
      const dbUsers = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      if (dbUsers && dbUsers.length > 0) {
        return dbUsers;
      }
    } catch {
      // DB offline - fall through to local storage
    }

    const localUsers = this.getLocalUsers();
    users = localUsers.map(u => this.sanitizeUser(u));

    if (roleFilter && roleFilter !== 'ALL') {
      const normRole = roleFilter.toUpperCase();
      users = users.filter(u => u.role === normRole);
    }

    return users;
  }

  /**
   * Get user details by ID
   */
  async getUserById(userId) {
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (dbErr) {
      console.warn('[AuthService] Database unavailable during getUserById:', dbErr.message);
    }

    if (!user) {
      user = this.findLocalUserById(userId);
    }

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return this.sanitizeUser(user);
  }
}

module.exports = new AuthService();
