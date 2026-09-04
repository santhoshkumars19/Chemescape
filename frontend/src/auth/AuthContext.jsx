import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(() => {
    try {
      const raw = localStorage.getItem('chemescape_user');
      if (raw) {
        const u = JSON.parse(raw);
        if (u.name === 'Student Chemist' || u.name === 'Student Agent') u.name = 'Student Scholar';
        if (u.avatar === '🧪') u.avatar = '🎓';
        return u;
      }
    } catch {}
    return null;
  });
  const [token, setToken]   = useState(() => localStorage.getItem('chemescape_token') || null);
  const [isGuest, setIsGuest] = useState(false);

  // Ref to NavigationContext's clearProgressState & refreshUserStats.
  // We use a ref pattern to avoid a circular dependency between contexts.
  const progressActionsRef = useRef({
    clearProgressState: () => {},
    refreshUserStats:   () => {},
  });

  /** Called by NavigationProvider to inject its actions into AuthContext */
  const registerProgressActions = useCallback((clear, refresh) => {
    progressActionsRef.current = { clearProgressState: clear, refreshUserStats: refresh };
  }, []);

  // ── Keep token and user in localStorage in sync with state ─────────────────
  useEffect(() => {
    if (token) {
      localStorage.setItem('chemescape_token', token);
    } else {
      localStorage.removeItem('chemescape_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      const cleanUser = { ...user };
      if (cleanUser.name === 'Student Chemist' || cleanUser.name === 'Student Agent') cleanUser.name = 'Student Scholar';
      if (cleanUser.avatar === '🧪') cleanUser.avatar = '🎓';
      localStorage.setItem('chemescape_user', JSON.stringify(cleanUser));
    } else {
      localStorage.removeItem('chemescape_user');
    }
  }, [user]);

  // ── Listen for session-expiry events fired by apiClient on 401 ───────────
  useEffect(() => {
    const handleExpiry = () => {
      progressActionsRef.current.clearProgressState();
      setUser(null);
      setToken(null);
      setIsGuest(false);
      localStorage.removeItem('chemescape_token');
      localStorage.removeItem('chemescape_user');
    };
    window.addEventListener('chemescape:session-expired', handleExpiry);
    return () => window.removeEventListener('chemescape:session-expired', handleExpiry);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // login — clear previous user's state FIRST, then load the new user's data
  // ─────────────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    // Step 1: Wipe any previous user's progress from memory & localStorage
    progressActionsRef.current.clearProgressState();

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please check credentials.');
      }

      let userObj  = data.data?.user || { name: 'Student Scholar', email, role: 'STUDENT' };
      if (userObj.name === 'Student Chemist' || userObj.name === 'Student Agent') userObj = { ...userObj, name: 'Student Scholar' };
      if (userObj.avatar === '🧪') userObj = { ...userObj, avatar: '🎓' };
      const authToken = data.data?.token;

      // Step 2: Set new identity & token
      setUser(userObj);
      setToken(authToken);
      if (authToken) localStorage.setItem('chemescape_token', authToken);
      setIsGuest(false);

      // Step 3: Load ONLY this user's progress from the server
      if (authToken) {
        setTimeout(() => {
          progressActionsRef.current.refreshUserStats(userObj.id);
        }, 100); // tiny delay so token is in localStorage before fetch
      }

      return userObj;
    } catch (err) {
      console.warn('[EduNova] Backend login fallback:', err.message);

      // Demo / offline fallback
      const lowerEmail = email.toLowerCase();
      let role = 'STUDENT', name = 'Student Scholar', avatar = '🎓';
      if (lowerEmail.includes('teacher')) { role = 'TEACHER'; name = 'Prof. Teacher'; avatar = '👨‍🏫'; }
      else if (lowerEmail.includes('admin')) { role = 'ADMIN'; name = 'System Administrator'; avatar = '🛡️'; }

      const fallbackUser = { name, email, role, avatar };
      setUser(fallbackUser);
      setIsGuest(false);
      return fallbackUser;
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // register
  // ─────────────────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    progressActionsRef.current.clearProgressState();

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Registration failed.');
    }

    const userObj  = data.data?.user || { name, email };
    const authToken = data.data?.token;

    setUser(userObj);
    setToken(authToken);
    if (authToken) localStorage.setItem('chemescape_token', authToken);
    setIsGuest(false);

    if (authToken) {
      setTimeout(() => {
        progressActionsRef.current.refreshUserStats(userObj.id);
      }, 100);
    }

    return userObj;
  }, []);

  const forgotPassword = useCallback(async (_email) => true, []);

  const continueAsGuest = useCallback(async () => {
    try {
      await login('student@edunova.com', 'Password123');
    } catch {
      progressActionsRef.current.clearProgressState();
      setUser({ name: 'Guest Scholar', email: 'guest@edunova.com', avatar: '🎓' });
      setIsGuest(true);
    }
  }, [login]);

  // ─────────────────────────────────────────────────────────────────────────
  // logout — clear EVERYTHING: token, user, ALL game progress state
  // ─────────────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    // 1. Clear auth
    setUser(null);
    setToken(null);
    setIsGuest(false);
    localStorage.removeItem('chemescape_token');
    localStorage.removeItem('chemescape_user');

    // 2. Clear all in-memory game progress so next user starts clean
    progressActionsRef.current.clearProgressState();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user, token, isGuest,
        login, register, forgotPassword, continueAsGuest, logout,
        registerProgressActions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
