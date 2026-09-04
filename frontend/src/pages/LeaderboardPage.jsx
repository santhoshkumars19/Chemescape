import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useTheme } from '../context/ThemeContext';
import DashboardLayout from '../dashboard/DashboardLayout';
import apiClient from '../services/apiClient';
import {
  Trophy, Medal, Crown, Flame, Zap, Search,
  GraduationCap, BookOpen, Sparkles, ArrowRight,
  TrendingUp, Award, Star, CheckCircle2, ShieldAlert,
} from 'lucide-react';

const INITIAL_SCHOLARS = [
  {
    id: 'sch-1',
    name: 'Ahmed Rauf',
    avatar: '👨‍🎓',
    country: '🇮🇳',
    title: 'Science Master',
    standardId: 'grade-8',
    standardName: '8th Standard',
    subjectId: 'science',
    subjectName: 'Science',
    subjectColor: '#10B981',
    xp: 3450,
    level: 14,
    streak: 24,
    badges: 16,
    trend: '+4',
  },
  {
    id: 'sch-2',
    name: 'Teresa A.',
    avatar: '👩‍🎓',
    country: '🇮🇳',
    title: 'Math Prodigy',
    standardId: 'grade-8',
    standardName: '8th Standard',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    subjectColor: '#3B82F6',
    xp: 2980,
    level: 13,
    streak: 19,
    badges: 14,
    trend: '+2',
  },
  {
    id: 'sch-3',
    name: 'Caroline H.',
    avatar: '👩‍🔬',
    country: '🇮🇳',
    title: 'Grammar Virtuoso',
    standardId: 'grade-7',
    standardName: '7th Standard',
    subjectId: 'english',
    subjectName: 'English',
    subjectColor: '#8B5CF6',
    xp: 2840,
    level: 12,
    streak: 18,
    badges: 12,
    trend: '+1',
  },
  {
    id: 'sch-4',
    name: 'Kavitha R.',
    avatar: '👩‍💼',
    country: '🇮🇳',
    title: 'History Explorer',
    standardId: 'grade-8',
    standardName: '8th Standard',
    subjectId: 'social-science',
    subjectName: 'Social Science',
    subjectColor: '#F59E0B',
    xp: 2650,
    level: 11,
    streak: 16,
    badges: 11,
    trend: '-1',
  },
  {
    id: 'sch-5',
    name: 'Arjun S.',
    avatar: '🧑‍🔬',
    country: '🇮🇳',
    title: 'Tamil Scholar',
    standardId: 'grade-7',
    standardName: '7th Standard',
    subjectId: 'tamil',
    subjectName: 'Tamil',
    subjectColor: '#10B981',
    xp: 2520,
    level: 11,
    streak: 14,
    badges: 10,
    trend: '+3',
  },
  {
    id: 'sch-6',
    name: 'Rahul Dev',
    avatar: '🧑‍💻',
    country: '🇮🇳',
    title: 'Number Wizard',
    standardId: 'grade-6',
    standardName: '6th Standard',
    subjectId: 'mathematics',
    subjectName: 'Mathematics',
    subjectColor: '#3B82F6',
    xp: 2310,
    level: 10,
    streak: 12,
    badges: 8,
    trend: '-2',
  },
  {
    id: 'sch-7',
    name: 'Divya M.',
    avatar: '👧',
    country: '🇮🇳',
    title: 'Tamil Illakkiya Star',
    standardId: 'grade-5',
    standardName: '5th Standard',
    subjectId: 'tamil',
    subjectName: 'Tamil',
    subjectColor: '#10B981',
    xp: 2150,
    level: 9,
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
    subjectColor: '#8B5CF6',
    xp: 1980,
    level: 9,
    streak: 10,
    badges: 7,
    trend: '0',
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
  { id: 'science', label: 'Science' },
  { id: 'mathematics', label: 'Mathematics' },
  { id: 'english', label: 'English' },
  { id: 'tamil', label: 'Tamil' },
  { id: 'social-science', label: 'Social Science' },
];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();
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

  const [timeframe, setTimeframe] = useState('weekly');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSubj, setSelectedSubj] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState(null);

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
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchLeaderboard();
    return () => { isMounted = false; };
  }, [timeframe, selectedGrade, selectedSubj, searchQuery]);

  const rankings = useMemo(() => {
    let list = apiData?.rankings ? [...apiData.rankings] : [...INITIAL_SCHOLARS];

    const mult = timeframe === 'weekly' ? 0.35 : timeframe === 'monthly' ? 0.75 : 1.0;
    list = list.map(item => ({
      ...item,
      xp: Math.round((item.rawXP || item.xp) * mult),
    }));

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
        subjectId: selectedSubjectId || 'science',
        subjectName: selectedSubject || 'Science',
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

    if (selectedGrade !== 'all') {
      list = list.filter(p => p.standardId === selectedGrade || p.isUser);
    }

    if (selectedSubj !== 'all') {
      list = list.filter(p => p.subjectId === selectedSubj || p.isUser);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        (p.subjectName && p.subjectName.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => b.xp - a.xp);

    return list.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [apiData, timeframe, selectedGrade, selectedSubj, searchQuery, user, userXP, userLevel, userStreak, selectedStandard, selectedStandardId, selectedSubject, selectedSubjectId]);

  const top3 = rankings.slice(0, 3);
  const first = top3.find(p => p.rank === 1) || top3[0];
  const second = top3.find(p => p.rank === 2) || top3[1];
  const third = top3.find(p => p.rank === 3) || top3[2];

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
      <div className="min-h-screen text-[var(--text-main)] pb-24 max-w-5xl mx-auto px-3 sm:px-6">
        
        {/* ── TOP HERO HEADER ── */}
        <div
          className="forest-banner p-6 sm:p-8 rounded-3xl mb-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0C3B2E 0%, #114E3E 60%, #16654E 100%)',
          }}
        >
          {/* Ambient Arcs */}
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -bottom-24 -right-10 w-72 h-72 rounded-full border border-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-heading font-extrabold uppercase tracking-wider mb-2">
                <Crown size={14} className="text-amber-400" />
                <span>Scholar Leaderboard</span>
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                Top Performers
              </h1>
              <p className="text-emerald-100/80 text-xs sm:text-sm mt-1 max-w-xl">
                Compete with fellow scholars, solve daily curriculum quizzes, and climb to the top of the podium!
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-4 bg-white/10 border border-white/15 p-3 sm:p-4 rounded-2xl backdrop-blur-md self-start md:self-auto text-white">
              <div className="text-center px-2">
                <span className="block text-[10px] text-emerald-200/80 uppercase font-medium">Total Scholars</span>
                <span className="font-heading font-extrabold text-base sm:text-lg text-white">{rankings.length}+</span>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div className="text-center px-2">
                <span className="block text-[10px] text-emerald-200/80 uppercase font-medium">Your Rank</span>
                <span className="font-heading font-extrabold text-base sm:text-lg text-emerald-300">
                  #{currentUserStanding?.rank || '--'}
                </span>
              </div>
              <div className="w-px h-8 bg-white/15" />
              <div className="text-center px-2">
                <span className="block text-[10px] text-emerald-200/80 uppercase font-medium">Streak</span>
                <span className="font-heading font-extrabold text-base sm:text-lg text-amber-300 flex items-center justify-center gap-1">
                  🔥 {currentUserStanding?.streak || 1}d
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── TIMEFRAME TABS & SEARCH ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Timeframe Buttons */}
          <div className="flex items-center p-1 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] shadow-sm">
            {[
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'alltime', label: 'All-Time' },
            ].map(tab => {
              const isActive = timeframe === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTimeframe(tab.id)}
                  className={`flex-1 sm:flex-initial px-5 py-2 rounded-xl font-heading text-xs font-bold transition-all border-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#0C3B2E] text-white shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] bg-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search scholar..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-primary)] text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] outline-none focus:border-emerald-500 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* ── FILTER PILLS (Grades & Subjects) ── */}
        <div className="mb-8 space-y-2.5">
          {/* Grade filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-heading font-bold text-[var(--text-muted)] mr-1 flex-shrink-0">
              Grade:
            </span>
            {STANDARDS_TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedGrade(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-heading font-semibold transition-all border cursor-pointer whitespace-nowrap ${
                  selectedGrade === tab.id
                    ? 'bg-[#0C3B2E] text-white border-[#0C3B2E]'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-emerald-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Subject filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-heading font-bold text-[var(--text-muted)] mr-1 flex-shrink-0">
              Subject:
            </span>
            {SUBJECTS_TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSubj(tab.id)}
                className={`px-3 py-1 rounded-full text-xs font-heading font-semibold transition-all border cursor-pointer whitespace-nowrap ${
                  selectedSubj === tab.id
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-emerald-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── PODIUM SECTION (Matches Reference Image) ── */}
        {top3.length >= 3 && !searchQuery && (
          <div className="flex items-end justify-center gap-3 sm:gap-6 mb-12 pt-8 max-w-xl mx-auto px-2">
            
            {/* 2nd Place (Left) */}
            {second && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-center flex-1 max-w-[130px]"
              >
                {/* Avatar with #2 badge */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--bg-card)] border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-2xl shadow-md mb-2 relative">
                  <span>{second.avatar}</span>
                  <span className="absolute -top-3 bg-slate-500 text-white font-heading font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                    #2
                  </span>
                </div>
                <p className="font-heading font-bold text-xs text-[var(--text-main)] truncate w-full text-center">{second.name}</p>
                <p className="font-heading font-extrabold text-xs text-emerald-600 dark:text-emerald-400 mb-2">{second.xp.toLocaleString()} XP</p>
                {/* Pillar 2 */}
                <div className="w-full h-24 sm:h-28 podium-pillar-2 rounded-t-2xl flex flex-col items-center justify-center shadow-lg relative overflow-hidden">
                  <div className="pillar-stripes absolute inset-0 opacity-15" />
                  <span className="font-heading font-extrabold text-xl text-white/90 relative z-10">2</span>
                </div>
              </motion.div>
            )}

            {/* 1st Place (Center — Tallest with Crown) */}
            {first && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center flex-1 max-w-[150px]"
              >
                {/* Crown */}
                <Crown size={28} className="text-amber-400 mb-1 animate-bounce" />
                {/* Avatar with #1 badge */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[var(--bg-card)] border-2 border-emerald-500 flex items-center justify-center text-3xl shadow-lg mb-2 relative">
                  <span>{first.avatar}</span>
                  <span className="absolute -top-3 bg-amber-500 text-slate-950 font-heading font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-md">
                    #1
                  </span>
                </div>
                <p className="font-heading font-extrabold text-sm text-[var(--text-main)] truncate w-full text-center">{first.name}</p>
                <p className="font-heading font-extrabold text-sm text-emerald-600 dark:text-emerald-400 mb-2">{first.xp.toLocaleString()} XP</p>
                {/* Pillar 1 */}
                <div className="w-full h-32 sm:h-38 podium-pillar-1 rounded-t-2xl flex flex-col items-center justify-center shadow-xl relative overflow-hidden">
                  <div className="pillar-stripes absolute inset-0 opacity-20" />
                  <span className="font-heading font-extrabold text-3xl text-white relative z-10">1</span>
                </div>
              </motion.div>
            )}

            {/* 3rd Place (Right) */}
            {third && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center flex-1 max-w-[130px]"
              >
                {/* Avatar with #3 badge */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[var(--bg-card)] border-2 border-amber-600/60 flex items-center justify-center text-2xl shadow-md mb-2 relative">
                  <span>{third.avatar}</span>
                  <span className="absolute -top-3 bg-amber-700 text-white font-heading font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-sm">
                    #3
                  </span>
                </div>
                <p className="font-heading font-bold text-xs text-[var(--text-main)] truncate w-full text-center">{third.name}</p>
                <p className="font-heading font-extrabold text-xs text-emerald-600 dark:text-emerald-400 mb-2">{third.xp.toLocaleString()} XP</p>
                {/* Pillar 3 */}
                <div className="w-full h-20 sm:h-24 podium-pillar-3 rounded-t-2xl flex flex-col items-center justify-center shadow-md relative overflow-hidden">
                  <div className="pillar-stripes absolute inset-0 opacity-15" />
                  <span className="font-heading font-extrabold text-xl text-white/90 relative z-10">3</span>
                </div>
              </motion.div>
            )}

          </div>
        )}

        {/* ── BOARD STANDINGS SECTION (Direct Match to Reference Image) ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="font-heading font-extrabold text-xl text-[var(--text-main)]">
              Board Standings
            </h3>
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Showing {rankings.length} scholars
            </span>
          </div>

          {/* Table / List Container */}
          <div className="card-modern rounded-3xl overflow-hidden divide-y divide-[var(--border-primary)]">
            {rankings.length === 0 ? (
              <div className="p-12 text-center text-[var(--text-muted)]">
                <Trophy size={36} className="mx-auto text-amber-500/50 mb-2" />
                <p className="text-sm font-heading font-semibold text-[var(--text-main)]">No scholars found</p>
                <p className="text-xs mt-0.5">Try changing the filters or search query.</p>
              </div>
            ) : (
              rankings.map(scholar => {
                const isCurrentUser = scholar.isUser;
                const isTop1 = scholar.rank === 1;

                return (
                  <div
                    key={`${scholar.id}-${scholar.rank}`}
                    className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                      isCurrentUser
                        ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500'
                        : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                    }`}
                  >
                    {/* Left: Rank & Movement & Scholar Info */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Rank number or trophy */}
                      <div className="w-8 text-center font-heading font-extrabold text-sm sm:text-base text-[var(--text-secondary)] flex-shrink-0">
                        {isTop1 ? (
                          <Crown size={18} className="text-amber-400 mx-auto" />
                        ) : (
                          `#${scholar.rank}`
                        )}
                      </div>

                      {/* Trend Movement Badge */}
                      <span
                        className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          scholar.trend?.startsWith('+')
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : scholar.trend?.startsWith('-')
                            ? 'bg-rose-500/15 text-rose-500'
                            : 'bg-slate-500/15 text-slate-500'
                        }`}
                      >
                        {scholar.trend?.startsWith('+')
                          ? `▲ ${scholar.trend.slice(1)}`
                          : scholar.trend?.startsWith('-')
                          ? `▼ ${scholar.trend.slice(1)}`
                          : '—'}
                      </span>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
                        {scholar.avatar}
                      </div>

                      {/* Name & Title */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-sm sm:text-base text-[var(--text-main)] truncate">
                            {scholar.name}
                          </span>
                          {isCurrentUser && (
                            <span className="px-2 py-0.2 rounded-full bg-emerald-500 text-white text-[9px] font-heading font-extrabold">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                          {scholar.standardName || '8th Std'} • {scholar.subjectName || 'Science'}
                        </p>
                      </div>
                    </div>

                    {/* Right: XP Chip */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="hidden sm:flex items-center gap-1 text-xs text-amber-500 font-semibold">
                        🔥 {scholar.streak}d
                      </span>

                      <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-heading font-extrabold text-xs sm:text-sm whitespace-nowrap">
                        {scholar.xp.toLocaleString()} XP
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── USER STANDING SPOTLIGHT (Sticky Bottom) ── */}
        {currentUserStanding && (
          <div className="sticky bottom-4 z-30 card-modern p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-emerald-500/40">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-sm text-[var(--text-main)]">Your Standing:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-heading font-extrabold text-xs">
                    Rank #{currentUserStanding.rank}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                  {currentUserStanding.xpToNextRank > 0
                    ? `Only ${currentUserStanding.xpToNextRank.toLocaleString()} XP needed to pass ${currentUserStanding.nextAboveName}!`
                    : 'You are leading the board! Keep up your daily streak!'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('chapters')}
              className="w-full sm:w-auto pill-btn-forest text-xs font-heading font-extrabold flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Play Quizzes</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
