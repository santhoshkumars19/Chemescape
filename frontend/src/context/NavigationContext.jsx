import React, { createContext, useContext, useState, useCallback } from 'react';
import gameService from '../services/gameService';

const NavigationContext = createContext(null);

// ─────────────────────────────────────────────────────────────────────────────
// User-scoped localStorage helpers
// NEVER use bare global keys for user-specific data.
// All progress is keyed by userId so that switching users never leaks state.
// ─────────────────────────────────────────────────────────────────────────────
const scopedKey = (userId, key) =>
  userId ? `chemescape:user:${userId}:${key}` : null;

const scopedGet = (userId, key, fallback = null) => {
  const k = scopedKey(userId, key);
  if (!k) return fallback;
  try {
    const raw = localStorage.getItem(k);
    return raw !== null ? raw : fallback;
  } catch {
    return fallback;
  }
};

const scopedGetJSON = (userId, key, fallback = null) => {
  const k = scopedKey(userId, key);
  if (!k) return fallback;
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const scopedSet = (userId, key, value) => {
  const k = scopedKey(userId, key);
  if (!k) return;
  try { localStorage.setItem(k, value); } catch { /* quota errors are non-fatal */ }
};

const scopedSetJSON = (userId, key, value) => {
  const k = scopedKey(userId, key);
  if (!k) return;
  try { localStorage.setItem(k, JSON.stringify(value)); } catch { /* non-fatal */ }
};

// Remove the old GLOBAL (non-scoped) keys left by previous sessions
const removeGlobalLegacyKeys = () => {
  const LEGACY = [
    'chemescape_completedRooms',
    'chemescape_screen',
    'chemescape_standardId',
    'chemescape_standard',
    'chemescape_subjectId',
    'chemescape_chapterId',
    'chemescape_roomId',
  ];
  LEGACY.forEach(k => { try { localStorage.removeItem(k); } catch { /* noop */ } });
};

// ─────────────────────────────────────────────────────────────────────────────

export function NavigationProvider({ children }) {
  // ── Navigation ────────────────────────────────────────────────────────────
  const [currentScreen, setCurrentScreen] = useState('landing');

  // ── Syllabus Selection (not user-specific — safe to keep globally) ─────────
  const [selectedStandardId, setSelectedStandardId] = useState(null);
  const [selectedStandard, setSelectedStandard]     = useState('11th Standard');
  const [selectedSubjectId, setSelectedSubjectId]   = useState(null);
  const [selectedSubject, setSelectedSubject]       = useState('Chemistry');
  const [selectedChapterId, setSelectedChapterId]   = useState(null);
  const [selectedChapter, setSelectedChapter]       = useState(null);
  const [selectedRoomId, setSelectedRoomId]         = useState(null);
  const [currentRoom, setCurrentRoom]               = useState('room1');

  // ── User-specific progress (starts empty — loaded per-user after login) ──
  const [completedRooms, setCompletedRooms]     = useState([]);
  const [xp, setXp]                             = useState(0);
  const [coins, setCoins]                       = useState(0);
  const [level, setLevel]                       = useState(1);
  const [streak, setStreak]                     = useState(1);
  const [userBadges, setUserBadges]             = useState([]);
  const [userProgressList, setUserProgressList] = useState([]);

  // ─────────────────────────────────────────────────────────────────────────
  // clearProgressState — MUST be called on logout and before loading a new user.
  // Wipes every piece of in-memory game progress so User A's data can never
  // bleed into User B's session.
  // ─────────────────────────────────────────────────────────────────────────
  const clearProgressState = useCallback(() => {
    setCompletedRooms([]);
    setXp(0);
    setCoins(0);
    setLevel(1);
    setStreak(1);
    setUserBadges([]);
    setUserProgressList([]);
    // Also blow away the old non-scoped legacy keys
    removeGlobalLegacyKeys();
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // refreshUserStats — fetch progress for a specific authenticated user.
  // Accepts userId so the caller can pass the JUST-logged-in user's id,
  // preventing any race between token storage and fetch.
  // REPLACES (never merges) completedRooms to avoid cross-user contamination.
  // ─────────────────────────────────────────────────────────────────────────
  const refreshUserStats = useCallback(async (userId = null) => {
    const token = localStorage.getItem('chemescape_token');
    if (!token) return;

    try {
      const data = await gameService.getUserProgress();
      if (!data) return;

      if (data.stats) {
        setXp(data.stats.totalXP     ?? 0);
        setCoins(data.stats.totalCoins  ?? 0);
        setLevel(data.stats.currentLevel ?? 1);
        setStreak(data.stats.currentStreak ?? 1);
      }
      if (Array.isArray(data.badges))       setUserBadges(data.badges);
      if (Array.isArray(data.progress))     setUserProgressList(data.progress);

      // ── KEY FIX: REPLACE, never merge ──────────────────────────────────
      if (Array.isArray(data.completedList)) {
        const backendRooms = data.completedList
          .map(p => p.roomId || p.room?.id)
          .filter(Boolean);
        // Overwrite completely — do NOT spread `prev` here
        setCompletedRooms(backendRooms);

        // Persist scoped to this user
        if (userId) scopedSetJSON(userId, 'completedRooms', backendRooms);
      }
    } catch (err) {
      console.warn('[ChemEscape] Failed to refresh user stats:', err.message);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────────────────
  const navigateTo = useCallback((screen, params = {}) => {
    if (params.standardId) setSelectedStandardId(params.standardId);
    if (params.standard)   setSelectedStandard(params.standard);
    if (params.subjectId)  setSelectedSubjectId(params.subjectId);
    if (params.subject)    setSelectedSubject(params.subject);
    if (params.chapterId)  setSelectedChapterId(params.chapterId);
    if (params.chapter)    setSelectedChapter(params.chapter);
    if (params.roomId)     setSelectedRoomId(params.roomId);
    if (params.room)       setCurrentRoom(params.room);
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const addXp    = useCallback((amount) => setXp(prev  => prev + amount), []);
  const addCoins = useCallback((amount) => setCoins(prev => prev + amount), []);

  const markRoomCompleted = useCallback((roomName) => {
    setCompletedRooms(prev => (prev.includes(roomName) ? prev : [...prev, roomName]));
    refreshUserStats();
  }, [refreshUserStats]);

  return (
    <NavigationContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        navigateTo,
        selectedStandardId, setSelectedStandardId,
        selectedStandard,   setSelectedStandard,
        selectedSubjectId,  setSelectedSubjectId,
        selectedSubject,    setSelectedSubject,
        selectedChapterId,  setSelectedChapterId,
        selectedChapter,    setSelectedChapter,
        selectedRoomId,     setSelectedRoomId,
        currentRoom,        setCurrentRoom,
        completedRooms,
        markRoomCompleted,
        xp,       addXp,
        coins,    addCoins,
        level,    streak,
        userBadges,
        userProgressList,
        refreshUserStats,
        clearProgressState,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within a NavigationProvider');
  return context;
}
