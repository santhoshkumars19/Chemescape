import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import DashboardLayout from '../dashboard/DashboardLayout';
import apiClient from '../services/apiClient';
import {
  Trophy, Medal, Crown, Flame, Zap, Search,
  GraduationCap, BookOpen, Sparkles, ArrowRight,
  TrendingUp, Award, Star, CheckCircle2, ShieldAlert
} from 'lucide-react';

// Fallback initial multi-subject scholars
const INITIAL_SCHOLARS = [
  {
    id: 'sch-1',
    name: 'Kavitha R.',
    avatar: '👩‍🎓',
    country: '🇮🇳',
    title: 'Math Prodigy',
    standardId: 'grade-8',
    standardName: '8th Standard',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    subjectColor: '#67E8F9',
    xp: 12450,
    level: 13,
    streak: 21,
    badges: 14,
    trend: '+2',
  },
  {
    id: 'sch-2',
    name: 'Arjun S.',
    avatar: '🧑‍🔬',
    country: '🇮🇳',
    title: 'Science Virtuoso',
    standardId: 'grade-7',
    standardName: '7th Standard',
    subjectId: 'science',
    subjectName: 'Science',
    subjectColor: '#34D399',
    xp: 11800,
    level: 12,
    streak: 19,
    badges: 12,
    trend: '+1',
  },
  {
    id: 'sch-3',
    name: 'Meera N.',
    avatar: '👩‍🏫',
    country: '🇮🇳',
    title: 'Grammar Master',
    standardId: 'grade-6',
    standardName: '6th Standard',
    subjectId: 'english',
    subjectName: 'English',
    subjectColor: '#A78BFA',
    xp: 11150,
    level: 12,
    streak: 17,
    badges: 11,
    trend: '0',
  },
  {
    id: 'sch-4',
    name: 'Siddharth V.',
    avatar: '🧑‍🚀',
    country: '🇮🇳',
    title: 'History Explorer',
    standardId: 'grade-8',
    standardName: '8th Standard',
    subjectId: 'social-science',
    subjectName: 'Social Science',
    subjectColor: '#F472B6',
    xp: 10640,
    level: 11,
    streak: 15,
    badges: 10,
    trend: '+3',
  },
  {
    id: 'sch-5',
    name: 'Pooja Krishnan',
    avatar: '👩‍💼',
    country: '🇮🇳',
    title: 'Tamil Scholar',
    standardId: 'grade-7',
    standardName: '7th Standard',
    subjectId: 'tamil',
    subjectName: 'Tamil',
    subjectColor: '#F59E0B',
    xp: 10100,
    level: 11,
    streak: 14,
    badges: 9,
    trend: '+1',
  },
  {
    id: 'sch-6',
    name: 'Rahul Dev',
    avatar: '🧑‍💻',
    country: '🇮🇳',
    title: 'Lab Explorer',
    standardId: 'grade-6',
    standardName: '6th Standard',
    subjectId: 'science',
    subjectName: 'Science',
    subjectColor: '#34D399',
    xp: 9750,
    level: 10,
    streak: 12,
    badges: 8,
    trend: '-1',
  },
  {
    id: 'sch-7',
    name: 'Divya M.',
    avatar: '👧',
    country: '🇮🇳',
    title: 'Number Wizard',
    standardId: 'grade-5',
    standardName: '5th Standard',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    subjectColor: '#67E8F9',
    xp: 9200,
    level: 10,
    streak: 11,
    badges: 8,
    trend: '+2',
  },
  {
    id: 'sch-8',
    name: 'Vikram Karthik',
    avatar: '👦',
    country: '🇮🇳',
    title: 'Word Hunter',
    standardId: 'grade-4',
    standardName: '4th Standard',
    subjectId: 'english',
    subjectName: 'English',
    subjectColor: '#A78BFA',
    xp: 8950,
    level: 9,
    streak: 10,
    badges: 7,
    trend: '0',
  },
  {
    id: 'sch-9',
    name: 'Nithya S.',
    avatar: '👩‍🎓',
    country: '🇮🇳',
    title: 'Tamil Illakkiya Star',
    standardId: 'grade-8',
    standardName: '8th Standard',
    subjectId: 'tamil',
    subjectName: 'Tamil',
    subjectColor: '#F59E0B',
    xp: 8400,
    level: 9,
    streak: 9,
    badges: 6,
    trend: '+1',
  },
  {
    id: 'sch-10',
    name: 'Harish K.',
    avatar: '🧑‍🎓',
    country: '🇮🇳',
    title: 'Geography Ace',
    standardId: 'grade-7',
    standardName: '7th Standard',
    subjectId: 'social-science',
    subjectName: 'Social Science',
    subjectColor: '#F472B6',
    xp: 7900,
    level: 8,
    streak: 8,
    badges: 6,
    trend: '-2',
  },
];

