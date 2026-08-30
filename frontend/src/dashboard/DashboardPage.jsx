import { motion } from 'framer-motion';
import { useCallback } from 'react';
import {
  Zap, Flame, Clock, Play,
  CheckCircle2, GraduationCap, BookOpen,
  RotateCcw, ChevronRight, Sparkles, Trophy,
  FlaskConical, Calculator, Languages, Globe,
  BookText, Leaf, Terminal, Atom, Microscope,
  TrendingUp,
} from 'lucide-react';
import { DashCard, SectionHeader, AnimatedCounter } from './DashComponents';
import { ProgressChart, AccuracyChart } from './Charts';
import ContinueLearningCard from './ContinueLearningCard';
import { dailyChallenge } from './mockData';
import { registerCharts } from './chartConfig';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getSubjectsForStandard } from '../config/curriculumConfig';

registerCharts();

// ─── Animation variants ───────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Icon resolver ────────────────────────────────────────────────────────────
const ICON_MAP = {
  FlaskConical, Zap, Calculator, Languages, Globe,
  BookText, Leaf, Terminal, Atom, Microscope,
};
const resolveIcon = (name) => ICON_MAP[name] || BookOpen;

// ─── Standards meta (display names) ──────────────────────────────────────────
const STANDARD_DISPLAY = {
  'grade-4': '4th Standard', 'grade-5': '5th Standard',
  'grade-6': '6th Standard', 'grade-7': '7th Standard',
  'grade-8': '8th Standard', 'grade-9': '9th Standard',
  'grade-10': '10th Standard', 'grade-11': '11th Standard',
  'grade-12': '12th Standard',
};

