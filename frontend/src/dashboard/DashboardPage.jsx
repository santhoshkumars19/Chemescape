import { motion } from 'framer-motion';
import { useEffect } from 'react';
import {
  Zap, Coins, Flame, Clock, BookOpen, Play,
  Crown, Trophy, Star, Timer, Users, Sword,
  CheckCircle2, Lock, ChevronRight, Award,
  FlaskConical, TrendingUp,
} from 'lucide-react';
import { DashCard, SectionHeader, AnimatedCounter, RarityPill } from './DashComponents';
import {
  ProgressChart, AccuracyChart,
} from './Charts';
import {
  mockUser, mockMission, mockStats, dailyChallenge,
} from './mockData';
import { registerCharts } from './chartConfig';

import { useNavigation } from '../context/NavigationContext';

registerCharts();

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22,1,0.36,1] } },
};

// ─────────────────────────────────────────────────────────────────────────────
// WELCOME HEADER
// ─────────────────────────────────────────────────────────────────────────────
function WelcomeHeader() {
  const { xp, level, streak } = useNavigation();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 min-w-0 w-full">
      <div className="flex items-center gap-4 min-w-0">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <motion.div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl"
            style={{
              background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(103,232,249,0.15))',
              border: '2px solid rgba(16,185,129,0.25)',
              boxShadow: '0 0 30px rgba(16,185,129,0.15)',
            }}
            animate={{ boxShadow: ['0 0 20px rgba(16,185,129,0.1)','0 0 40px rgba(16,185,129,0.25)','0 0 20px rgba(16,185,129,0.1)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🧪
          </motion.div>
          {/* Level badge */}
          <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-orbitron font-extrabold text-slate-950"
            style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 0 12px rgba(16,185,129,0.4)' }}>
            Lvl {level}
          </div>
        </div>

        {/* Name + title */}
        <div className="min-w-0">
          <p className="text-slate-400 text-xs sm:text-sm font-inter">{greeting},</p>
          <h1 className="font-orbitron font-black text-xl sm:text-2xl md:text-3xl text-white leading-tight truncate">
            Student Agent
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-slate-400 font-space truncate">@student</span>
            <span className="w-1 h-1 rounded-full bg-white/15 hidden sm:inline-block" />
            <span className="text-[10px] sm:text-xs font-space px-2 py-0.5 rounded-full whitespace-nowrap text-emerald-300"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(167,243,208,0.2)' }}>
              Quantum Engineer
            </span>
          </div>
        </div>
      </div>

      {/* Right: streak + quick stats */}
      <div className="flex items-center gap-3 flex-wrap flex-shrink-0">
        {/* Streak badge */}
        <motion.div
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
          style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}
          animate={{ borderColor: ['rgba(251,146,60,0.2)','rgba(251,146,60,0.4)','rgba(251,146,60,0.2)'] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <Flame size={16} className="text-orange-400" />
          <div>
            <p className="font-orbitron font-black text-base sm:text-lg text-orange-400 leading-none">{streak}</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-space leading-none mt-0.5">Day Streak</p>
          </div>
        </motion.div>

        {/* XP badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(167,243,208,0.2)' }}>
          <Zap size={15} className="text-emerald-400" />
          <div>
            <p className="font-orbitron font-black text-base sm:text-lg text-emerald-400 leading-none">{xp} XP</p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-space leading-none mt-0.5">Total XP</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STAT CARDS ROW
// ─────────────────────────────────────────────────────────────────────────────
function StatsRow() {
  const { xp, coins, streak, userProgressList } = useNavigation();

  const completedRoomsCount = userProgressList.filter((p) => p.isCompleted).length;

  const stats = [
    { icon: <Zap size={16} className="text-emerald-400" />, label: 'Total XP', value: xp, color: '#10B981', trend: 12 },
    { icon: <span className="text-amber-400 text-base">🪙</span>, label: 'Coins', value: coins, color: '#F59E0B', trend: 8 },
    { icon: <Flame size={16} className="text-orange-400" />, label: 'Day Streak', value: streak, color: '#F97316', trend: 0 },
    { icon: <Clock size={16} className="text-mint-400 text-emerald-300" />, label: 'Study Time', value: '4.5h', color: '#34D399', trend: 5 },
    { icon: <CheckCircle2 size={16} className="text-emerald-400" />, label: 'Missions Complete', value: completedRoomsCount, color: '#10B981', trend: 18 },
    { icon: <FlaskConical size={16} className="text-aqua-400 text-cyan-300" />, label: 'Units Unlocked', value: 5, color: '#67E8F9', trend: 0 },
  ];

  return (
    <motion.div
      variants={stagger}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 w-full min-w-0"
    >
      {stats.map((s) => (
        <motion.div key={s.label} variants={fadeUp} className="min-w-0 w-full">
          <DashCard className="p-3.5 sm:p-4 min-w-0 w-full flex flex-col justify-between" glow={`${s.color}08`}>
            <div className="flex items-center justify-between mb-2 min-w-0">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}12`, border: `1px solid ${s.color}20` }}>
                {s.icon}
              </div>
              {s.trend !== 0 && (
                <span className={`text-[9px] sm:text-[10px] font-space px-1.5 py-0.5 rounded-full whitespace-nowrap ${s.trend > 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                  {s.trend > 0 ? '↑' : '↓'}{Math.abs(s.trend)}%
                </span>
              )}
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
// CURRENT MISSION / CONTINUE LEARNING
// ─────────────────────────────────────────────────────────────────────────────
function MissionCard() {
  const { navigateTo } = useNavigation();

  return (
    <motion.div variants={fadeUp} className="min-w-0 w-full">
      <DashCard
        className="p-5 sm:p-6 mb-6 relative overflow-hidden min-w-0 w-full"
        id="mission-card"
        style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(103,232,249,0.06) 60%, rgba(5,8,7,0.7) 100%)',
          border: '1px solid rgba(167,243,208,0.16)',
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 min-w-0">
          <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
            {/* Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(167,243,208,0.25)', boxShadow: '0 0 20px rgba(16,185,129,0.15)' }}>
              🧪
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-space text-emerald-400 tracking-widest uppercase">{mockMission.room}</span>
                <span className="text-[10px] font-space px-2 py-0.5 rounded-full"
                  style={{ background: `rgba(245,158,11,0.15)`, color: '#F59E0B', border: `1px solid rgba(245,158,11,0.25)` }}>
                  {mockMission.difficulty}
                </span>
              </div>
              <h2 className="font-space font-bold text-white text-base sm:text-lg mb-1 truncate">{mockMission.title}</h2>
              <p className="text-slate-400 text-xs sm:text-sm font-inter mb-3 line-clamp-2">{mockMission.description}</p>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-400 font-inter mb-1">
                  <span>{mockMission.puzzlesDone}/{mockMission.puzzlesTotal} puzzles</span>
                  <span className="font-orbitron font-bold text-emerald-400">{mockMission.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden w-full">
                  <motion.div
                    className="h-full rounded-full relative"
                    style={{ background: 'linear-gradient(90deg,#10B981,#67E8F9)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${mockMission.progress}%` }}
                    transition={{ duration: 1.4, ease: [0.22,1,0.36,1], delay: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: rewards + CTA */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 flex-shrink-0 min-w-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/5">
            <div className="flex items-center gap-3.5 text-xs font-space flex-wrap">
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-emerald-400" /><span className="text-slate-300">+{mockMission.xpReward} XP</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400">🪙</span><span className="text-slate-300">+{mockMission.coinReward}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Timer size={12} className="text-red-400" /><span className="text-red-400/80">{mockMission.timeLeft}</span>
              </div>
            </div>
            <motion.button
              id="continue-learning-btn"
              onClick={() => navigateTo('standards')}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-orbitron font-extrabold text-xs tracking-wider uppercase text-slate-950 relative overflow-hidden cursor-pointer whitespace-nowrap w-full sm:w-auto"
              style={{ background: 'linear-gradient(135deg,#10B981,#059669)', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
              whileHover={{ scale: 1.03, boxShadow: '0 0 35px rgba(16,185,129,0.45)' }}
              whileTap={{ scale: 0.97 }}
            >
              <Play size={14} className="relative z-10 fill-slate-950" />
              <span className="relative z-10">Continue Learning</span>
            </motion.button>
          </div>
        </div>
      </DashCard>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DAILY CHALLENGE CARD
// ─────────────────────────────────────────────────────────────────────────────
function DailyChallengeCard() {
  return (
    <motion.div variants={fadeUp} className="min-w-0 w-full">
      <DashCard
        className="p-5 sm:p-6 mb-6 relative overflow-hidden min-w-0 w-full"
        id="daily-challenge-card"
        style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(16,185,129,0.06) 100%)',
          border: '1px solid rgba(245,158,11,0.18)',
        }}
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
              <h3 className="font-space font-bold text-white text-base sm:text-lg mb-1 truncate">{dailyChallenge.title}</h3>
              <p className="text-slate-400 text-xs sm:text-sm font-inter line-clamp-2">{dailyChallenge.description}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 flex-shrink-0 min-w-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
            <div className="flex items-center gap-3 text-xs font-space flex-wrap">
              <span className="text-emerald-400 font-bold">+{dailyChallenge.xpReward} XP</span>
              <span className="text-amber-400 font-bold">+{dailyChallenge.coinReward} Coins</span>
              <span className="text-slate-400 font-mono">{dailyChallenge.timeLeft} left</span>
            </div>
            <button
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-orbitron font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 cursor-pointer whitespace-nowrap w-full sm:w-auto"
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
// MAIN DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return (
    <div className="relative min-h-screen bg-[#050807] text-white overflow-x-hidden w-full">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 80% 20%, rgba(16,185,129,0.08) 0%, transparent 60%)' }} />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{ background: 'radial-gradient(circle, rgba(103,232,249,0.04) 0%, transparent 70%)' }} />
      <div className="fixed inset-0 lab-grid opacity-20 pointer-events-none z-0" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 py-6 w-full min-w-0 box-border">
        <motion.div variants={stagger} initial="hidden" animate="show" className="w-full min-w-0">
          {/* Welcome + Streak */}
          <WelcomeHeader />

          {/* Stats row */}
          <StatsRow />

          {/* Current Mission */}
          <MissionCard />

          {/* Daily Challenge */}
          <DailyChallengeCard />

          {/* Charts — 3 column layout */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 w-full min-w-0">
            {/* Left col: Progress */}
            <div className="lg:col-span-2 flex flex-col gap-6 min-w-0 w-full">
              <motion.div variants={fadeUp} className="min-w-0 w-full"><ProgressChart /></motion.div>
            </div>

            {/* Right col: Accuracy */}
            <div className="flex flex-col gap-6 min-w-0 w-full">
              <motion.div variants={fadeUp} className="min-w-0 w-full"><AccuracyChart /></motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
