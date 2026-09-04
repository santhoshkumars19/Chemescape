import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play, RotateCcw, Trophy, Zap, Clock,
  CheckCircle2, ChevronRight, BookOpen, Sparkles,
  Flame, Lock, Shield, Star, Rocket, Map, ArrowRight,
  FlaskConical, Calculator, Languages, Globe,
  BookText, Leaf, Terminal, Atom, Microscope,
} from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  getChaptersForStandardAndSubject,
  getChapterStatus,
  getSubjectsForStandard,
} from '../config/curriculumConfig';

// ── Icon resolver ─────────────────────────────────────────────────────────────
const ICON_MAP = {
  FlaskConical, Zap, Calculator, Languages, Globe,
  BookText, Leaf, Terminal, Atom, Microscope,
};
const resolveIcon = (name) => ICON_MAP[name] || BookOpen;

const STANDARD_NAMES = {
  'grade-4': '4th Standard', 'grade-5': '5th Standard',
  'grade-6': '6th Standard', 'grade-7': '7th Standard',
  'grade-8': '8th Standard', 'grade-9': '9th Standard',
  'grade-10': '10th Standard', 'grade-11': '11th Standard',
  'grade-12': '12th Standard',
};

// ── Circular Progress Ring Component ──────────────────────────────────────────
function CircularProgressRing({ progress = 0, size = 88, strokeWidth = 7 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.18)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#34D399"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {/* Center Percentage Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading font-extrabold text-white text-base leading-none">
          {progress}%
        </span>
        <span className="text-[9px] text-emerald-200/80 font-medium uppercase tracking-wider mt-0.5">
          Done
        </span>
      </div>
    </div>
  );
}