// ─── Level title from level + subject ─────────────────────────────────────────
function getLevelTitle(level, subjectName) {
  const sub = subjectName || 'Learning';
  if (level < 3)  return `${sub} Beginner`;
  if (level < 6)  return `${sub} Explorer`;
  if (level < 10) return `${sub} Practitioner`;
  if (level < 15) return `${sub} Specialist`;
  return `${sub} Master`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBJECT CONTEXT BANNER — shows selected standard + subject with switchers
// ─────────────────────────────────────────────────────────────────────────────
function SubjectContextBanner({ onChangeStandard, onChangeSubject, isDark }) {
  const {
    selectedStandardId, selectedStandard,
    selectedSubjectId, selectedSubject,
  } = useNavigation();

  const stdName  = selectedStandard || STANDARD_DISPLAY[selectedStandardId] || 'No Standard';
  const subjName = selectedSubject  || 'No Subject';

  // Get subject config for accent color
  const subjects    = getSubjectsForStandard(selectedStandardId);
  const subjConfig  = subjects.find(s => s.id === selectedSubjectId);
  const accentColor = subjConfig?.color || '#10B981';

  const bannerBg     = isDark ? 'rgba(12,20,17,0.82)'   : '#FFFFFF';
  const bannerBorder = isDark ? 'rgba(167,243,208,0.14)' : '#DDE8E3';
  const textMuted    = isDark ? 'rgba(241,245,244,0.45)' : '#5D6C66';

  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl mb-5 min-w-0 w-full"
      style={{
        background: bannerBg,
        border: `1px solid ${bannerBorder}`,
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(15,23,42,0.07)',
      }}
    >
      {/* Left: standard + subject chips */}
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        {/* Standard chip */}
        <button
          type="button"
          id="dashboard-change-standard-btn"
          onClick={onChangeStandard}
          title="Change standard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-space font-semibold cursor-pointer border outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap"
          style={{
            background: isDark ? 'rgba(16,185,129,0.10)' : '#D1FAE5',
            borderColor: 'rgba(16,185,129,0.30)',
            color: isDark ? '#34D399' : '#047857',
          }}
        >
          <GraduationCap size={12} />
          {stdName}
          <RotateCcw size={10} className="opacity-60" />
        </button>

        <span style={{ color: textMuted, fontSize: 11 }}>›</span>

        {/* Subject chip */}
        <button
          type="button"
          id="dashboard-change-subject-btn"
          onClick={onChangeSubject}
          title="Change subject"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-space font-semibold cursor-pointer border outline-none transition-all focus-visible:ring-2 whitespace-nowrap"
          style={{
            background: `${accentColor}15`,
            borderColor: `${accentColor}40`,
            color: accentColor,
          }}
        >
          <BookOpen size={12} />
          {subjName}
          <RotateCcw size={10} className="opacity-60" />
        </button>
      </div>

      {/* Right: label */}
      <p className="text-[11px] font-inter flex-shrink-0" style={{ color: textMuted }}>
        Click to change your standard or subject
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME HEADER — subject-aware
// ─────────────────────────────────────────────────────────────────────────────
function WelcomeHeader({ isDark }) {
  const { xp, level, streak, selectedStandardId, selectedStandard, selectedSubjectId, selectedSubject } = useNavigation();
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const userName   = user?.name || 'Student';
  const stdName    = selectedStandard || STANDARD_DISPLAY[selectedStandardId] || '';
  const subjName   = selectedSubject  || '';

  // Get subject icon and accent
  const subjects    = getSubjectsForStandard(selectedStandardId);
  const subjConfig  = subjects.find(s => s.id === selectedSubjectId);
  const accentColor = subjConfig?.color || '#10B981';
  const SubjIcon    = resolveIcon(subjConfig?.icon);
  const levelTitle  = getLevelTitle(level, subjName);

  const textMuted   = isDark ? 'rgba(241,245,244,0.45)' : '#5D6C66';
  const textPrimary = isDark ? '#F1F5F4' : '#10201A';

  return (
    <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 min-w-0 w-full">
      <div className="flex items-center gap-4 min-w-0">
        {/* Avatar with subject icon */}
        <div className="relative flex-shrink-0">
          <motion.div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}08)`,
              border: `2px solid ${accentColor}35`,
              boxShadow: `0 0 30px ${accentColor}18`,
            }}
            animate={{ boxShadow: [`0 0 20px ${accentColor}10`, `0 0 40px ${accentColor}28`, `0 0 20px ${accentColor}10`] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <SubjIcon size={26} style={{ color: accentColor }} />
          </motion.div>
          {/* Level badge */}
          <div
            className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-orbitron font-extrabold text-slate-950"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`, boxShadow: `0 0 12px ${accentColor}50` }}
          >
            Lvl {level}
          </div>
        </div>

        {/* Name + subject context */}
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-inter" style={{ color: textMuted }}>{greeting},</p>
          <h1
            className="font-orbitron font-black text-xl sm:text-2xl md:text-3xl leading-tight truncate"
            style={{ color: textPrimary }}
          >
            {userName}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {stdName && (
              <span className="text-xs font-space" style={{ color: textMuted }}>{stdName}</span>
            )}
            {stdName && subjName && (
              <span className="w-1 h-1 rounded-full bg-white/15 hidden sm:inline-block" />
            )}
            {subjName && (
              <span
                className="text-[10px] sm:text-xs font-space px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30`, color: accentColor }}
              >
                {levelTitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: streak + XP */}
      <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
        <motion.div
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
          style={{ background: 'rgba(251,146,60,0.10)', border: '1px solid rgba(251,146,60,0.20)' }}
          animate={{ borderColor: ['rgba(251,146,60,0.2)', 'rgba(251,146,60,0.4)', 'rgba(251,146,60,0.2)'] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <Flame size={16} className="text-orange-400" />
          <div>
            <p className="font-orbitron font-black text-base sm:text-lg text-orange-400 leading-none">{streak}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-space leading-none mt-0.5">Day Streak</p>
          </div>
        </motion.div>

        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
          style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}30` }}
        >
          <Zap size={15} style={{ color: accentColor }} />
          <div>
            <p className="font-orbitron font-black text-base sm:text-lg leading-none" style={{ color: accentColor }}>{xp} XP</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-space leading-none mt-0.5">Total XP</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS ROW — subject-aware labels
// ─────────────────────────────────────────────────────────────────────────────
function StatsRow({ isDark }) {
  const { xp, coins, streak, userProgressList, selectedSubjectId, selectedStandardId } = useNavigation();
  const completedCount = userProgressList.filter(p => p.isCompleted).length;

  // Subject accent
  const subjects    = getSubjectsForStandard(selectedStandardId);
  const subjConfig  = subjects.find(s => s.id === selectedSubjectId);
  const accent      = subjConfig?.color || '#10B981';

  const cardBg   = isDark ? undefined : '#FFFFFF';
  const cardBord = isDark ? undefined : '#DDE8E3';

  const stats = [
    { icon: <Zap size={16} style={{ color: accent }} />,          label: 'Total XP',           value: xp,             color: accent },
    { icon: <span className="text-amber-400 text-base">🪙</span>,  label: 'Coins',              value: coins,          color: '#F59E0B' },
    { icon: <Flame size={16} className="text-orange-400" />,       label: 'Day Streak',         value: streak,         color: '#F97316' },
    { icon: <Clock size={16} className="text-emerald-300" />,      label: 'Study Time',         value: '0h',           color: '#34D399' },
    { icon: <CheckCircle2 size={16} style={{ color: accent }} />,  label: 'Missions Complete',  value: completedCount, color: accent },
    { icon: <Trophy size={16} className="text-amber-400" />,       label: 'Rank',               value: '—',            color: '#F59E0B' },
  ];

  return (
    <motion.div
      variants={stagger}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5 w-full min-w-0"
    >
      {stats.map(s => (
        <motion.div key={s.label} variants={fadeUp} className="min-w-0 w-full">
          <DashCard
            className="p-3.5 sm:p-4 min-w-0 w-full flex flex-col justify-between"
            glow={`${s.color}08`}
            style={cardBg ? { background: cardBg, border: `1px solid ${cardBord}` } : {}}
          >
            <div className="flex items-center justify-between mb-2 min-w-0">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
                {s.icon}
              </div>
            </div>
            <p className="font-orbitron font-black text-lg sm:text-xl text-white leading-none truncate">
              {typeof s.value === 'number'
                ? <AnimatedCounter value={s.value} duration={1.5} />
                : s.value}
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-space mt-1 truncate">{s.label}</p>
            <div className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ background: `linear-gradient(90deg,transparent,${s.color}50,transparent)` }} />
          </DashCard>
        </motion.div>
      ))}
    </motion.div>
  );
}



// ─────────────────────────────────────────────────────────────────────────────
// SUBJECT SUMMARY CARD
// ─────────────────────────────────────────────────────────────────────────────
function SubjectSummaryCard({ isDark }) {
  const {
    xp, userProgressList,
    selectedStandardId, selectedStandard,
    selectedSubjectId,  selectedSubject,
  } = useNavigation();

  const subjects    = getSubjectsForStandard(selectedStandardId);
  const subjConfig  = subjects.find(s => s.id === selectedSubjectId);
  const accent      = subjConfig?.color || '#10B981';
  const chapterCount = subjConfig?.chapterCount;

  const completedCount = userProgressList.filter(p => p.isCompleted).length;
  const totalRooms     = userProgressList.length || 0;
  const accuracy       = totalRooms > 0
    ? Math.round((userProgressList.filter(p => p.isCompleted).length / totalRooms) * 100)
    : 0;

  const subjName  = selectedSubject  || 'No Subject';
  const stdName   = selectedStandard || STANDARD_DISPLAY[selectedStandardId] || '';

  const textMuted  = isDark ? 'rgba(241,245,244,0.45)' : '#5D6C66';
  const cardBg     = isDark ? 'rgba(12,20,17,0.82)'   : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(167,243,208,0.14)' : '#DDE8E3';

  const overallPct = completedCount > 0 && chapterCount
    ? Math.round((completedCount / chapterCount) * 100)
    : 0;

  const summaryStats = [
    { label: 'Chapters Completed', value: chapterCount ? `${completedCount}/${chapterCount}` : `${completedCount}` },
    { label: 'Total XP Earned',    value: `${xp}` },
    { label: 'Avg Accuracy',       value: `${accuracy}%` },
    { label: 'Missions Done',      value: `${completedCount}` },
  ];

  return (
    <motion.div variants={fadeUp} className="min-w-0 w-full">
      <DashCard
        className="p-5 sm:p-6 min-w-0 w-full"
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <SectionHeader
          title={`${subjName} Progress`}
          subtitle={stdName}
          icon={TrendingUp}
          color={accent}
        />

        {/* Overall bar */}
        {chapterCount && (
          <div className="mb-5">
            <div className="flex justify-between text-xs font-inter mb-1.5" style={{ color: textMuted }}>
              <span>Overall Progress</span>
              <span className="font-orbitron font-bold" style={{ color: accent }}>{overallPct}%</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden w-full" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#E5EFEA' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${accent}, ${accent}AA)` }}
                initial={{ width: 0 }}
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {summaryStats.map(({ label, value }) => (
            <div
              key={label}
              className="p-3 rounded-xl"
              style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F6FAF8', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #DDE8E3' }}
            >
              <p className="font-orbitron font-black text-lg" style={{ color: accent }}>{value}</p>
              <p className="text-[10px] font-space mt-0.5" style={{ color: textMuted }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Empty state for new user */}
        {completedCount === 0 && xp === 0 && (
          <div className="mt-4 p-3 rounded-xl text-center" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : '#F0F7F4', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #DDE8E3' }}>
            <p className="text-xs font-inter" style={{ color: textMuted }}>
              🌱 Start your first mission to build your progress here.
            </p>
          </div>
        )}
      </DashCard>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY CHALLENGE CARD (reused, subject-aware label only)
// ─────────────────────────────────────────────────────────────────────────────
function DailyChallengeCard({ isDark }) {
  const { selectedSubject } = useNavigation();
  const subjName = selectedSubject || 'Learning';

  const cardBg     = isDark ? 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(16,185,129,0.06) 100%)' : 'linear-gradient(135deg, #FFFBEB, #F0FFF4)';
  const cardBorder = isDark ? 'rgba(245,158,11,0.18)' : '#FDE68A';
  const textMuted  = isDark ? 'rgba(241,245,244,0.50)' : '#5D6C66';

  return (
    <motion.div variants={fadeUp} className="min-w-0 w-full">
      <DashCard
        className="p-5 sm:p-6 mb-5 relative overflow-hidden min-w-0 w-full"
        id="daily-challenge-card"
        style={{ background: cardBg, border: `1px solid ${cardBorder}` }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 min-w-0">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
              ⚡
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-space text-amber-400 font-bold uppercase tracking-wider">DAILY CHALLENGE</span>
                <span className="text-[10px] font-space px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  {dailyChallenge.difficulty}
                </span>
              </div>
              <h3 className="font-space font-bold text-white text-base sm:text-lg mb-1 truncate">
                {subjName} Daily Sprint
              </h3>
              <p className="text-xs sm:text-sm font-inter line-clamp-2" style={{ color: textMuted }}>
                Complete today's {subjName} challenge to earn bonus XP and maintain your streak.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 flex-shrink-0 min-w-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
            <div className="flex items-center gap-3 text-xs font-space flex-wrap">
              <span className="text-emerald-400 font-bold">+{dailyChallenge.xpReward} XP</span>
              <span className="text-amber-400 font-bold">+{dailyChallenge.coinReward} Coins</span>
              <span className="text-slate-400 font-mono">{dailyChallenge.timeLeft} left</span>
            </div>
            <button
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-orbitron font-extrabold text-xs uppercase tracking-wider cursor-pointer whitespace-nowrap w-full sm:w-auto border-0"
            >
              Accept Challenge
            </button>
          </div>
        </div>
      </DashCard>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY / SETUP STATE — no standard or no subject
// ─────────────────────────────────────────────────────────────────────────────
function SetupPrompt({ type, onAction, isDark }) {
  const textMuted = isDark ? 'rgba(241,245,244,0.50)' : '#5D6C66';
  const textHead  = isDark ? '#F1F5F4' : '#10201A';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center px-4"
    >
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)' }}>
        {type === 'standard' ? '🎓' : '📚'}
      </div>
      <div>
        <h2 className="font-orbitron font-black text-xl sm:text-2xl mb-2" style={{ color: textHead }}>
          {type === 'standard' ? 'Choose Your Standard' : 'Choose Your Subject'}
        </h2>
        <p className="text-sm font-inter max-w-sm mx-auto" style={{ color: textMuted }}>
          {type === 'standard'
            ? 'Select your academic standard to personalise your dashboard.'
            : 'Select a subject to start your learning journey.'}
        </p>
      </div>
      <motion.button
        type="button"
        onClick={onAction}
        className="flex items-center gap-2 px-6 py-3 rounded-xl font-orbitron font-bold text-sm tracking-wider text-slate-950 cursor-pointer border-0"
        style={{ background: 'linear-gradient(135deg, #10B981, #059669)', boxShadow: '0 0 24px rgba(16,185,129,0.35)' }}
        whileHover={{ scale: 1.04, boxShadow: '0 0 36px rgba(16,185,129,0.5)' }}
        whileTap={{ scale: 0.97 }}
      >
        <Sparkles size={16} />
        {type === 'standard' ? 'Select Standard' : 'Select Subject'}
      </motion.button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const {
    navigateTo,
    selectedStandardId,
    selectedSubjectId,
    setSelectedSubjectId, setSelectedSubject,
  } = useNavigation();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const hasStandard = !!selectedStandardId;
  const hasSubject  = !!selectedSubjectId;

  // ── User-scoped localStorage helpers ────────────────────────────────────────
  const PREF_KEY = 'preferences';
  const scopedKey     = (uid, k) => uid ? `chemescape:user:${uid}:${k}` : null;
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

  // ── Change standard handler ──────────────────────────────────────────────────
  const handleChangeStandard = useCallback(() => {
    // Clear subject in prefs
    if (user?.id) {
      const existing = scopedGetJSON(user.id, PREF_KEY) || {};
      scopedSetJSON(user.id, PREF_KEY, { ...existing, selectedSubjectId: null, selectedSubjectName: null });
    }
    setSelectedSubjectId(null);
    setSelectedSubject('');
    navigateTo('select-standard');
  }, [user, navigateTo, setSelectedSubjectId, setSelectedSubject]);

  // ── Change subject handler ───────────────────────────────────────────────────
  const handleChangeSubject = useCallback(() => {
    navigateTo('select-subject');
  }, [navigateTo]);

  // ── Background style ─────────────────────────────────────────────────────────
  const pageBg = isDark ? '#050807' : '#F6FAF8';

  // ── Subject accent for glows ─────────────────────────────────────────────────
  const subjects   = getSubjectsForStandard(selectedStandardId);
  const subjConfig = subjects.find(s => s.id === selectedSubjectId);
  const accent     = subjConfig?.color || '#10B981';

  return (
    <div
      className="relative min-h-screen text-white overflow-x-hidden w-full"
      style={{ background: pageBg }}
    >
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: `radial-gradient(ellipse 60% 40% at 80% 20%, ${accent}0C 0%, transparent 60%)` }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: `radial-gradient(circle, ${accent}06 0%, transparent 70%)` }} />
      {isDark && <div className="fixed inset-0 lab-grid opacity-10 pointer-events-none z-0" />}

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 py-6 w-full min-w-0 box-border">

        {/* ── SETUP PROMPTS ── */}
        {!hasStandard ? (
          <SetupPrompt type="standard" onAction={() => navigateTo('select-standard')} isDark={isDark} />
        ) : !hasSubject ? (
          <SetupPrompt type="subject" onAction={() => navigateTo('select-subject')} isDark={isDark} />
        ) : (
          /* ── FULL DASHBOARD ── */
          <motion.div variants={stagger} initial="hidden" animate="show" className="w-full min-w-0">

            {/* Subject context banner with switchers */}
            <SubjectContextBanner
              onChangeStandard={handleChangeStandard}
              onChangeSubject={handleChangeSubject}
              isDark={isDark}
            />

            {/* Welcome header */}
            <WelcomeHeader isDark={isDark} />

            {/* Stats row */}
            <StatsRow isDark={isDark} />

            {/* Continue Learning / Current Mission */}
            <ContinueLearningCard />

            {/* Daily Challenge */}
            <DailyChallengeCard isDark={isDark} />

            {/* Bottom section: charts + subject summary */}
            <div className="mt-2 grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0">
              {/* Left: Charts */}
              <div className="lg:col-span-2 flex flex-col gap-6 min-w-0 w-full">
                <motion.div variants={fadeUp} className="min-w-0 w-full">
                  <ProgressChart />
                </motion.div>
              </div>

              {/* Right: Accuracy + Subject Summary */}
              <div className="flex flex-col gap-6 min-w-0 w-full">
                <motion.div variants={fadeUp} className="min-w-0 w-full">
                  <AccuracyChart />
                </motion.div>
                <SubjectSummaryCard isDark={isDark} />
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}
