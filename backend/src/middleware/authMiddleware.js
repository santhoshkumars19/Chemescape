const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/db');
const authService = require('../services/authService');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Fetch user from DB
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (dbErr) {
      // Safe fallback when remote DB connection is unreachable
      const localUser = authService.findLocalUserById(decoded.userId);
      if (localUser) {
        user = authService.sanitizeUser(localUser);
      } else {
        user = {
          id: decoded.userId,
          name: decoded.name || 'Scholar',
          email: decoded.email || '',
          role: decoded.role || 'STUDENT',
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware:
 * Attaches req.user if a valid Bearer token is provided.
 * If absent or invalid, lets the request pass with req.user = null.
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      req.user = null;
      return next();
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      req.user = null;
      return next();
    }

    if (!decoded || !decoded.userId) {
      req.user = null;
      return next();
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (user) {
        req.user = user;
        return next();
      }
    } catch (dbErr) {
      // Safe fallback when remote DB connection is unreachable
    }

    const localUser = authService.findLocalUserById(decoded.userId);
    if (localUser) {
      req.user = authService.sanitizeUser(localUser);
    } else {
      req.user = {
        id: decoded.userId,
        name: decoded.name || 'Scholar',
        email: decoded.email || '',
        role: decoded.role || 'STUDENT',
      };
    }
    next();
  } catch (error) {
    req.user = null;
    next();
  }
}

authMiddleware.authMiddleware = authMiddleware;
authMiddleware.optionalAuth = optionalAuth;

module.exports = authMiddleware;
