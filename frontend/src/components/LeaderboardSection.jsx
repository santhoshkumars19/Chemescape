import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Crown, Trophy, Medal, Flame } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

const leaderboardData = [
  { rank: 1, name: 'QuantumKira', country: '🇯🇵', xp: 98400, badge: 'Quantum Chemist', streak: 42, color: '#fbbf24' },
  { rank: 2, name: 'MoleculeMax', country: '🇩🇪', xp: 95120, badge: 'Reaction Master', streak: 38, color: '#e2e8f0' },
  { rank: 3, name: 'PlasmaAlex', country: '🇺🇸', xp: 91800, badge: 'Lab Phantom', streak: 31, color: '#f97316' },
  { rank: 4, name: 'NeonSpark', country: '🇬🇧', xp: 87600, badge: 'Ion Storm', streak: 27, color: '#a855f7' },
  { rank: 5, name: 'CatalystEve', country: '🇫🇷', xp: 84200, badge: 'Catalyst', streak: 24, color: '#22d3ee' },
  { rank: 6, name: 'BondBreaker', country: '🇰🇷', xp: 79900, badge: 'Molecule Smasher', streak: 19, color: '#a855f7' },
  { rank: 7, name: 'AcidRain_X', country: '🇧🇷', xp: 76300, badge: 'pH Warrior', streak: 15, color: '#22d3ee' },
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
            <span>Global Rankings</span>
          </div>

          <h2 className="font-orbitron font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-wide uppercase mb-3">
            TOP <span className="gradient-text-cyan-purple">CHEMISTS</span>
          </h2>

          <p className="text-slate-400 font-space text-xs sm:text-sm max-w-xl mx-auto">
            The elite alchemists who've mastered every lab room reaction.
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
          className="glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Table Header */}
          <div className="grid grid-cols-12 px-4 md:px-6 py-3 border-b border-white/10 text-[10px] md:text-xs font-orbitron font-bold text-slate-400 tracking-widest uppercase">
            <span className="col-span-2 sm:col-span-1">Rank</span>
            <span className="col-span-5 sm:col-span-4">Player</span>
            <span className="hidden sm:block sm:col-span-3">Badge</span>
            <span className="col-span-3 sm:col-span-2 text-right">XP</span>
            <span className="col-span-2 sm:col-span-2 text-right">Streak</span>
          </div>

          {/* Table Rows */}
          {leaderboardData.length === 0 ? (
            <div className="py-12 px-4 text-center font-space text-slate-400 text-sm">
              <Trophy className="mx-auto mb-2 text-amber-400/50" size={32} />
              <p className="font-semibold text-white">No rankings available yet.</p>
              <p className="text-xs text-slate-400 mt-1">Play escape rooms and earn XP to claim your spot on the leaderboard.</p>
            </div>
          ) : (
            leaderboardData.map((player, i) => (
              <motion.div
                key={player.name}
                id={`leaderboard-row-${player.rank}`}
                className="grid grid-cols-12 px-4 md:px-6 py-3.5 items-center border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.06 }}
              >
                {/* Rank */}
                <div className="col-span-2 sm:col-span-1 flex items-center">
                  <RankBadge rank={player.rank} color={player.color} />
                </div>

                {/* Player */}
                <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                    style={{ background: `${player.color}20`, border: `1px solid ${player.color}40` }}
                  >
                    {player.country}
                  </div>
                  <span className="font-space font-semibold text-white text-xs md:text-sm truncate">
                    {player.name}
                  </span>
                </div>

                {/* Badge */}
                <div className="hidden sm:block sm:col-span-3">
                  <span
                    className="text-[10px] font-orbitron font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${player.color}15`, color: player.color, border: `1px solid ${player.color}30` }}
                  >
                    {player.badge}
                  </span>
                </div>

                {/* XP */}
                <div className="col-span-3 sm:col-span-2 text-right">
                  <span className="font-orbitron text-xs md:text-sm font-bold" style={{ color: player.color }}>
                    {player.xp.toLocaleString()}
                  </span>
                </div>

                {/* Streak */}
                <div className="col-span-2 sm:col-span-2 text-right flex items-center justify-end gap-1">
                  <Flame size={12} className="text-orange-400" />
                  <span className="font-mono text-xs text-slate-300">{player.streak}d</span>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigateTo('leaderboard')}
            className="text-cyan-400 hover:text-cyan-300 text-xs font-orbitron font-bold tracking-wider uppercase transition-colors inline-flex items-center gap-1.5 cursor-pointer bg-transparent border-0"
          >
            <span>View Full Global Leaderboard</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function PodiumCard({ player, height, featured = false }) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      {featured && (
        <Crown size={20} className="text-amber-400 animate-bounce" />
      )}
      <div
        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shadow-lg ${
          featured ? 'ring-2 ring-amber-400/50' : ''
        }`}
        style={{
          background: `${player.color}20`,
          border: `1.5px solid ${player.color}50`,
        }}
      >
        {player.country}
      </div>
      <div className="text-center">
        <p className={`font-orbitron font-bold text-white ${featured ? 'text-xs sm:text-sm' : 'text-[11px]'}`}>
          {player.name}
        </p>
        <p className="font-orbitron text-[10px] font-extrabold" style={{ color: player.color }}>
          {player.xp.toLocaleString()} XP
        </p>
      </div>
      <div
        className={`${height} w-16 sm:w-20 rounded-t-2xl flex items-end justify-center pb-2 border-t-2 backdrop-blur-md`}
        style={{
          background: `linear-gradient(to top, ${player.color}25, ${player.color}05)`,
          borderColor: player.color,
        }}
      >
        <span className="font-orbitron text-sm sm:text-lg font-black" style={{ color: player.color }}>
          #{player.rank}
        </span>
      </div>
    </motion.div>
  );
}
