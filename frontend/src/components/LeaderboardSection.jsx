import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Crown, Trophy, Medal, Flame, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

const leaderboardData = [
  { rank: 1, name: 'Kavitha R.', country: '🇮🇳', xp: 12450, badge: 'Math Prodigy', streak: 21, color: '#fbbf24', subject: '8th Mathematics' },
  { rank: 2, name: 'Arjun S.', country: '🇮🇳', xp: 11800, badge: 'Science Virtuoso', streak: 19, color: '#e2e8f0', subject: '7th Science' },
  { rank: 3, name: 'Meera N.', country: '🇮🇳', xp: 11150, badge: 'Grammar Master', streak: 17, color: '#f97316', subject: '6th English' },
  { rank: 4, name: 'Siddharth V.', country: '🇮🇳', xp: 10640, badge: 'History Explorer', streak: 15, color: '#a855f7', subject: '8th Social Science' },
  { rank: 5, name: 'Pooja Krishnan', country: '🇮🇳', xp: 10100, badge: 'Tamil Scholar', streak: 14, color: '#22d3ee', subject: '7th Tamil' },
  { rank: 6, name: 'Rahul Dev', country: '🇮🇳', xp: 9750, badge: 'Lab Explorer', streak: 12, color: '#a855f7', subject: '6th Science' },
  { rank: 7, name: 'Divya M.', country: '🇮🇳', xp: 9200, badge: 'Number Wizard', streak: 11, color: '#22d3ee', subject: '5th Mathematics' },
];

function RankBadge({ rank, color }) {
  if (rank === 1) return <Crown size={18} style={{ color }} />;
  if (rank === 2) return <Trophy size={16} style={{ color }} />;
  if (rank === 3) return <Medal size={16} style={{ color }} />;
  return <span className="font-orbitron text-xs font-bold text-slate-400">#{rank}</span>;
}

export default function LeaderboardSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const { navigateTo } = useNavigation();

  return (
    <section id="leaderboard" className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="relative max-w-[1440px] mx-auto px-4 md:px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass border border-amber-500/30 text-xs font-orbitron font-bold text-amber-400 tracking-widest uppercase mb-4">
            <Crown size={14} />
            <span>EduNova Hall of Fame</span>
          </div>

          <h2 className="font-orbitron font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-wide uppercase mb-3">
            TOP <span className="gradient-text-cyan-purple">SCHOLARS</span>
          </h2>

          <p className="text-slate-400 font-space text-xs sm:text-sm max-w-xl mx-auto">
            Meet the top students mastering Tamil, English, Mathematics, Science, and Social Science.
          </p>
        </motion.div>

        {/* Top 3 Podium Display */}
        <motion.div
          className="flex items-end justify-center gap-3 sm:gap-6 mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* 2nd Place */}
          <PodiumCard player={leaderboardData[1]} height="h-24 sm:h-28" />
          {/* 1st Place */}
          <PodiumCard player={leaderboardData[0]} height="h-32 sm:h-36" featured />
          {/* 3rd Place */}
          <PodiumCard player={leaderboardData[2]} height="h-20 sm:h-24" />
        </motion.div>

        {/* Leaderboard Table Container */}
        <motion.div
          className="max-w-3xl mx-auto rounded-2xl glass border border-white/10 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Table Header */}
          <div className="grid grid-cols-12 px-4 sm:px-6 py-3 border-b border-white/10 text-slate-400 font-space text-[10px] sm:text-xs tracking-wider uppercase font-bold">
            <span className="col-span-2 sm:col-span-1 text-center">Rank</span>
            <span className="col-span-6 sm:col-span-5">Scholar</span>
            <span className="hidden sm:block sm:col-span-3">Curriculum Badge</span>
            <span className="col-span-4 sm:col-span-3 text-right">Total XP</span>
          </div>

          {/* Table Rows */}
          {leaderboardData.map((player, i) => (
            <div
              key={player.rank}
              id={`leaderboard-row-${player.rank}`}
              className={`grid grid-cols-12 px-4 sm:px-6 py-3.5 items-center transition-colors ${
                i < 3 ? 'bg-white/[0.02]' : ''
              } hover:bg-white/[0.04] border-b border-white/5 last:border-0`}
            >
              {/* Rank */}
              <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                <RankBadge rank={player.rank} color={player.color} />
              </div>

              {/* Scholar Name */}
              <div className="col-span-6 sm:col-span-5 flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="text-base sm:text-lg flex-shrink-0">{player.country}</span>
                <div className="min-w-0">
                  <span className="font-space font-bold text-xs sm:text-sm text-white block truncate">
                    {player.name}
                  </span>
                  <span className="font-space text-[10px] text-slate-400 sm:hidden block truncate">
                    {player.badge} • {player.subject}
                  </span>
                </div>
              </div>

              {/* Badge */}
              <div className="hidden sm:flex sm:col-span-3 items-center gap-1.5">
                <span className="font-space text-xs text-slate-300 truncate">
                  {player.badge}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 whitespace-nowrap">
                  {player.subject}
                </span>
              </div>

              {/* XP */}
              <div className="col-span-4 sm:col-span-3 text-right">
                <span className="font-orbitron font-bold text-xs sm:text-sm text-cyan-400">
                  {player.xp.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 font-space ml-1">XP</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* View Full Leaderboard CTA */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigateTo('leaderboard')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-orbitron text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity border-0 cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            <span>View Full Global Leaderboard</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}

function PodiumCard({ player, height, featured }) {
  if (!player) return null;
  return (
    <div className={`flex flex-col items-center flex-1 ${featured ? 'max-w-[160px]' : 'max-w-[140px]'}`}>
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl glass border border-white/20 flex items-center justify-center text-xl sm:text-2xl shadow-lg mb-2 relative">
        <span>{player.country}</span>
        {player.rank === 1 && (
          <span className="absolute -top-3 text-amber-400">
            <Crown size={18} />
          </span>
        )}
      </div>
      <p className="font-space font-bold text-[11px] sm:text-xs text-white truncate w-full text-center">
        {player.name}
      </p>
      <p className="font-orbitron text-[10px] sm:text-xs text-cyan-400 font-bold mb-2">
        {player.xp.toLocaleString()} XP
      </p>
      <div
        className={`w-full ${height} rounded-t-xl glass border-t border-x border-white/10 flex items-center justify-center font-orbitron font-black text-base sm:text-lg ${
          player.rank === 1 ? 'text-amber-400 border-amber-500/40 bg-amber-500/5' : 'text-slate-400'
        }`}
      >
        #{player.rank}
      </div>
    </div>
  );
}