// ── Time helper ───────────────────────────────────────────────────────────────
function formatLastPlayed(timestamp) {
  if (!timestamp) return null;
  const num = Number(timestamp);
  if (isNaN(num) || num <= 0) return null;

  const diffMs = Date.now() - num;
  if (diffMs < 0) return 'Just now';
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 2) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(num).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ContinueLearningCard() {
  const {
    navigateTo,
    selectedStandardId, selectedStandard,
    selectedSubjectId, selectedSubject,
    setSelectedChapterId, setSelectedChapter,
    completedRooms, userProgressList, xp,
  } = useNavigation();

  const { user } = useAuth();
  const { isDark } = useTheme();

  // ── Scoped localStorage helpers ─────────────────────────────────────────────
  const scopedKey = (uid, k) => uid ? `chemescape:user:${uid}:${k}` : null;
  const scopedGetJSON = (uid, k) => {
    const key = scopedKey(uid, k);
    if (!key) return null;
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  };
  const scopedSetJSON = (uid, k, v) => {
    const key = scopedKey(uid, k);
    if (!key) return;
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  };

  // ── Resolve Standard & Subject Context ──────────────────────────────────────
  const resolvedStdId = selectedStandardId || 'grade-8';
  const resolvedSubjId = selectedSubjectId || 'science';
  const stdDisplayName = selectedStandard || STANDARD_NAMES[resolvedStdId] || '8th Standard';
  const subjDisplayName = selectedSubject || (resolvedSubjId.charAt(0).toUpperCase() + resolvedSubjId.slice(1));

  // Subject config for colors & icon
  const subjects = getSubjectsForStandard(resolvedStdId);
  const subjConfig = subjects.find(s => s.id === resolvedSubjId);
  const accentColor = subjConfig?.color || '#10B981';
  const SubjIcon = resolveIcon(subjConfig?.icon);

  // ── Chapters List ───────────────────────────────────────────────────────────
  const chaptersList = useMemo(() => {
    return getChaptersForStandardAndSubject(resolvedStdId, resolvedSubjId);
  }, [resolvedStdId, resolvedSubjId]);

  // ── Determine Authoritative Learning Target ─────────────────────────────────
  const learningTarget = useMemo(() => {
    if (!chaptersList || chaptersList.length === 0) {
      return { type: 'EMPTY', chapter: null, progress: 0 };
    }

    // Read user-scoped saved learning context (if any)
    const savedContext = user?.id ? scopedGetJSON(user.id, 'learning-context') : null;
    let savedLastPlayed = null;
    if (savedContext?.subjectId === resolvedSubjId && savedContext?.standardId === resolvedStdId) {
      savedLastPlayed = savedContext.lastPlayedAt;
    }

    let completedCount = 0;
    let inProgressChapter = null;
    let inProgressStatus = null;
    let firstUnlockedIncomplete = null;
    let firstUnlockedIndex = -1;

    const evaluatedChapters = chaptersList.map((ch, idx) => {
      const statusInfo = getChapterStatus(ch, idx, chaptersList, completedRooms, userProgressList);
      if (statusInfo.isCompleted) {
        completedCount++;
      } else if (statusInfo.isUnlocked && !statusInfo.isCompleted) {
        if (statusInfo.inProgress && !inProgressChapter) {
          inProgressChapter = ch;
          inProgressStatus = statusInfo;
        }
        if (!firstUnlockedIncomplete) {
          firstUnlockedIncomplete = ch;
          firstUnlockedIndex = idx;
        }
      }
      return { ...ch, statusInfo };
    });

    const totalChapters = chaptersList.length;
    const progress = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

    // Case 1: All chapters completed
    if (completedCount === totalChapters) {
      return {
        type: 'SUBJECT_MASTERED',
        chapter: chaptersList[chaptersList.length - 1],
        totalChapters,
        completedCount,
        progress: 100,
        lastPlayedAt: savedLastPlayed,
      };
    }

    // Case 2: Resume in-progress mission
    if (inProgressChapter) {
      return {
        type: 'IN_PROGRESS',
        chapter: inProgressChapter,
        statusInfo: inProgressStatus,
        totalChapters,
        completedCount,
        progress: Math.max(progress, 15),
        lastPlayedAt: savedLastPlayed,
      };
    }

    // Case 3: First unlocked incomplete chapter
    if (firstUnlockedIncomplete) {
      return {
        type: completedCount > 0 ? 'NEXT_CHAPTER' : 'START_JOURNEY',
        chapter: firstUnlockedIncomplete,
        index: firstUnlockedIndex,
        totalChapters,
        completedCount,
        progress,
        lastPlayedAt: savedLastPlayed,
      };
    }

    // Fallback: Chapter 1
    return {
      type: 'START_JOURNEY',
      chapter: chaptersList[0],
      index: 0,
      totalChapters,
      completedCount: 0,
      progress: 0,
      lastPlayedAt: savedLastPlayed,
    };
  }, [chaptersList, user, resolvedStdId, resolvedSubjId, completedRooms, userProgressList]);

  // ── Action: Continue / Start Mission ─────────────────────────────────────────
  const handleLaunchTarget = useCallback(() => {
    if (!learningTarget.chapter) {
      navigateTo('select-subject');
      return;
    }

    const ch = learningTarget.chapter;

    if (user?.id) {
      scopedSetJSON(user.id, 'learning-context', {
        standardId: resolvedStdId,
        subjectId: resolvedSubjId,
        chapterId: ch.id,
        lastPlayedAt: Date.now(),
      });
    }

    setSelectedChapterId(ch.id);
    setSelectedChapter(ch.title);
    navigateTo('mission', { chapterId: ch.id, chapter: ch });
  }, [learningTarget, user, resolvedStdId, resolvedSubjId, setSelectedChapterId, setSelectedChapter, navigateTo]);

  const handleExploreSubjects = useCallback(() => {
    navigateTo('select-subject');
  }, [navigateTo]);

  const handleOpenChapterMap = useCallback(() => {
    navigateTo('chapters');
  }, [navigateTo]);

  const lastPlayedFormatted = formatLastPlayed(learningTarget.lastPlayedAt);
  const activeChapter = learningTarget.chapter;
  const isMastered = learningTarget.type === 'SUBJECT_MASTERED';
  const isInProgress = learningTarget.type === 'IN_PROGRESS';
  const isNewJourney = learningTarget.type === 'START_JOURNEY';

  const ringProgress = isMastered ? 100 : Math.max(learningTarget.progress, isInProgress ? 35 : 15);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="min-w-0 w-full mb-6"
    >
      {/* ── CASE 1: ALL CHAPTERS CONQUERED ── */}
      {isMastered ? (
        <div
          className="forest-banner p-6 sm:p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0C3B2E 0%, #114E3E 60%, #16654E 100%)',
          }}
        >
          {/* Subtle Background Rings */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -bottom-20 -right-8 w-72 h-72 rounded-full border border-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5 min-w-0 flex-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0 text-3xl sm:text-4xl shadow-lg">
                🏆
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[11px] font-bold font-heading text-amber-300 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30">
                    Subject Mastered
                  </span>
                  <span className="text-xs text-emerald-100/70 font-medium">
                    {stdDisplayName} · {subjDisplayName}
                  </span>
                </div>

                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-white mb-1.5">
                  All Chapters Conquered!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-xl">
                  You have completed all {learningTarget.totalChapters} chapters in {subjDisplayName}. Explore another subject or replay missions to sharpen your skills.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={handleOpenChapterMap}
                className="px-5 py-3 rounded-full text-xs font-heading font-bold uppercase tracking-wider text-white border border-white/20 hover:bg-white/10 transition-colors cursor-pointer"
              >
                View Chapter Map
              </button>
              <button
                type="button"
                onClick={handleExploreSubjects}
                className="pill-btn-mint text-xs font-heading font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <BookOpen size={14} />
                <span>Explore Other Subjects</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── CASE 2: FEATURED CHALLENGE BANNER (Matches Reference Image) ── */
        <div
          className="forest-banner p-6 sm:p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0C3B2E 0%, #114E3E 55%, #16654E 100%)',
          }}
        >
          {/* Subtle Geometric Arcs from the Reference Image */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -bottom-24 -right-10 w-72 h-72 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute top-1/2 right-40 w-32 h-32 rounded-full bg-emerald-400/5 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left Content */}
            <div className="flex-1 min-w-0">
              {/* Category Pill / Standard & Subject */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[11px] font-heading font-extrabold text-emerald-300 uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
                  {subjDisplayName} Quiz
                </span>
                <span className="text-xs text-emerald-100/70 font-medium">
                  {stdDisplayName}
                </span>
                {lastPlayedFormatted && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-200/60 ml-auto sm:ml-0 font-medium">
                    <Clock size={11} className="opacity-70" />
                    {lastPlayedFormatted}
                  </span>
                )}
              </div>

              {/* Banner Title */}
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white mb-2 leading-tight">
                {activeChapter ? (
                  <span>Chapter {activeChapter.chapterNumber || 1}: {activeChapter.title}</span>
                ) : (
                  <span>Your Next Challenge Awaits!</span>
                )}
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed mb-4 max-w-xl line-clamp-2">
                {activeChapter?.description || `Test your skills and unlock new levels in ${subjDisplayName}. Complete missions to earn XP and climb the leaderboard!`}
              </p>

              {/* Action Buttons & Rewards */}
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap pt-1">
                <motion.button
                  id="continue-mission-primary-btn"
                  onClick={handleLaunchTarget}
                  className="pill-btn-mint text-xs sm:text-sm font-heading font-extrabold tracking-wide uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Play size={15} className="fill-current" />
                  <span>{isInProgress ? 'Continue Quiz' : isNewJourney ? 'Start Quiz' : 'Continue →'}</span>
                </motion.button>

                <button
                  type="button"
                  onClick={handleOpenChapterMap}
                  className="px-4 py-2.5 rounded-full text-xs font-heading font-bold text-white/90 border border-white/20 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  View Chapters
                </button>

                {/* Rewards Badges */}
                <div className="hidden sm:flex items-center gap-3 ml-2 text-xs font-semibold text-emerald-200">
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                    <Zap size={12} className="text-amber-400" />
                    +{activeChapter?.xpReward || 500} XP
                  </span>
                  <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full border border-white/10 text-amber-300">
                    🪙 +{activeChapter?.coinsReward || 100}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Circular Progress Ring matching Reference Image */}
            <div className="flex sm:flex-col items-center justify-between sm:justify-center gap-4 flex-shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-white/10">
              <CircularProgressRing
                progress={ringProgress}
                size={92}
                strokeWidth={7}
              />
              <div className="text-center sm:text-center">
                <p className="text-xs font-heading font-bold text-white">
                  {learningTarget.completedCount || 0} / {learningTarget.totalChapters || 1}
                </p>
                <p className="text-[10px] text-emerald-200/70 font-medium">
                  Chapters Cleared
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </motion.div>
  );
}
