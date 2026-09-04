import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import {
  Trophy, Medal, Crown, Flame, Zap, Coins, Search,
  ArrowLeft, Sparkles, Shield, ChevronUp, ChevronDown,
  User, LayoutDashboard, Compass, Settings, LogOut, Award
} from 'lucide-react';

const WEEKLY_DATA = [];
const MONTHLY_DATA = [];
const ALLTIME_DATA = [];

export default function LeaderboardPage() {
  const { navigateTo } = useNavigation();

  const [filter, setFilter] = useState('weekly'); // 'weekly' | 'monthly' | 'alltime'
  const [searchQuery, setSearchQuery] = useState('');

  const currentDataset =
    filter === 'weekly' ? WEEKLY_DATA : filter === 'monthly' ? MONTHLY_DATA : ALLTIME_DATA;

  const filteredDataset = currentDataset.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = currentDataset.slice(0, 3);
  const first = top3.find((p) => p.rank === 1);
  const second = top3.find((p) => p.rank === 2);
  const third = top3.find((p) => p.rank === 3);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex selection:bg-cyan-500 selection:text-black">
      {/* ── SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 bg-slate-950/80 backdrop-blur-xl p-5 justify-between select-none">
        <div>
          {/* Logo */}
          <button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-3 mb-8 px-2 border-0 bg-transparent cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-orbitron font-extrabold text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                EduNova
              </span>
              <span className="block text-[9px] font-space text-slate-400 tracking-widest uppercase">
                AAA Gaming Suite
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1.5 font-space text-xs">
            <button
              onClick={() => navigateTo('dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors border-0 bg-transparent cursor-pointer text-left"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigateTo('standards')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors border-0 bg-transparent cursor-pointer text-left"
            >
              <Compass size={18} />
              <span>Play Missions</span>
            </button>
            <button
              onClick={() => navigateTo('leaderboard')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold shadow-lg shadow-cyan-500/10 cursor-pointer text-left"
            >
              <Trophy size={18} />
              <span>Leaderboard</span>
            </button>
            <button
              onClick={() => navigateTo('chapters')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors border-0 bg-transparent cursor-pointer text-left"
            >
              <Award size={18} />
              <span>Achievements</span>
            </button>
          </nav>
        </div>

        {/* User Mini Card */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-sm">
              ⚡
            </div>
            <div>
              <span className="font-orbitron text-xs font-bold text-white block">Alex Vance</span>
              <span className="text-[10px] font-space text-cyan-400">Rank #4 Global</span>
            </div>
          </div>
          <button onClick={() => navigateTo('login')} className="text-slate-500 hover:text-rose-400 transition-colors p-1 border-0 bg-transparent cursor-pointer">
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 max-w-[1440px] mx-auto w-full min-w-0 box-border">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-orbitron font-bold uppercase tracking-widest mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>Hall of Fame</span>
            </div>
            <h1 className="font-orbitron font-black text-3xl sm:text-4xl text-white">GLOBAL LEADERBOARD</h1>
            <p className="text-slate-400 font-space text-xs mt-1">Compete with chemists worldwide and climb the ranks.</p>
          </div>

          <button
            onClick={() => navigateTo('dashboard')}
            className="lg:hidden self-start flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-300 font-space text-xs cursor-pointer"
          >
            <ArrowLeft size={14} /> Back to HQ
          </button>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/60 p-2 rounded-2xl border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-1 w-full sm:w-auto">
            {['weekly', 'monthly', 'alltime'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-orbitron text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  filter === t
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search player or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs font-space text-white placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
        </div>

        {/* 3D Podium Row */}
        {top3.length >= 3 && (
          <div className="flex items-end justify-center gap-3 sm:gap-6 mb-12 pt-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center flex-1 max-w-[140px]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 border-2 border-slate-400/50 flex items-center justify-center text-2xl shadow-xl mb-2 relative">
                <span>{second.avatar}</span>
                <span className="absolute -top-3.5 bg-slate-700 border border-slate-400 text-white font-orbitron font-black text-[10px] px-2 py-0.5 rounded-full">
                  #2
                </span>
              </div>
              <p className="font-orbitron font-bold text-xs text-white truncate w-full text-center">{second.name}</p>
              <p className="font-space text-[10px] text-slate-400 mb-3">{second.xp.toLocaleString()} XP</p>
              <div className="w-full h-28 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-900/60 border-t-2 border-slate-400/40 rounded-t-2xl flex items-center justify-center">
                <Medal size={28} className="text-slate-300" />
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center flex-1 max-w-[160px]">
              <Crown size={24} className="text-amber-400 mb-1 animate-bounce" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(251,191,36,0.3)] mb-2 relative">
                <span>{first.avatar}</span>
                <span className="absolute -top-3.5 bg-amber-500 text-black font-orbitron font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-lg">
                  #1
                </span>
              </div>
              <p className="font-orbitron font-black text-sm text-white truncate w-full text-center">{first.name}</p>
              <p className="font-space text-xs text-amber-400 font-bold mb-3">{first.xp.toLocaleString()} XP</p>
              <div className="w-full h-36 bg-gradient-to-t from-amber-950/60 via-slate-900 to-amber-500/20 border-t-2 border-amber-400 rounded-t-2xl flex items-center justify-center">
                <Trophy size={36} className="text-amber-400" />
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center flex-1 max-w-[140px]">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 border-2 border-amber-700/50 flex items-center justify-center text-2xl shadow-xl mb-2 relative">
                <span>{third.avatar}</span>
                <span className="absolute -top-3.5 bg-amber-800 border border-amber-600 text-white font-orbitron font-black text-[10px] px-2 py-0.5 rounded-full">
                  #3
                </span>
              </div>
              <p className="font-orbitron font-bold text-xs text-white truncate w-full text-center">{third.name}</p>
              <p className="font-space text-[10px] text-slate-400 mb-3">{third.xp.toLocaleString()} XP</p>
              <div className="w-full h-24 bg-gradient-to-t from-slate-900 via-amber-950/40 to-slate-900/60 border-t-2 border-amber-700/40 rounded-t-2xl flex items-center justify-center">
                <Medal size={24} className="text-amber-700" />
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table List */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-12 px-6 py-3.5 border-b border-white/10 font-orbitron text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="col-span-2 sm:col-span-1">Rank</span>
            <span className="col-span-6 sm:col-span-5">Chemist</span>
            <span className="hidden sm:block sm:col-span-3">Title</span>
            <span className="col-span-4 sm:col-span-3 text-right">Total XP</span>
          </div>

          <div className="divide-y divide-white/5 font-space text-xs">
            {filteredDataset.length === 0 ? (
              <div className="py-16 px-4 text-center font-space text-slate-400">
                <Trophy className="mx-auto mb-3 text-amber-400/50" size={36} />
                <p className="text-sm font-semibold text-white">No rankings available yet.</p>
                <p className="text-xs text-slate-500 mt-1">Play escape rooms and solve chemistry challenges to earn XP and claim your spot on the leaderboard.</p>
              </div>
            ) : (
              filteredDataset.map((player) => (
              <div
                key={player.rank}
                className={`grid grid-cols-12 px-6 py-4 items-center transition-colors ${
                  player.isUser
                    ? 'bg-cyan-500/10 border-l-4 border-l-cyan-400'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="col-span-2 sm:col-span-1 font-orbitron font-black text-sm flex items-center gap-2">
                  <span className={player.rank <= 3 ? 'text-amber-400' : 'text-slate-400'}>
                    #{player.rank}
                  </span>
                </div>

                <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-lg flex-shrink-0">
                    {player.avatar}
                  </div>
                  <div>
                    <span className="font-bold text-white block truncate">{player.name}</span>
                    <span className="text-[10px] text-slate-500 font-inter">Lv {player.level}</span>
                  </div>
                </div>

                <div className="hidden sm:block sm:col-span-3 text-slate-400 text-xs truncate">
                  {player.title}
                </div>

                <div className="col-span-4 sm:col-span-3 text-right font-orbitron font-extrabold text-sm text-cyan-300">
                  {player.xp.toLocaleString()} XP
                </div>
              </div>
            ))
          )}
          </div>
        </div>
      </main>
    </div>
  );
}