const STANDARDS_TABS = [
  { id: 'all', label: 'All Grades' },
  { id: 'grade-4', label: '4th Std' },
  { id: 'grade-5', label: '5th Std' },
  { id: 'grade-6', label: '6th Std' },
  { id: 'grade-7', label: '7th Std' },
  { id: 'grade-8', label: '8th Std' },
  { id: 'grade-11', label: '11th Std' },
];

const SUBJECTS_TABS = [
  { id: 'all', label: 'All Subjects' },
  { id: 'tamil', label: 'Tamil' },
  { id: 'english', label: 'English' },
  { id: 'mathematics', label: 'Mathematics' },
  { id: 'science', label: 'Science' },
  { id: 'social-science', label: 'Social Science' },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const {
    xp: userXP,
    level: userLevel,
    streak: userStreak,
    selectedStandard,
    selectedStandardId,
    selectedSubject,
    selectedSubjectId,
    navigateTo
  } = useNavigation();

  const [timeframe, setTimeframe] = useState('weekly'); // weekly | monthly | alltime
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSubj, setSelectedSubj] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState(null);

  // Fetch from backend API
  useEffect(() => {
    let isMounted = true;
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const res = await apiClient.get('/leaderboard', {
          params: {
            timeframe,
            standardId: selectedGrade !== 'all' ? selectedGrade : undefined,
            subjectId: selectedSubj !== 'all' ? selectedSubj : undefined,
            search: searchQuery || undefined,
          }
        });
        if (isMounted && res?.data) {
          setApiData(res.data);
        }
      } catch (err) {
        // Safe fallback if offline or request fails
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchLeaderboard();
    return () => { isMounted = false; };
  }, [timeframe, selectedGrade, selectedSubj, searchQuery]);

  // Compute live rankings with current user seamlessly integrated
  const rankings = useMemo(() => {
    let list = apiData?.rankings ? [...apiData.rankings] : [...INITIAL_SCHOLARS];

    // Multiplier for timeframe
    const mult = timeframe === 'weekly' ? 0.35 : timeframe === 'monthly' ? 0.75 : 1.0;
    list = list.map(item => ({
      ...item,
      xp: Math.round((item.rawXP || item.xp) * mult),
    }));

    // Inject active current user
    if (user) {
      const liveUserXP = Math.round((userXP || 450) * mult);
      const currentUserEntry = {
        id: user.id || 'current-user',
        name: user.name || 'You (Scholar)',
        avatar: user.avatar || '⚡',
        country: '🇮🇳',
        title: `${selectedSubject || 'All-Subject'} Explorer`,
        standardId: selectedStandardId || 'grade-8',
        standardName: selectedStandard || '8th Standard',
        subjectId: selectedSubjectId || 'mathematics',
        subjectName: selectedSubject || 'Mathematics',
        subjectColor: '#10B981',
        xp: liveUserXP,
        level: userLevel || Math.floor(userXP / 1000) + 1,
        streak: userStreak || 1,
        badges: 3,
        trend: '+1',
        isUser: true,
      };

      const existingIndex = list.findIndex(p => p.id === user.id || p.isUser);
      if (existingIndex !== -1) {
        list[existingIndex] = currentUserEntry;
      } else {
        list.push(currentUserEntry);
      }
    }

    // Apply Grade Filter
    if (selectedGrade !== 'all') {
      list = list.filter(p => p.standardId === selectedGrade || p.isUser);
    }

    // Apply Subject Filter
    if (selectedSubj !== 'all') {
      list = list.filter(p => p.subjectId === selectedSubj || p.isUser);
    }

    // Apply Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.subjectName && p.subjectName.toLowerCase().includes(q))
      );
    }

    // Sort descending by XP
    list.sort((a, b) => b.xp - a.xp);

    // Assign rank numbers
    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [apiData, timeframe, selectedGrade, selectedSubj, searchQuery, user, userXP, userLevel, userStreak, selectedStandard, selectedStandardId, selectedSubject, selectedSubjectId]);

  // Top 3 for Podium
  const top3 = rankings.slice(0, 3);
  const first = top3.find(p => p.rank === 1);
  const second = top3.find(p => p.rank === 2);
  const third = top3.find(p => p.rank === 3);

  // Current user rank & progress
  const currentUserStanding = useMemo(() => {
    const userRow = rankings.find(p => p.isUser);
    if (!userRow) return null;
    const nextAbove = rankings[userRow.rank - 2];
    return {
      rank: userRow.rank,
      xp: userRow.xp,
      level: userRow.level,
      streak: userRow.streak,
      xpToNextRank: nextAbove ? (nextAbove.xp - userRow.xp + 10) : 0,
      nextAboveName: nextAbove?.name || 'Leader',
    };
  }, [rankings]);

  return (
    <DashboardLayout>
      <div className="min-h-screen text-white pb-24 max-w-7xl mx-auto px-2 sm:px-4 md:px-6 select-none">
        {/* ── TOP HERO HEADER ── */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-8 border border-white/10 bg-gradient-to-r from-[#060D1A] via-[#0B1528] to-[#040814] shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-orbitron font-bold tracking-widest uppercase mb-3">
                <Crown size={14} className="text-amber-400" />
                <span>EduNova Hall of Fame</span>
              </div>
              <h1 className="font-orbitron font-black text-2xl sm:text-4xl text-white tracking-wide uppercase">
                SCHOLAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-300">LEADERBOARD</span>
              </h1>
              <p className="text-slate-400 font-space text-xs sm:text-sm mt-1.5 max-w-2xl">
                Master your curriculum across Tamil, English, Maths, Science & Social Science. Climb the global ranks and earn prestigious badges!
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-md self-start md:self-auto">
              <div className="text-center px-2">
                <span className="block text-[10px] font-space text-slate-400 uppercase">Total Scholars</span>
                <span className="font-orbitron font-extrabold text-base sm:text-lg text-cyan-300">{rankings.length}+</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center px-2">
                <span className="block text-[10px] font-space text-slate-400 uppercase">Your Rank</span>
                <span className="font-orbitron font-extrabold text-base sm:text-lg text-emerald-400">
                  #{currentUserStanding?.rank || '--'}
                </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center px-2">
                <span className="block text-[10px] font-space text-slate-400 uppercase">Your Streak</span>
                <span className="font-orbitron font-extrabold text-base sm:text-lg text-amber-400 flex items-center justify-center gap-1">
                  🔥 {currentUserStanding?.streak || 1}d
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TIMEFRAME & CONTROLS ── */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
          {/* Timeframe Tabs */}
          <div className="flex items-center p-1.5 rounded-2xl bg-[#070D1A] border border-white/10 shadow-lg">
            {[
              { id: 'weekly', label: 'Weekly Championship', icon: Zap },
              { id: 'monthly', label: 'Monthly League', icon: Star },
              { id: 'alltime', label: 'All-Time Legends', icon: Trophy },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = timeframe === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTimeframe(tab.id)}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-orbitron text-xs font-bold transition-all border-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white bg-transparent hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search scholar or subject..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#070D1A] border border-white/10 text-xs font-space text-white placeholder-slate-500 outline-none focus:border-emerald-500/50 transition-colors shadow-lg"
            />
          </div>
        </div>

        {/* ── CURRICULUM FILTERS (Standards & Subjects) ── */}
        <div className="mb-8 space-y-3">
          {/* Standards / Grades Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1 text-[11px] font-orbitron text-slate-400 font-bold uppercase mr-2 flex-shrink-0">
              <GraduationCap size={14} className="text-cyan-400" />
              <span>Grade:</span>
            </div>
            {STANDARDS_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedGrade(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-space font-semibold transition-all border cursor-pointer whitespace-nowrap ${
                  selectedGrade === tab.id
                    ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/20'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center gap-1 text-[11px] font-orbitron text-slate-400 font-bold uppercase mr-2 flex-shrink-0">
              <BookOpen size={14} className="text-emerald-400" />
              <span>Subject:</span>
            </div>
            {SUBJECTS_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedSubj(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-space font-semibold transition-all border cursor-pointer whitespace-nowrap ${
                  selectedSubj === tab.id
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/20'
                    : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3D PODIUM SECTION (TOP 3 SCHOLARS) ── */}
        {top3.length >= 3 && !searchQuery && (
          <div className="flex items-end justify-center gap-3 sm:gap-6 mb-12 pt-6 max-w-3xl mx-auto px-2">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center flex-1 max-w-[150px]"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-slate-700 to-slate-900 border-2 border-slate-400 flex items-center justify-center text-2xl shadow-xl mb-2 relative">
                <span>{second.avatar}</span>
                <span className="absolute -top-3.5 bg-slate-700 border border-slate-400 text-white font-orbitron font-black text-[10px] px-2 py-0.5 rounded-full shadow-md">
                  #2
                </span>
              </div>
              <p className="font-orbitron font-bold text-xs text-white truncate w-full text-center">{second.name}</p>
              <span className="text-[10px] font-space text-slate-400">{second.subjectName}</span>
              <p className="font-orbitron text-xs text-slate-300 font-bold mb-2">{second.xp.toLocaleString()} XP</p>
              <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-900/60 border-t-2 border-slate-400/50 rounded-t-2xl flex flex-col items-center justify-center shadow-lg">
                <Medal size={26} className="text-slate-300 mb-1" />
                <span className="text-[10px] font-orbitron text-slate-400 font-bold">SILVER</span>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center flex-1 max-w-[170px]"
            >
              <Crown size={28} className="text-amber-400 mb-1 animate-bounce" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-b from-amber-600/30 via-slate-900 to-slate-950 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(251,191,36,0.35)] mb-2 relative">
                <span>{first.avatar}</span>
                <span className="absolute -top-3.5 bg-amber-500 text-slate-950 font-orbitron font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-lg">
                  #1
                </span>
              </div>
              <p className="font-orbitron font-black text-sm text-amber-300 truncate w-full text-center">{first.name}</p>
              <span className="text-[10px] font-space text-amber-400/80">{first.subjectName}</span>
              <p className="font-orbitron text-xs sm:text-sm text-amber-400 font-extrabold mb-2">{first.xp.toLocaleString()} XP</p>
              <div className="w-full h-32 sm:h-36 bg-gradient-to-t from-amber-950/60 via-slate-900 to-amber-500/20 border-t-2 border-amber-400 rounded-t-2xl flex flex-col items-center justify-center shadow-2xl">
                <Trophy size={36} className="text-amber-400 mb-1" />
                <span className="text-[10px] font-orbitron text-amber-300 font-black">CHAMPION</span>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center flex-1 max-w-[150px]"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-amber-900/40 to-slate-900 border-2 border-amber-600/60 flex items-center justify-center text-2xl shadow-xl mb-2 relative">
                <span>{third.avatar}</span>
                <span className="absolute -top-3.5 bg-amber-800 border border-amber-600 text-white font-orbitron font-black text-[10px] px-2 py-0.5 rounded-full shadow-md">
                  #3
                </span>
              </div>
              <p className="font-orbitron font-bold text-xs text-white truncate w-full text-center">{third.name}</p>
              <span className="text-[10px] font-space text-slate-400">{third.subjectName}</span>
              <p className="font-orbitron text-xs text-amber-500/90 font-bold mb-2">{third.xp.toLocaleString()} XP</p>
              <div className="w-full h-20 sm:h-24 bg-gradient-to-t from-slate-900 via-amber-950/30 to-slate-900/60 border-t-2 border-amber-600/50 rounded-t-2xl flex flex-col items-center justify-center shadow-lg">
                <Medal size={24} className="text-amber-600 mb-1" />
                <span className="text-[10px] font-orbitron text-amber-600 font-bold">BRONZE</span>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── SCHOLAR RANKINGS TABLE ── */}
        <div className="rounded-3xl border border-white/10 bg-[#070D1A]/90 overflow-hidden shadow-2xl backdrop-blur-xl mb-12">
          {/* Header Row */}
          <div className="grid grid-cols-12 px-5 py-4 border-b border-white/10 font-orbitron text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/[0.02]">
            <span className="col-span-2 sm:col-span-1">Rank</span>
            <span className="col-span-6 sm:col-span-4">Scholar</span>
            <span className="hidden sm:block sm:col-span-3">Curriculum Specialty</span>
            <span className="hidden md:block md:col-span-2 text-center">Daily Streak</span>
            <span className="col-span-4 sm:col-span-4 md:col-span-2 text-right">Total XP</span>
          </div>

          {/* Scholar Rows */}
          <div className="divide-y divide-white/5 font-space text-xs">
            {rankings.length === 0 ? (
              <div className="py-16 px-4 text-center text-slate-400">
                <Trophy className="mx-auto mb-3 text-amber-400/50" size={40} />
                <p className="text-sm font-semibold text-white">No scholars found matching the filters.</p>
                <p className="text-xs text-slate-500 mt-1">Try adjusting the grade, subject, or search term.</p>
              </div>
            ) : (
              rankings.map(scholar => {
                const isTop3 = scholar.rank <= 3;
                const isCurrentUser = scholar.isUser;

                return (
                  <div
                    key={`${scholar.id}-${scholar.rank}`}
                    className={`grid grid-cols-12 px-5 py-4 items-center transition-all ${
                      isCurrentUser
                        ? 'bg-emerald-500/10 border-l-4 border-l-emerald-400 shadow-inner shadow-emerald-500/10'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-2 sm:col-span-1 font-orbitron font-black text-sm flex items-center gap-1.5">
                      {scholar.rank === 1 ? (
                        <Crown size={18} className="text-amber-400" />
                      ) : scholar.rank === 2 ? (
                        <Medal size={16} className="text-slate-300" />
                      ) : scholar.rank === 3 ? (
                        <Medal size={16} className="text-amber-600" />
                      ) : (
                        <span className="text-slate-400">#{scholar.rank}</span>
                      )}
                    </div>

                    {/* Scholar Identity */}
                    <div className="col-span-6 sm:col-span-4 flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-lg flex-shrink-0 shadow-md">
                        {scholar.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white block truncate text-xs sm:text-sm">
                            {scholar.name}
                          </span>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-orbitron font-extrabold">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="text-cyan-400 font-semibold">Lv {scholar.level}</span>
                          <span>•</span>
                          <span className="truncate">{scholar.title}</span>
                        </div>
                      </div>
                    </div>

                    {/* Standard & Subject */}
                    <div className="hidden sm:flex sm:col-span-3 items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[10px] font-mono whitespace-nowrap">
                        {scholar.standardName || '8th Std'}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap"
                        style={{
                          backgroundColor: `${scholar.subjectColor || '#10B981'}15`,
                          color: scholar.subjectColor || '#10B981',
                          border: `1px solid ${scholar.subjectColor || '#10B981'}30`,
                        }}
                      >
                        {scholar.subjectName || 'Curriculum'}
                      </span>
                    </div>

                    {/* Streak & Badges */}
                    <div className="hidden md:flex md:col-span-2 items-center justify-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        🔥 {scholar.streak}d
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        🎖️ {scholar.badges}
                      </span>
                    </div>

                    {/* Total XP */}
                    <div className="col-span-4 sm:col-span-4 md:col-span-2 text-right">
                      <span className={`font-orbitron font-black text-xs sm:text-sm ${
                        scholar.rank === 1 ? 'text-amber-400' : isCurrentUser ? 'text-emerald-400' : 'text-cyan-300'
                      }`}>
                        {scholar.xp.toLocaleString()} XP
                      </span>
                      <span className="block text-[9px] font-space text-slate-500">
                        {scholar.trend.startsWith('+') ? `▲ ${scholar.trend}` : scholar.trend.startsWith('-') ? `▼ ${scholar.trend}` : '— stable'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── SPOTLIGHT CARD: YOUR CURRENT STANDING ── */}
        {currentUserStanding && (
          <div className="sticky bottom-4 z-30 p-4 sm:p-5 rounded-2xl bg-[#091222]/95 border-2 border-emerald-500/40 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-500/20">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-orbitron font-bold text-xs sm:text-sm text-white">Your Live Standing:</span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-orbitron font-black text-xs sm:text-sm border border-emerald-500/40">
                    Rank #{currentUserStanding.rank}
                  </span>
                </div>
                <p className="text-slate-400 font-space text-xs mt-0.5">
                  {currentUserStanding.xpToNextRank > 0
                    ? `Only ${currentUserStanding.xpToNextRank.toLocaleString()} XP needed to surpass ${currentUserStanding.nextAboveName}!`
                    : 'You are leading the board! Maintain your daily quiz streak! 🔥'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigateTo('chapters')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-orbitron text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity border-0 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <span>Play Quizzes to Climb Ranks</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
