import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

// Remove old GLOBAL (non-scoped) keys left by previous sessions
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

  // ── Syllabus Selection (Isolated & Cascade Cleaned) ───────────────────────
  const [selectedStandardId, setSelectedStandardIdRaw] = useState(null);
  const [selectedStandard, setSelectedStandardRaw]     = useState(null);
  const [selectedSubjectId, setSelectedSubjectIdRaw]   = useState(null);
  const [selectedSubject, setSelectedSubjectRaw]       = useState(null);
  const [selectedChapterId, setSelectedChapterIdRaw]   = useState(null);
  const [selectedChapter, setSelectedChapterRaw]       = useState(null);
  const [selectedRoomId, setSelectedRoomIdRaw]         = useState(null);
  const [currentRoom, setCurrentRoomRaw]               = useState(null);

  // Cascade-safe setters
  const setSelectedStandardId = useCallback((stdId) => {
    setSelectedStandardIdRaw(stdId);
    setSelectedSubjectIdRaw(null);
    setSelectedSubjectRaw('');
    setSelectedChapterIdRaw(null);
    setSelectedChapterRaw(null);
    setSelectedRoomIdRaw(null);
    setCurrentRoomRaw(null);
  }, []);

  const setSelectedStandard = useCallback((stdName) => {
    setSelectedStandardRaw(stdName);
  }, []);

  const setSelectedSubjectId = useCallback((subjId) => {
    setSelectedSubjectIdRaw(subjId);
    setSelectedChapterIdRaw(null);
    setSelectedChapterRaw(null);
    setSelectedRoomIdRaw(null);
    setCurrentRoomRaw(null);
  }, []);

  const setSelectedSubject = useCallback((subjName) => {
    setSelectedSubjectRaw(subjName);
  }, []);

  const setSelectedChapterId = useCallback((chapId) => {
    setSelectedChapterIdRaw(chapId);
    setSelectedRoomIdRaw(null);
    setCurrentRoomRaw(null);
  }, []);

  const setSelectedChapter = useCallback((chapObj) => {
    setSelectedChapterRaw(chapObj);
  }, []);

  const setSelectedRoomId = useCallback((roomId) => {
    setSelectedRoomIdRaw(roomId);
  }, []);

  const setCurrentRoom = useCallback((roomObj) => {
    setCurrentRoomRaw(roomObj);
  }, []);

  // ── User-specific progress (starts empty — loaded per-user after login) ──
  const [completedRooms, setCompletedRooms]     = useState([]);
  const [xp, setXp]                             = useState(0);
  const [coins, setCoins]                       = useState(0);
  const [level, setLevel]                       = useState(1);
  const [streak, setStreak]                     = useState(1);
  const [userBadges, setUserBadges]             = useState([]);
  const [userProgressList, setUserProgressList] = useState([]);

  // ── 10-Minute Timed Life Regeneration System ──────────────────────────────
  const REGEN_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes per life

  const [lives, setLives] = useState(() => {
    try {
      const saved = localStorage.getItem('chemescape_global_lives');
      return saved !== null ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  });

  const [nextLifeRegenTime, setNextLifeRegenTime] = useState(() => {
    try {
      const saved = localStorage.getItem('chemescape_next_life_regen');
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });

  const [gameOverModalOpen, setGameOverModalOpen] = useState(false);

  // Sync lives to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chemescape_global_lives', String(lives));
      if (nextLifeRegenTime) {
        localStorage.setItem('chemescape_next_life_regen', String(nextLifeRegenTime));
      } else {
        localStorage.removeItem('chemescape_next_life_regen');
      }
    } catch {
      /* non-fatal */
    }
  }, [lives, nextLifeRegenTime]);

  // Timed Life Regeneration Check
  useEffect(() => {
    if (lives >= 3) {
      if (nextLifeRegenTime !== null) setNextLifeRegenTime(null);
      return;
    }

    let targetTime = nextLifeRegenTime;
    if (!targetTime) {
      targetTime = Date.now() + REGEN_INTERVAL_MS;
      setNextLifeRegenTime(targetTime);
    }

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= targetTime) {
        const elapsedSinceTarget = now - targetTime;
        const additionalGained = 1 + Math.floor(elapsedSinceTarget / REGEN_INTERVAL_MS);

        setLives((prev) => {
          const updated = Math.min(3, prev + additionalGained);
          if (updated >= 3) {
            setNextLifeRegenTime(null);
          } else {
            const remainder = elapsedSinceTarget % REGEN_INTERVAL_MS;
            setNextLifeRegenTime(now + (REGEN_INTERVAL_MS - remainder));
          }
          return updated;
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [lives, nextLifeRegenTime]);

  const deductLife = useCallback((amount = 1) => {
    setLives((prevLives) => {
      const nextLives = Math.max(0, prevLives - amount);
      if (nextLives < 3 && !nextLifeRegenTime) {
        setNextLifeRegenTime(Date.now() + REGEN_INTERVAL_MS);
      }
      if (nextLives === 0) {
        setGameOverModalOpen(true);
        setCurrentScreen('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return nextLives;
    });
  }, [nextLifeRegenTime]);

  const gainLife = useCallback((amount = 1) => {
    setLives((prevLives) => {
      const nextLives = Math.min(3, prevLives + amount);
      if (nextLives === 3) setNextLifeRegenTime(null);
      return nextLives;
    });
  }, []);

  const clearProgressState = useCallback(() => {
    setCompletedRooms([]);
    setXp(0);
    setCoins(0);
    setLevel(1);
    setStreak(1);
    setUserBadges([]);
    setUserProgressList([]);
    setSelectedSubjectIdRaw(null);
    setSelectedSubjectRaw('');
    setSelectedStandardIdRaw(null);
    setSelectedStandardRaw('');
    setSelectedChapterIdRaw(null);
    setSelectedChapterRaw(null);
    setSelectedRoomIdRaw(null);
    setCurrentRoomRaw(null);
    removeGlobalLegacyKeys();
  }, []);

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

      if (Array.isArray(data.completedList)) {
        const backendRooms = data.completedList
          .map(p => p.roomId || p.room?.id)
          .filter(Boolean);
        setCompletedRooms(backendRooms);
        if (userId) scopedSetJSON(userId, 'completedRooms', backendRooms);
      }

      if (userId) {
        const prefs = scopedGetJSON(userId, 'preferences');
        if (prefs?.selectedStandardId) {
          setSelectedStandardIdRaw(prefs.selectedStandardId);
          setSelectedStandardRaw(prefs.selectedStandardName || '');
        }
        if (prefs?.selectedSubjectId) {
          setSelectedSubjectIdRaw(prefs.selectedSubjectId);
          setSelectedSubjectRaw(prefs.selectedSubjectName || '');
        }
      }
    } catch (err) {
      console.warn('[ChemEscape] Failed to refresh user stats:', err.message);
    }
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────────────────────────────────────
  const GAME_SCREENS = [
    'calculation-heist', 'quantum-architect', 'grid-reconstruction',
    'hydrogen-reactor', 'metal-sorting', 'gas-simulator',
    'room1', 'room2', 'room3', 'boss', 'lab-game'
  ];

  const navigateTo = useCallback((screen, params = {}) => {
    // Block game entry if lives === 0
    if (GAME_SCREENS.includes(screen) && lives === 0) {
      setGameOverModalOpen(true);
      setCurrentScreen('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (params.standardId !== undefined) {
      setSelectedStandardIdRaw(params.standardId);
      if (params.standard) setSelectedStandardRaw(params.standard);
      if (params.subjectId === undefined) {
        setSelectedSubjectIdRaw(null);
        setSelectedSubjectRaw('');
        setSelectedChapterIdRaw(null);
        setSelectedChapterRaw(null);
      }
    }
    if (params.subjectId !== undefined) {
      setSelectedSubjectIdRaw(params.subjectId);
      if (params.subject) setSelectedSubjectRaw(params.subject);
      if (params.chapterId === undefined) {
        setSelectedChapterIdRaw(null);
        setSelectedChapterRaw(null);
      }
    }
    if (params.chapterId !== undefined) {
      setSelectedChapterIdRaw(params.chapterId);
      if (params.chapter) setSelectedChapterRaw(params.chapter);
    }
    if (params.roomId !== undefined) setSelectedRoomIdRaw(params.roomId);
    if (params.room !== undefined) setCurrentRoomRaw(params.room);

    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [lives]);

  const addXp    = useCallback((amount) => setXp(prev  => prev + amount), []);
  const addCoins = useCallback((amount) => setCoins(prev => prev + amount), []);

  const markRoomCompleted = useCallback((roomName, chapterId = null) => {
    const idsToAdd = [
      roomName,
      chapterId,
      selectedChapterId,
    ].filter(Boolean);

    setCompletedRooms(prev => {
      const next = [...prev];
      idsToAdd.forEach(id => {
        if (!next.includes(id)) next.push(id);
      });
      try {
        const userRaw = localStorage.getItem('chemescape_user');
        const u = userRaw ? JSON.parse(userRaw) : null;
        if (u?.id) scopedSetJSON(u.id, 'completedRooms', next);
      } catch {
        /* non-fatal */
      }
      return next;
    });

    try {
      const userRaw = localStorage.getItem('chemescape_user');
      const u = userRaw ? JSON.parse(userRaw) : null;
      refreshUserStats(u?.id);
    } catch {
      refreshUserStats();
    }
  }, [selectedChapterId, refreshUserStats]);

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
        lives, setLives,
        deductLife, gainLife,
        nextLifeRegenTime,
        gameOverModalOpen, setGameOverModalOpen,
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
