import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play, RotateCcw, Trophy, Zap, Coins, Clock,
  CheckCircle2, ChevronRight, BookOpen, Sparkles,
  Flame, Lock, Shield, Star, Rocket, Map,
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
import { DashCard } from './DashComponents';

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
  const resolvedStdId = selectedStandardId || 'grade-11';
  const resolvedSubjId = selectedSubjectId || 'chemistry';
  const stdDisplayName = selectedStandard || STANDARD_NAMES[resolvedStdId] || '11th Standard';
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
      return { type: 'EMPTY', chapter: null };
    }

    // Read user-scoped saved learning context (if any)
    const savedContext = user?.id ? scopedGetJSON(user.id, 'learning-context') : null;
    let savedLastPlayed = null;
    if (savedContext?.subjectId === resolvedSubjId && savedContext?.standardId === resolvedStdId) {
      savedLastPlayed = savedContext.lastPlayedAt;
    }

    // 1. Calculate status for every chapter
    let completedCount = 0;
    let inProgressChapter = null;
    let inProgressStatus = null;
    let firstUnlockedIncomplete = null;
    let firstUnlockedIndex = -1;

    const evaluatedChapters = chaptersList.map((ch, idx) => {
      const statusInfo = getChapterStatus(ch, idx, chaptersList, completedRooms, userProgressList);
      if (statusInfo.isCompleted) {
        completedCount++;
      } else if (!inProgressChapter && statusInfo.status === 'IN_PROGRESS') {
        inProgressChapter = ch;
        inProgressStatus = statusInfo;
      } else if (!firstUnlockedIncomplete && statusInfo.isUnlocked) {
        firstUnlockedIncomplete = ch;
        firstUnlockedIndex = idx;
      }
      return { chapter: ch, index: idx, statusInfo };
    });

    // 2. Check if entire subject is mastered
    if (completedCount === chaptersList.length && chaptersList.length > 0) {
      return {
        type: 'SUBJECT_MASTERED',
        chapter: chaptersList[chaptersList.length - 1],
        completedCount,
        totalChapters: chaptersList.length,
        progress: 100,
        lastPlayedAt: savedLastPlayed,
      };
    }

    // 3. Check if there's an IN_PROGRESS chapter
    if (inProgressChapter) {
      return {
        type: 'IN_PROGRESS',
        chapter: inProgressChapter,
        statusInfo: inProgressStatus,
        progress: inProgressStatus?.progress || 50,
        stageInfo: 'In Progress',
        completedCount,
        totalChapters: chaptersList.length,
        lastPlayedAt: savedLastPlayed,
      };
    }

    // 4. Check if savedContext points to a valid, unlocked, incomplete chapter
    if (savedContext?.chapterId) {
      const matched = evaluatedChapters.find(
        e => e.chapter.id === savedContext.chapterId && e.statusInfo.isUnlocked && !e.statusInfo.isCompleted
      );
      if (matched) {
        return {
          type: matched.statusInfo.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'NEXT_MISSION',
          chapter: matched.chapter,
          statusInfo: matched.statusInfo,
          progress: matched.statusInfo.progress || 0,
          completedCount,
          totalChapters: chaptersList.length,
          lastPlayedAt: savedLastPlayed,
        };
      }
    }

    // 5. Check first unlocked incomplete chapter
    if (firstUnlockedIncomplete) {
      const isFirstChapter = firstUnlockedIndex === 0;
      const isNewUser = isFirstChapter && completedCount === 0 && (xp === 0 || !xp);

      return {
        type: isNewUser ? 'START_JOURNEY' : 'NEXT_MISSION',
        chapter: firstUnlockedIncomplete,
        completedCount,
        totalChapters: chaptersList.length,
        progress: 0,
        lastPlayedAt: savedLastPlayed,
      };
    }

    // Fallback: Default to first chapter
    return {
      type: 'START_JOURNEY',
      chapter: chaptersList[0],
      completedCount: 0,
      totalChapters: chaptersList.length,
      progress: 0,
      lastPlayedAt: null,
    };
  }, [chaptersList, completedRooms, userProgressList, resolvedStdId, resolvedSubjId, user, xp]);

  // ── Action: Continue / Start Mission ─────────────────────────────────────────
  const handleLaunchTarget = useCallback(() => {
    if (!learningTarget.chapter) {
      navigateTo('select-subject');
      return;
    }

    const ch = learningTarget.chapter;

    // 1. Save user-scoped learning context
    if (user?.id) {
      scopedSetJSON(user.id, 'learning-context', {
        standardId: resolvedStdId,
        subjectId: resolvedSubjId,
        chapterId: ch.id,
        lastPlayedAt: Date.now(),
      });
    }

    // 2. Push into navigation context
    setSelectedChapterId(ch.id);
    setSelectedChapter(ch.title);

    // 3. Open Mission Brief screen
    navigateTo('mission', { chapterId: ch.id, chapter: ch });
  }, [learningTarget, user, resolvedStdId, resolvedSubjId, setSelectedChapterId, setSelectedChapter, navigateTo]);

  // ── Action: Explore / Change Subject ─────────────────────────────────────────
  const handleExploreSubjects = useCallback(() => {
    navigateTo('select-subject');
  }, [navigateTo]);

  const handleOpenChapterMap = useCallback(() => {
    navigateTo('chapters');
  }, [navigateTo]);

  // ── Style Tokens ─────────────────────────────────────────────────────────────
  const cardBg = isDark
    ? `linear-gradient(135deg, ${accentColor}12 0%, ${accentColor}06 50%, rgba(12,20,17,0.92) 100%)`
    : `linear-gradient(135deg, ${accentColor}10 0%, #FFFFFF 100%)`;

  const cardBorder = isDark ? `1.5px solid ${accentColor}35` : `1.5px solid ${accentColor}40`;
  const textHead = isDark ? '#F1F5F4' : '#10201A';
  const textMuted = isDark ? 'rgba(241,245,244,0.55)' : '#5D6C66';
  const lastPlayedFormatted = formatLastPlayed(learningTarget.lastPlayedAt);

  const activeChapter = learningTarget.chapter;
  const isMastered = learningTarget.type === 'SUBJECT_MASTERED';
  const isInProgress = learningTarget.type === 'IN_PROGRESS';
  const isNewJourney = learningTarget.type === 'START_JOURNEY';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="min-w-0 w-full mb-6"
    >
      <DashCard
        id="continue-learning-card"
        className="p-5 sm:p-7 relative overflow-hidden min-w-0 w-full"
        style={{
          background: cardBg,
          border: cardBorder,
          boxShadow: isDark
            ? `0 0 35px ${accentColor}18, 0 8px 30px rgba(0,0,0,0.3)`
            : `0 4px 24px rgba(15,23,42,0.08)`,
        }}
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${accentColor}25 0%, transparent 70%)` }}
        />

        {/* ── CASE 1: SUBJECT MASTERED ── */}
        {isMastered ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 min-w-0">
            <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-3xl shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(251,191,36,0.1))',
                  border: '1.5px solid #F59E0B',
                }}
              >
                🏆
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] sm:text-xs font-orbitron font-black text-amber-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                    SUBJECT MASTERED
                  </span>
                  <span className="text-xs font-space" style={{ color: textMuted }}>
                    {stdDisplayName} · {subjDisplayName}
                  </span>
                </div>

                <h2 className="font-orbitron font-black text-lg sm:text-2xl mb-1 truncate" style={{ color: textHead }}>
                  All Chapters Conquered!
                </h2>
                <p className="text-xs sm:text-sm font-inter" style={{ color: textMuted }}>
                  You have completed all {learningTarget.totalChapters} chapters in {subjDisplayName}. Explore another subject or replay chapters for mastery.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={handleOpenChapterMap}
                className="px-5 py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-wider cursor-pointer border transition-colors"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : '#EEF5F2',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#DDE8E3',
                  color: isDark ? '#CBD5E1' : '#334155',
                }}
              >
                View Chapter Map
              </button>

              <button
                type="button"
                onClick={handleExploreSubjects}
                className="px-6 py-3 rounded-xl font-orbitron font-black text-xs uppercase tracking-widest text-slate-950 flex items-center justify-center gap-2 shadow-lg cursor-pointer border-0"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                  boxShadow: '0 0 20px rgba(245,158,11,0.35)',
                }}
              >
                <BookOpen size={14} />
                <span>Explore Other Subjects</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── CASE 2: ACTIVE CONTINUE / START MISSION ── */
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 min-w-0">

            {/* Left Block: Icon + Details */}
            <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
              {/* Subject Icon with Animated Pulse */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `${accentColor}18`,
                    border: `1.5px solid ${accentColor}40`,
                    boxShadow: `0 0 24px ${accentColor}20`,
                  }}
                >
                  <SubjIcon size={28} style={{ color: accentColor }} />
                </div>
                {isInProgress && (
                  <div
                    className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] bg-cyan-500 text-slate-950 font-black shadow-md animate-pulse"
                    title="In Progress"
                  >
                    ⚡
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {/* Badge */}
                  <span
                    className="text-[10px] sm:text-xs font-orbitron font-extrabold tracking-widest uppercase px-2.5 py-0.5 rounded-full"
                    style={{
                      background: isInProgress ? 'rgba(34,211,238,0.15)' : `${accentColor}18`,
                      color: isInProgress ? '#22D3EE' : accentColor,
                      border: isInProgress ? '1px solid rgba(34,211,238,0.35)' : `1px solid ${accentColor}35`,
                    }}
                  >
                    {isInProgress ? 'CONTINUE LEARNING' : isNewJourney ? 'START YOUR JOURNEY' : 'NEXT MISSION'}
                  </span>

                  {/* Standard & Subject info */}
                  <span className="text-xs font-space" style={{ color: textMuted }}>
                    {stdDisplayName} · {subjDisplayName}
                  </span>

                  {/* Last played time */}
                  {lastPlayedFormatted && (
                    <span className="flex items-center gap-1 text-[11px] font-space text-slate-400 ml-auto sm:ml-0">
                      <Clock size={11} className="opacity-70" />
                      {lastPlayedFormatted}
                    </span>
                  )}
                </div>

                {/* Chapter Title */}
                <h2
                  className="font-orbitron font-black text-lg sm:text-2xl mb-1 leading-tight truncate"
                  style={{ color: textHead }}
                >
                  {activeChapter ? (
                    <span>
                      Chapter {activeChapter.chapterNumber || 1} — {activeChapter.title}
                    </span>
                  ) : (
                    <span>Start Learning {subjDisplayName}</span>
                  )}
                </h2>

                {/* Description or Mission Tag */}
                <p className="text-xs sm:text-sm font-inter mb-3 line-clamp-2" style={{ color: textMuted }}>
                  {activeChapter?.description || `Explore fundamental concepts and solve interactive escape rooms in ${subjDisplayName}.`}
                </p>

                {/* Progress Bar & Stage */}
                <div>
                  <div className="flex justify-between text-xs font-space mb-1.5" style={{ color: textMuted }}>
                    <span aria-label={`Chapter Progress ${learningTarget.progress}%`}>
                      {isInProgress ? 'Mission in progress' : `${learningTarget.completedCount || 0} of ${learningTarget.totalChapters || 1} chapters solved`}
                    </span>
                    <span className="font-orbitron font-bold" style={{ color: accentColor }}>
                      {learningTarget.progress > 0 ? `${learningTarget.progress}%` : 'Ready to Start'}
                    </span>
                  </div>

                  <div
                    className="h-2 rounded-full overflow-hidden w-full"
                    style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#E5EFEA' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: isInProgress
                          ? `linear-gradient(90deg, #22D3EE, ${accentColor})`
                          : `linear-gradient(90deg, ${accentColor}, #34D399)`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(learningTarget.progress, 6)}%` }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Block: Rewards + CTA Button */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 flex-shrink-0 min-w-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5">
              {/* Rewards */}
              <div className="flex items-center gap-3 text-xs font-space flex-wrap">
                <div className="flex items-center gap-1.5" style={{ color: accentColor }}>
                  <Zap size={13} />
                  <span className="font-bold">+{activeChapter?.xpReward || 500} XP</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span>🪙</span>
                  <span className="font-bold">+{activeChapter?.coinsReward || 100}</span>
                </div>
              </div>

              {/* Primary Action Button */}
              <motion.button
                id="continue-mission-primary-btn"
                onClick={handleLaunchTarget}
                className="flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-xl font-orbitron font-extrabold text-xs sm:text-sm tracking-wider uppercase text-slate-950 relative overflow-hidden cursor-pointer whitespace-nowrap w-full sm:w-auto border-0 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, #34D399)`,
                  boxShadow: `0 0 28px ${accentColor}40`,
                }}
                whileHover={{ scale: 1.03, boxShadow: `0 0 40px ${accentColor}60` }}
                whileTap={{ scale: 0.97 }}
              >
                <Play size={15} className="fill-slate-950 relative z-10" />
                <span className="relative z-10">
                  {isInProgress ? 'Continue Mission' : isNewJourney ? 'Start Journey' : 'Start Mission'}
                </span>
                <ChevronRight size={16} className="relative z-10 opacity-70" />
              </motion.button>
            </div>

          </div>
        )}
      </DashCard>
    </motion.div>
  );
}
