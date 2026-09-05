import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '../services/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(() => {
    try {
      const raw = localStorage.getItem('chemescape_user');
      if (raw) {
        return JSON.parse(raw);
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
      localStorage.setItem('chemescape_user', JSON.stringify(user));
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

      const userObj  = data.data?.user;
      const authToken = data.data?.token;

      // Step 2: Set new identity & token
      setUser(userObj);
      setToken(authToken);
      if (authToken) localStorage.setItem('chemescape_token', authToken);
      setIsGuest(false);

      // Step 3: Load ONLY this user's progress from the server
      if (authToken && userObj?.id) {
        setTimeout(() => {
          progressActionsRef.current.refreshUserStats(userObj.id);
        }, 100);
      }

      return userObj;
    } catch (err) {
      console.error('[EduNova] Login error:', err.message);
      throw err;
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // register — accepts real name, email, password, and chosen role
  // ─────────────────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, role = 'STUDENT') => {
    progressActionsRef.current.clearProgressState();

    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Registration failed.');
    }

    const userObj  = data.data?.user;
    const authToken = data.data?.token;

    setUser(userObj);
    setToken(authToken);
    if (authToken) localStorage.setItem('chemescape_token', authToken);
    setIsGuest(false);

    if (authToken && userObj?.id) {
      setTimeout(() => {
        progressActionsRef.current.refreshUserStats(userObj.id);
      }, 100);
    }

    return userObj;
  }, []);

  const forgotPassword = useCallback(async (_email) => true, []);

  const continueAsGuest = useCallback(async () => {
    progressActionsRef.current.clearProgressState();
    const guestUser = {
      id: `guest-${Date.now()}`,
      name: 'Guest Scholar',
      email: '',
      role: 'STUDENT',
      avatar: '🎓',
    };
    setUser(guestUser);
    setIsGuest(true);
    setToken(null);
    localStorage.removeItem('chemescape_token');
    localStorage.setItem('chemescape_user', JSON.stringify(guestUser));
  }, []);

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
