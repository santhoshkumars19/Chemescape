import { motion } from 'framer-motion';
import { useCallback, useState } from 'react';
import {
  Zap, Flame, Clock, Play,
  CheckCircle2, GraduationCap, BookOpen,
  RotateCcw, ChevronRight, Sparkles, Trophy, Star,
  FlaskConical, Calculator, Languages, Globe,
  BookText, Leaf, Terminal, Atom, Microscope,
  TrendingUp, Compass, Palette, Award, HelpCircle,
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

  const subjects    = getSubjectsForStandard(selectedStandardId);
  const subjConfig  = subjects.find(s => s.id === selectedSubjectId);
  const accentColor = subjConfig?.color || '#10B981';

  return (
    <motion.div
      variants={fadeUp}
      className="card-modern flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 mb-5 min-w-0 w-full"
    >
      {/* Left: standard + subject chips */}
      <div className="flex items-center gap-2 flex-wrap min-w-0">
        {/* Standard chip */}
        <button
          type="button"
          id="dashboard-change-standard-btn"
          onClick={onChangeStandard}
          title="Change standard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading font-semibold cursor-pointer border outline-none transition-all hover:scale-105 whitespace-nowrap"
          style={{
            background: isDark ? 'rgba(16,185,129,0.12)' : '#E8F5E9',
            borderColor: isDark ? 'rgba(16,185,129,0.25)' : '#C8E6C9',
            color: isDark ? '#34D399' : '#0C3B2E',
          }}
        >
          <GraduationCap size={13} />
          <span>{stdName}</span>
          <RotateCcw size={10} className="opacity-60" />
        </button>

        <span className="text-slate-400 text-xs">›</span>

        {/* Subject chip */}
        <button
          type="button"
          id="dashboard-change-subject-btn"
          onClick={onChangeSubject}
          title="Change subject"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-heading font-semibold cursor-pointer border outline-none transition-all hover:scale-105 whitespace-nowrap"
          style={{
            background: isDark ? `${accentColor}15` : '#F0FDF4',
            borderColor: isDark ? `${accentColor}30` : '#BBF7D0',
            color: isDark ? accentColor : '#0C3B2E',
          }}
        >
          <BookOpen size={13} />
          <span>{subjName}</span>
          <RotateCcw size={10} className="opacity-60" />
        </button>
      </div>

      {/* Right: label */}
      <p className="text-xs text-[var(--text-muted)] font-medium flex-shrink-0">
        Click chips above to switch standard or subject anytime
      </p>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME HEADER — clean typography
// ─────────────────────────────────────────────────────────────────────────────
function WelcomeHeader({ isDark }) {
  const { xp, level, streak, selectedStandardId, selectedStandard, selectedSubjectId, selectedSubject } = useNavigation();
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const rawUserName = user?.name || 'Student';
  const userName = (rawUserName === 'Student Chemist' || rawUserName === 'Student Agent') ? 'Student Scholar' : rawUserName;
  const stdName    = selectedStandard || STANDARD_DISPLAY[selectedStandardId] || '';
  const subjName   = selectedSubject  || '';

  const subjects    = getSubjectsForStandard(selectedStandardId);
  const subjConfig  = subjects.find(s => s.id === selectedSubjectId);
  const accentColor = subjConfig?.color || '#10B981';
  const SubjIcon    = resolveIcon(subjConfig?.icon);
  const levelTitle  = getLevelTitle(level, subjName);

  return (
    <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 min-w-0 w-full">
      <div className="flex items-center gap-4 min-w-0">
        {/* Avatar with subject icon */}
        <div className="relative flex-shrink-0">
          <div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-md"
            style={{
              background: isDark ? 'linear-gradient(135deg, #112820, #0C3B2E)' : 'linear-gradient(135deg, #E8F5E9, #C8E6C9)',
              border: isDark ? '1.5px solid rgba(52,211,153,0.25)' : '1.5px solid rgba(12,59,46,0.15)',
            }}
          >
            <SubjIcon size={28} className={isDark ? 'text-emerald-400' : 'text-[#0C3B2E]'} />
          </div>
          {/* Level badge */}
          <div
            className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 rounded-full text-[10px] font-heading font-extrabold text-white"
            style={{ background: '#0C3B2E', border: '1.5px solid #10B981' }}
          >
            Lvl {level}
          </div>
        </div>

        {/* Name + subject context */}
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">{greeting},</p>
          <h1 className="font-heading font-extrabold text-xl sm:text-2xl md:text-3xl leading-tight text-[var(--text-main)] truncate">
            {userName}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {stdName && (
              <span className="text-xs text-[var(--text-secondary)] font-medium">{stdName}</span>
            )}
            {stdName && subjName && (
              <span className="w-1 h-1 rounded-full bg-emerald-500/40 hidden sm:inline-block" />
            )}
            {subjName && (
              <span
                className="text-[11px] font-heading font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap"
                style={{
                  background: isDark ? 'rgba(52,211,153,0.12)' : '#E8F5E9',
                  border: isDark ? '1px solid rgba(52,211,153,0.25)' : '1px solid #A7F3D0',
                  color: isDark ? '#34D399' : '#0C3B2E',
                }}
              >
                {levelTitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: streak + XP */}
      <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
          style={{
            background: isDark ? 'rgba(249,115,22,0.12)' : '#FFF7ED',
            border: isDark ? '1px solid rgba(249,115,22,0.25)' : '1px solid #FFEDD5',
          }}
        >
          <Flame size={18} className="text-orange-500 fill-orange-500" />
          <div>
            <p className="font-heading font-extrabold text-base sm:text-lg text-orange-500 leading-none">{streak}</p>
            <p className="text-[10px] text-[var(--text-muted)] font-medium leading-none mt-0.5">Day Streak</p>
          </div>
        </div>

        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
          style={{
            background: isDark ? 'rgba(16,185,129,0.12)' : '#F0FDF4',
            border: isDark ? '1px solid rgba(16,185,129,0.25)' : '1px solid #DCFCE7',
          }}
        >
          <Zap size={18} className="text-emerald-500 fill-emerald-500" />
          <div>
            <p className="font-heading font-extrabold text-base sm:text-lg text-emerald-600 dark:text-emerald-400 leading-none">{xp} XP</p>
            <p className="text-[10px] text-[var(--text-muted)] font-medium leading-none mt-0.5">Total XP</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STATS ROW — modern rounded cards
// ─────────────────────────────────────────────────────────────────────────────
function StatsRow({ isDark }) {
  const { xp, coins, streak, userProgressList, selectedSubjectId, selectedStandardId } = useNavigation();
  const completedCount = userProgressList.filter(p => p.isCompleted).length;

  const stats = [
    { icon: <Zap size={16} className="text-emerald-500" />,         label: 'Total XP',          value: xp,             color: '#10B981' },
    { icon: <span className="text-amber-500 text-sm">🪙</span>,     label: 'Coins Earned',      value: coins,          color: '#F59E0B' },
    { icon: <Flame size={16} className="text-orange-500" />,        label: 'Day Streak',        value: streak,         color: '#F97316' },
    { icon: <Clock size={16} className="text-teal-500" />,          label: 'Study Time',        value: '2.5h',         color: '#14B8A6' },
    { icon: <CheckCircle2 size={16} className="text-emerald-500" />, label: 'Quizzes Solved',  value: completedCount, color: '#10B981' },
    { icon: <Trophy size={16} className="text-amber-500" />,        label: 'Global Rank',       value: '#12',          color: '#F59E0B' },
  ];

  return (
    <motion.div
      variants={stagger}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 w-full min-w-0"
    >
      {stats.map(s => (
        <motion.div key={s.label} variants={fadeUp} className="min-w-0 w-full">
          <div className="card-modern p-4 min-w-0 w-full flex flex-col justify-between h-full">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 flex-shrink-0"
              style={{
                background: isDark ? `${s.color}15` : `${s.color}10`,
                border: `1px solid ${s.color}30`,
              }}>
              {s.icon}
            </div>
            <div>
              <p className="font-heading font-extrabold text-lg sm:text-xl text-[var(--text-main)] leading-none truncate">
                {typeof s.value === 'number'
                  ? <AnimatedCounter value={s.value} duration={1.2} />
                  : s.value}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] font-medium mt-1 truncate">{s.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POPULAR QUIZZES SECTION (Direct Match to Reference Image)
// ─────────────────────────────────────────────────────────────────────────────
function PopularQuizzesSection({ isDark }) {
  const { navigateTo, setSelectedSubjectId, setSelectedSubject } = useNavigation();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    { id: 'All', label: 'All', icon: Sparkles },
    { id: 'science', label: 'Science', icon: FlaskConical },
    { id: 'mathematics', label: 'Math', icon: Calculator },
    { id: 'social-science', label: 'History', icon: Globe },
    { id: 'english', label: 'Languages', icon: Languages },
  ];

  const popularQuizzes = [
    {
      id: 'quiz-math',
      title: 'Math Mastery Quiz',
      subjectId: 'mathematics',
      subjectName: 'Mathematics',
      questionsCount: 15,
      rating: 4.9,
      reviews: 142,
      difficulty: 'Intermediate',
      color: '#3B82F6',
      icon: Calculator,
      badge: 'POPULAR 🔥',
    },
    {
      id: 'quiz-science',
      title: 'Science Discovery Quiz',
      subjectId: 'science',
      subjectName: 'Science',
      questionsCount: 20,
      rating: 4.8,
      reviews: 218,
      difficulty: 'All Levels',
      color: '#10B981',
      icon: FlaskConical,
      badge: 'TRENDING',
    },
    {
      id: 'quiz-history',
      title: 'World History Sprint',
      subjectId: 'social-science',
      subjectName: 'Social Science',
      questionsCount: 12,
      rating: 4.7,
      reviews: 98,
      difficulty: 'Beginner',
      color: '#F59E0B',
      icon: Globe,
      badge: 'HOT',
    },
    {
      id: 'quiz-english',
      title: 'Vocabulary & Grammar Quiz',
      subjectId: 'english',
      subjectName: 'English',
      questionsCount: 18,
      rating: 4.9,
      reviews: 185,
      difficulty: 'Intermediate',
      color: '#8B5CF6',
      icon: BookText,
      badge: 'TOP RATED',
    },
  ];

  const filteredQuizzes = activeCategory === 'All'
    ? popularQuizzes
    : popularQuizzes.filter(q => q.subjectId === activeCategory);

  const handleStartQuiz = (quiz) => {
    setSelectedSubjectId(quiz.subjectId);
    setSelectedSubject(quiz.subjectName);
    navigateTo('chapters');
  };

  return (
    <motion.div variants={fadeUp} className="mb-8 w-full min-w-0">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[var(--text-main)]">
            Popular Quizzes 🔥
          </h3>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
            Explore curated topic quizzes and test your knowledge
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('chapters')}
          className="text-xs font-heading font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-0"
        >
          <span>View All</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Category Pills Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {categories.map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-heading font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'pill-btn-forest shadow-md'
                  : 'pill-btn-outline'
              }`}
            >
              <Icon size={13} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quiz Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredQuizzes.map(quiz => {
          const QuizIcon = quiz.icon;
          return (
            <div
              key={quiz.id}
              className="card-modern p-5 flex flex-col justify-between hover:shadow-lg transition-all group"
            >
              <div>
                {/* Top badge and icon */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
                    style={{
                      background: isDark ? `${quiz.color}18` : `${quiz.color}12`,
                      border: `1px solid ${quiz.color}30`,
                    }}
                  >
                    <QuizIcon size={22} style={{ color: quiz.color }} />
                  </div>

                  <span
                    className="text-[10px] font-heading font-extrabold uppercase px-2.5 py-0.5 rounded-full"
                    style={{
                      background: isDark ? 'rgba(52,211,153,0.15)' : '#E8F5E9',
                      color: isDark ? '#34D399' : '#0C3B2E',
                      border: isDark ? '1px solid rgba(52,211,153,0.3)' : '1px solid #A7F3D0',
                    }}
                  >
                    {quiz.badge}
                  </span>
                </div>

                {/* Title */}
                <h4 className="font-heading font-bold text-base text-[var(--text-main)] mb-1 group-hover:text-emerald-500 transition-colors">
                  {quiz.title}
                </h4>

                {/* Info: Questions & Rating */}
                <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mb-4">
                  <span>{quiz.questionsCount} Questions</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-semibold text-amber-500">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {quiz.rating}
                  </span>
                </div>
              </div>

              {/* Start Quiz Pill Button */}
              <button
                type="button"
                onClick={() => handleStartQuiz(quiz)}
                className="w-full pill-btn-forest text-xs font-heading font-bold flex items-center justify-center gap-2 cursor-pointer transition-transform group-hover:scale-[1.02]"
              >
                <span>Start Quiz</span>
                <ChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
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
  const chapterCount = subjConfig?.chapterCount || 10;

  const completedCount = userProgressList.filter(p => p.isCompleted).length;
  const totalRooms     = userProgressList.length || 0;
  const accuracy       = totalRooms > 0
    ? Math.round((userProgressList.filter(p => p.isCompleted).length / totalRooms) * 100)
    : 85;

  const subjName  = selectedSubject  || 'Subject';
  const stdName   = selectedStandard || STANDARD_DISPLAY[selectedStandardId] || '';

  const overallPct = completedCount > 0 && chapterCount
    ? Math.round((completedCount / chapterCount) * 100)
    : 25;

  const summaryStats = [
    { label: 'Chapters Cleared', value: chapterCount ? `${completedCount}/${chapterCount}` : `${completedCount}` },
    { label: 'Total XP Earned',  value: `${xp}` },
    { label: 'Avg Accuracy',     value: `${accuracy}%` },
    { label: 'Missions Done',    value: `${completedCount}` },
  ];

  return (
    <motion.div variants={fadeUp} className="min-w-0 w-full">
      <div className="card-modern p-5 sm:p-6 min-w-0 w-full">
        <SectionHeader
          title={`${subjName} Progress`}
          subtitle={stdName}
          icon={TrendingUp}
          color="#0C3B2E"
        />

        {/* Overall progress bar */}
        <div className="mb-5 mt-2">
          <div className="flex justify-between text-xs font-medium mb-1.5 text-[var(--text-muted)]">
            <span>Curriculum Completion</span>
            <span className="font-heading font-bold text-emerald-600 dark:text-emerald-400">{overallPct}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden w-full bg-emerald-500/10">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #0C3B2E, #10B981)' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(overallPct, 8)}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {summaryStats.map(({ label, value }) => (
            <div
              key={label}
              className="p-3.5 rounded-2xl"
              style={{
                background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAF9',
                border: isDark ? '1px solid rgba(52,211,153,0.12)' : '1px solid #E5EBE8',
              }}
            >
              <p className="font-heading font-extrabold text-lg text-[var(--text-main)]">{value}</p>
              <p className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY CHALLENGE CARD
// ─────────────────────────────────────────────────────────────────────────────
function DailyChallengeCard({ isDark }) {
  const { selectedSubject, navigateTo } = useNavigation();
  const subjName = selectedSubject || 'Learning';

  return (
    <motion.div variants={fadeUp} className="min-w-0 w-full mb-6">
      <div
        className="card-modern p-5 sm:p-6 relative overflow-hidden min-w-0 w-full"
        id="daily-challenge-card"
        style={{
          borderLeft: '4px solid #10B981',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 min-w-0">
          <div className="flex items-start gap-4 min-w-0 flex-1">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-sm"
              style={{ background: isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              ⚡
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-heading font-extrabold text-amber-500 uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  Daily Challenge
                </span>
                <span className="text-[10px] font-heading font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {dailyChallenge.difficulty || 'Intermediate'}
                </span>
              </div>
              <h3 className="font-heading font-bold text-[var(--text-main)] text-base sm:text-lg mb-1 truncate">
                {subjName} Daily Sprint
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium line-clamp-2">
                Complete today's {subjName} challenge to earn bonus XP and maintain your day streak!
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 flex-shrink-0 min-w-0 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--border-primary)]">
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">+{dailyChallenge.xpReward || 250} XP</span>
              <span className="text-amber-500">🪙 +{dailyChallenge.coinReward || 50}</span>
              <span className="text-[var(--text-muted)]">{dailyChallenge.timeLeft || '14h left'}</span>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('chapters')}
              className="pill-btn-forest text-xs font-heading font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap w-full sm:w-auto"
            >
              Accept Challenge
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SETUP STATE — no standard or no subject
// ─────────────────────────────────────────────────────────────────────────────
function SetupPrompt({ type, onAction, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center px-4"
    >
      <div
        className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-lg"
        style={{ background: isDark ? '#112820' : '#E8F5E9', border: '1.5px solid #10B981' }}
      >
        {type === 'standard' ? '🎓' : '📚'}
      </div>
      <div>
        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl mb-2 text-[var(--text-main)]">
          {type === 'standard' ? 'Choose Your Standard' : 'Choose Your Subject'}
        </h2>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
          {type === 'standard'
            ? 'Select your academic standard to personalize your dashboard and unlock chapter quizzes.'
            : 'Select a subject to start your learning journey and solve challenges.'}
        </p>
      </div>
      <motion.button
        type="button"
        onClick={onAction}
        className="pill-btn-forest px-8 py-3.5 text-sm font-heading font-extrabold tracking-wide uppercase flex items-center gap-2 cursor-pointer shadow-lg"
        whileHover={{ scale: 1.04 }}
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

  const handleChangeStandard = useCallback(() => {
    if (user?.id) {
      const existing = scopedGetJSON(user.id, PREF_KEY) || {};
      scopedSetJSON(user.id, PREF_KEY, { ...existing, selectedSubjectId: null, selectedSubjectName: null });
    }
    setSelectedSubjectId(null);
    setSelectedSubject('');
    navigateTo('select-standard');
  }, [user, navigateTo, setSelectedSubjectId, setSelectedSubject]);

  const handleChangeSubject = useCallback(() => {
    navigateTo('select-subject');
  }, [navigateTo]);

  return (
    <div className="relative min-h-screen overflow-x-hidden w-full bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-200">
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 py-6 w-full min-w-0 box-border">

        {!hasStandard ? (
          <SetupPrompt type="standard" onAction={() => navigateTo('select-standard')} isDark={isDark} />
        ) : !hasSubject ? (
          <SetupPrompt type="subject" onAction={() => navigateTo('select-subject')} isDark={isDark} />
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show" className="w-full min-w-0">

            {/* Subject context banner with switchers */}
            <SubjectContextBanner
              onChangeStandard={handleChangeStandard}
              onChangeSubject={handleChangeSubject}
              isDark={isDark}
            />

            {/* Welcome header */}
            <WelcomeHeader isDark={isDark} />

            {/* Featured Challenge Banner (from Reference Image) */}
            <ContinueLearningCard />

            {/* Popular Quizzes Section (from Reference Image) */}
            <PopularQuizzesSection isDark={isDark} />

            {/* Stats row */}
            <StatsRow isDark={isDark} />

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
