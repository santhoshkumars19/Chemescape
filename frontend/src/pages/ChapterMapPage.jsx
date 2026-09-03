import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PageContainer from '../components/PageContainer';
import ChapterCard from './ChapterCard';
import {
  getChaptersForStandardAndSubject,
  getChapterStatus,
  getSubjectsForStandard,
  curriculumService,
} from '../config/curriculumConfig';
import standardService from '../services/standardService';
import chapterService from '../services/chapterService';
import {
  ArrowLeft, RefreshCw, Trophy, Star, Zap,
  CheckCircle2, Lock, Unlock, Play, ChevronRight,
  GraduationCap, BookOpen, RotateCcw, Sparkles,
  AlertTriangle, Flag, Award,
} from 'lucide-react';

const STANDARD_NAMES = {
  'grade-4': '4th Standard', 'grade-5': '5th Standard',
  'grade-6': '6th Standard', 'grade-7': '7th Standard',
  'grade-8': '8th Standard', 'grade-9': '9th Standard',
  'grade-10': '10th Standard', 'grade-11': '11th Standard',
  'grade-12': '12th Standard',
};

export default function ChapterMapPage() {
  const {
    navigateTo,
    selectedStandardId, selectedStandard,
    selectedSubjectId, selectedSubject,
    setSelectedChapterId, setSelectedChapter,
    completedRooms, userProgressList, xp,
  } = useNavigation();

  const { user } = useAuth();
  const { isDark } = useTheme();

  // ── Resolve active standard & subject ────────────────────────────────────────
  const resolvedStdId = selectedStandardId || 'grade-11';
  const resolvedSubjId = selectedSubjectId || 'chemistry';

  const stdDisplayName = selectedStandard || STANDARD_NAMES[resolvedStdId] || '11th Standard';
  const subjDisplayName = selectedSubject || (resolvedSubjId.charAt(0).toUpperCase() + resolvedSubjId.slice(1));

  // Subject config for theme accents
  const subjects = getSubjectsForStandard(resolvedStdId);
  const subjConfig = subjects.find(s => s.id === resolvedSubjId);
  const accentColor = subjConfig?.color || '#10B981';

  // ── Chapter state ────────────────────────────────────────────────────────────
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Load chapters for current standard & subject ────────────────────────────
  const loadChapters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Check if backend provides chapters for current standard & subject
      let backendChapters = null;
      try {
        const apiData = await chapterService.getChaptersByStandard(resolvedStdId);
        const rawList = Array.isArray(apiData) ? apiData : (apiData?.chapters || apiData?.data?.chapters || []);
        if (rawList.length > 0) {
          const targetSubj = (resolvedSubjId || '').toLowerCase().replace(/^(subj-|subject-)/, '');
          const filtered = rawList.filter(ch => {
            const chSubj = String(ch.subjectId || ch.subject?.code || ch.subject?.name || '').toLowerCase().replace(/^(subj-|subject-)/, '');
            if (!targetSubj) return true;
            if (chSubj === targetSubj) return true;
            if ((targetSubj === 'social-science' || targetSubj === 'social') && (chSubj === 'social' || chSubj === 'social-science')) return true;
            if ((targetSubj === 'mathematics' || targetSubj === 'math') && (chSubj === 'math' || chSubj === 'mathematics')) return true;
            if ((targetSubj === 'english' || targetSubj === 'eng') && (chSubj === 'eng' || chSubj === 'english')) return true;
            if ((targetSubj === 'tamil' || targetSubj === 'tam') && (chSubj === 'tam' || chSubj === 'tamil')) return true;
            if ((targetSubj === 'science' || targetSubj === 'sci') && (chSubj === 'sci' || chSubj === 'science')) return true;
            return false;
          });
          if (filtered.length > 0) {
            backendChapters = filtered.map(ch => ({
              ...ch,
              gameType: ch.gameType || 'Interactive Quiz Engine',
            }));
          }
        }
      } catch {
        // Backend API is optional — fallback gracefully
      }

      // 2. Fetch from centralized curriculum config
      const configChapters = getChaptersForStandardAndSubject(resolvedStdId, resolvedSubjId);

      if (backendChapters && backendChapters.length >= configChapters.length) {
        setChapters(backendChapters);
      } else {
        setChapters(configChapters);
      }
    } catch (err) {
      console.warn('[ChapterMap] Notice on loading chapters:', err.message);
      const fallback = getChaptersForStandardAndSubject(resolvedStdId, resolvedSubjId);
      setChapters(fallback);
    } finally {
      setLoading(false);
    }
  }, [resolvedStdId, resolvedSubjId]);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  // ── Calculate chapter statuses & progress metrics ────────────────────────────
  const { chapterStatuses, completedCount, totalStars, currentChapterIndex, overallPercentage } = useMemo(() => {
    let compCount = 0;
    let starsCount = 0;
    let nextIdx = 0;
    let foundCurrent = false;

    const statuses = chapters.map((ch, idx) => {
      const status = getChapterStatus(ch, idx, chapters, completedRooms, userProgressList);
      if (status.isCompleted) {
        compCount++;
        starsCount += (status.stars || 3);
      } else if (!foundCurrent && status.isUnlocked) {
        nextIdx = idx;
        foundCurrent = true;
      }
      return status;
    });

    const total = chapters.length || 1;
    const overallPct = Math.round((compCount / total) * 100);

    return {
      chapterStatuses: statuses,
      completedCount: compCount,
      totalStars: starsCount,
      currentChapterIndex: nextIdx,
      overallPercentage: overallPct,
    };
  }, [chapters, completedRooms, userProgressList]);

  // ── Handle chapter selection ─────────────────────────────────────────────────
  const handleSelectChapter = useCallback((chapter) => {
    if (!chapter) return;
    setSelectedChapterId(chapter.id);
    setSelectedChapter(chapter.title);
    navigateTo('mission', { chapterId: chapter.id, chapter });
  }, [setSelectedChapterId, setSelectedChapter, navigateTo]);

  // ── Switchers ────────────────────────────────────────────────────────────────
  const handleChangeStandard = useCallback(() => {
    navigateTo('select-standard');
  }, [navigateTo]);

  const handleChangeSubject = useCallback(() => {
    navigateTo('select-subject');
  }, [navigateTo]);

  // ── Theme colors ─────────────────────────────────────────────────────────────
  const pageBg = isDark ? '#040810' : '#F6FAF8';
  const textHead = isDark ? '#F1F5F4' : '#10201A';
  const textSub = isDark ? 'rgba(241,245,244,0.55)' : '#5D6C66';
  const summaryCardBg = isDark ? 'rgba(12,20,17,0.85)' : '#FFFFFF';
  const summaryCardBorder = isDark ? 'rgba(167,243,208,0.14)' : '#DDE8E3';

  const nextChapter = chapters[currentChapterIndex] || chapters[0];
  const nextStatus = chapterStatuses[currentChapterIndex] || { isUnlocked: true };

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden w-full pb-20" style={{ background: pageBg }}>
      {/* Background ambient lighting */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: isDark
            ? `radial-gradient(ellipse 60% 40% at 50% 10%, ${accentColor}12 0%, transparent 65%)`
            : `radial-gradient(ellipse 60% 40% at 50% 10%, ${accentColor}08 0%, transparent 65%)`,
        }}
      />
      {isDark && <div className="fixed inset-0 lab-grid opacity-10 pointer-events-none z-0" />}

      <PageContainer className="relative z-10 py-8 max-w-4xl mx-auto px-4 sm:px-6">

        {/* ── Top Navigation & Standard/Subject Breadcrumb ─────────────────────── */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigateTo('dashboard')}
            id="chapter-map-back-btn"
            className="inline-flex items-center gap-2 text-xs font-space transition-colors bg-transparent border-0 cursor-pointer outline-none hover:underline"
            style={{ color: isDark ? 'rgba(241,245,244,0.45)' : '#5D6C66' }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>

          {/* Breadcrumb chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleChangeStandard}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-space font-semibold cursor-pointer border outline-none transition-all"
              style={{
                background: isDark ? 'rgba(16,185,129,0.10)' : '#D1FAE5',
                borderColor: 'rgba(16,185,129,0.25)',
                color: isDark ? '#34D399' : '#047857',
              }}
            >
              <GraduationCap size={12} />
              {stdDisplayName}
              <RotateCcw size={10} className="opacity-60" />
            </button>

            <span style={{ color: isDark ? 'rgba(241,245,244,0.3)' : '#A7B3AE', fontSize: 11 }}>›</span>

            <button
              type="button"
              onClick={handleChangeSubject}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-space font-semibold cursor-pointer border outline-none transition-all"
              style={{
                background: `${accentColor}15`,
                borderColor: `${accentColor}35`,
                color: accentColor,
              }}
            >
              <BookOpen size={12} />
              {subjDisplayName}
              <RotateCcw size={10} className="opacity-60" />
            </button>
          </div>
        </div>

        {/* ── Header Title ───────────────────────────────────────────────────── */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <span
              className="px-3.5 py-1 rounded-full text-[10px] font-orbitron font-bold tracking-widest uppercase"
              style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}35` }}
            >
              MISSION ROADMAP
            </span>
          </div>

          <h1
            className="text-2xl sm:text-4xl font-orbitron font-black tracking-tight mb-2"
            style={{ color: textHead }}
          >
            {subjDisplayName}{' '}
            <span style={{ color: accentColor }}>Adventure</span>
          </h1>
          <p className="text-xs sm:text-sm font-inter leading-relaxed" style={{ color: textSub }}>
            Complete chapters in sequence to unlock new challenges and achieve mastery in {stdDisplayName}.
          </p>
        </div>

        {/* ── Progress Summary Bar ────────────────────────────────────────────── */}
        <motion.div
          className="p-5 sm:p-6 rounded-3xl mb-10 w-full"
          style={{
            background: summaryCardBg,
            border: `1px solid ${summaryCardBorder}`,
            boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.35)' : '0 4px 20px rgba(15,23,42,0.06)',
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {/* Top stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5 text-center">
            <div className="p-3 rounded-2xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F6FAF8', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #DDE8E3' }}>
              <p className="font-orbitron font-black text-xl sm:text-2xl" style={{ color: accentColor }}>
                {completedCount}/{chapters.length}
              </p>
              <p className="text-[10px] font-space mt-1" style={{ color: textSub }}>Chapters Done</p>
            </div>

            <div className="p-3 rounded-2xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F6FAF8', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #DDE8E3' }}>
              <p className="font-orbitron font-black text-xl sm:text-2xl text-amber-400">
                {totalStars} ★
              </p>
              <p className="text-[10px] font-space mt-1" style={{ color: textSub }}>Stars Collected</p>
            </div>

            <div className="p-3 rounded-2xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F6FAF8', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #DDE8E3' }}>
              <p className="font-orbitron font-black text-xl sm:text-2xl" style={{ color: accentColor }}>
                {xp} XP
              </p>
              <p className="text-[10px] font-space mt-1" style={{ color: textSub }}>Total XP Earned</p>
            </div>

            <div className="p-3 rounded-2xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F6FAF8', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #DDE8E3' }}>
              <p className="font-orbitron font-black text-xl sm:text-2xl text-emerald-400">
                {overallPercentage}%
              </p>
              <p className="text-[10px] font-space mt-1" style={{ color: textSub }}>Journey Progress</p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs font-inter mb-1.5" style={{ color: textSub }}>
              <span>Overall Adventure Progress</span>
              <span className="font-orbitron font-bold" style={{ color: accentColor }}>{overallPercentage}% Complete</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden w-full" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#E5EFEA' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${accentColor}, #34D399)` }}
                initial={{ width: 0 }}
                animate={{ width: `${overallPercentage}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Content States ─────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw size={36} className="animate-spin" style={{ color: accentColor }} />
            <p className="text-xs font-orbitron tracking-widest uppercase" style={{ color: textSub }}>
              Loading your chapters...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-3xl p-8 text-center max-w-md mx-auto my-8 border" style={{ background: isDark ? 'rgba(239,68,68,0.08)' : '#FEF2F2', borderColor: isDark ? 'rgba(239,68,68,0.25)' : '#FECACA' }}>
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-sm font-inter mb-4" style={{ color: isDark ? '#FCA5A5' : '#991B1B' }}>{error}</p>
            <button
              onClick={loadChapters}
              className="px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs text-white cursor-pointer bg-red-600 hover:bg-red-500 border-0"
            >
              Retry
            </button>
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border" style={{ background: summaryCardBg, borderColor: summaryCardBorder }}>
            <BookOpen size={36} className="mx-auto mb-3 text-slate-500" />
            <p className="font-orbitron text-sm mb-1" style={{ color: textHead }}>No chapters available</p>
            <p className="text-xs font-inter" style={{ color: textSub }}>No chapters are available for this subject yet.</p>
          </div>
        ) : (
          /* ── Vertical Adventure Map Roadmap ── */
          <div className="relative flex flex-col items-center w-full">

            {/* START FLAG NODE */}
            <motion.div
              className="flex items-center gap-2 px-5 py-2 rounded-full mb-8 font-orbitron font-extrabold text-xs tracking-wider uppercase z-10"
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#050807',
                boxShadow: '0 0 20px rgba(16,185,129,0.4)',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Flag size={14} className="fill-slate-950" />
              <span>Journey Starts Here</span>
            </motion.div>

            {/* Vertical Connector Line & Chapters */}
            <div className="relative w-full flex flex-col items-center gap-8">
              {chapters.map((chapter, index) => {
                const statusInfo = chapterStatuses[index] || { isUnlocked: index === 0 };
                const isCurrent = index === currentChapterIndex && !statusInfo.isCompleted;
                const isLast = index === chapters.length - 1;

                return (
                  <div key={chapter.id || index} className="w-full flex flex-col items-center">
                    {/* Chapter Card */}
                    <ChapterCard
                      chapter={chapter}
                      index={index}
                      statusInfo={statusInfo}
                      isCurrent={isCurrent}
                      accentColor={accentColor}
                      isDark={isDark}
                      onSelect={handleSelectChapter}
                    />

                    {/* Path Connector to Next Node */}
                    {!isLast && (
                      <div className="w-full flex flex-col items-center py-2 relative">
                        <motion.div
                          className="w-1.5 h-10 rounded-full"
                          style={{
                            background: statusInfo.isCompleted
                              ? `linear-gradient(180deg, ${accentColor}, ${chapterStatuses[index + 1]?.isUnlocked ? accentColor : 'rgba(100,116,139,0.3)'})`
                              : isDark
                                ? 'rgba(255,255,255,0.08)'
                                : '#DDE8E3',
                            boxShadow: statusInfo.isCompleted ? `0 0 10px ${accentColor}60` : 'none',
                          }}
                          animate={isCurrent ? { opacity: [0.4, 1, 0.4] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <div
                          className="w-3 h-3 rounded-full -mt-1.5 border-2"
                          style={{
                            background: statusInfo.isCompleted ? accentColor : (isDark ? '#040810' : '#FFFFFF'),
                            borderColor: statusInfo.isCompleted ? accentColor : (isDark ? 'rgba(255,255,255,0.2)' : '#C8D9D2'),
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* FINALE NODE: SUBJECT MASTERY */}
            <div className="w-full flex flex-col items-center pt-8">
              <div
                className="w-1.5 h-10 rounded-full mb-3"
                style={{
                  background: completedCount === chapters.length
                    ? 'linear-gradient(180deg, #10B981, #F59E0B)'
                    : isDark ? 'rgba(255,255,255,0.08)' : '#DDE8E3',
                }}
              />

              <motion.div
                className="w-full max-w-xl rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden"
                style={{
                  background: completedCount === chapters.length
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.20), rgba(12,20,17,0.92))'
                    : isDark ? 'rgba(12,20,17,0.75)' : '#FFFFFF',
                  border: completedCount === chapters.length
                    ? '2px solid #F59E0B'
                    : isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #DDE8E3',
                  boxShadow: completedCount === chapters.length
                    ? '0 0 40px rgba(245,158,11,0.3)'
                    : 'none',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl"
                  style={{
                    background: completedCount === chapters.length ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.04)',
                    border: completedCount === chapters.length ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  🏆
                </div>

                <h3
                  className="font-orbitron font-black text-xl sm:text-2xl mb-2"
                  style={{ color: completedCount === chapters.length ? '#F59E0B' : textHead }}
                >
                  {completedCount === chapters.length
                    ? `${subjDisplayName} Master Unlocked!`
                    : `${subjDisplayName} Mastery`}
                </h3>

                <p className="text-xs sm:text-sm font-inter max-w-md mx-auto leading-relaxed" style={{ color: textSub }}>
                  {completedCount === chapters.length
                    ? `Congratulations! You have completed all chapters and mastered ${subjDisplayName} in ${stdDisplayName}.`
                    : `Complete all ${chapters.length} chapters to earn the prestigious ${subjDisplayName} Master badge and top leaderboard placement.`}
                </p>

                {completedCount === chapters.length && (
                  <motion.div
                    className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-orbitron font-bold text-xs text-slate-950 uppercase"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', boxShadow: '0 0 20px rgba(245,158,11,0.4)' }}
                    whileHover={{ scale: 1.04 }}
                  >
                    <Award size={16} />
                    <span>Mastery Certificate Claimed</span>
                  </motion.div>
                )}
              </motion.div>
            </div>

          </div>
        )}

      </PageContainer>
    </div>
  );
}
