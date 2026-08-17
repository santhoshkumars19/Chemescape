import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Lock, Trophy, Sparkles, Zap } from 'lucide-react';

const achievements = [
  { id: 'ach-1', name: 'First Reaction', desc: 'Complete your first chemistry puzzle in the lab', icon: '⚗️', rarity: 'Common', color: '#22d3ee', unlocked: true },
  { id: 'ach-2', name: 'Speed Chemist', desc: 'Escape a lab room in under 5 minutes', icon: '⚡', rarity: 'Rare', color: '#a855f7', unlocked: true },
  { id: 'ach-3', name: 'Noble Gas Master', desc: 'Solve 7 consecutive puzzles without a hint', icon: '🌟', rarity: 'Epic', color: '#fbbf24', unlocked: true },
  { id: 'ach-4', name: 'Quantum Chemist', desc: 'Reach #1 position on the global leaderboard', icon: '⚛️', rarity: 'Legendary', color: '#ec4899', unlocked: false },
  { id: 'ach-5', name: 'Catalyst Pioneer', desc: 'Complete 50 reaction equations flawlessly', icon: '🔥', rarity: 'Epic', color: '#f97316', unlocked: true },
  { id: 'ach-6', name: 'Molecular Mastermind', desc: 'Unlock all 118 elements in the periodic table', icon: '🧬', rarity: 'Legendary', color: '#fbbf24', unlocked: false },
  { id: 'ach-7', name: 'Lab Phantom', desc: 'Escape 12 escape rooms with zero mistakes', icon: '👻', rarity: 'Epic', color: '#818cf8', unlocked: false },
  { id: 'ach-8', name: 'Ion Storm Specialist', desc: 'Place in the top 100 ranking in Season 1', icon: '🌩️', rarity: 'Rare', color: '#22d3ee', unlocked: true },
  { id: 'ach-9', name: 'Acid Chamber Veteran', desc: 'Complete the Acid Chamber room escape', icon: '💧', rarity: 'Uncommon', color: '#34d399', unlocked: true },
  { id: 'ach-10', name: 'Radioactive Streak', desc: 'Maintain a 100-day daily learning streak', icon: '☢️', rarity: 'Legendary', color: '#ec4899', unlocked: false },
  { id: 'ach-11', name: 'Bond Breaker', desc: 'Solve 25 chemical bonding challenge sets', icon: '🔗', rarity: 'Common', color: '#22d3ee', unlocked: true },
  { id: 'ach-12', name: 'pH Scale Master', desc: 'Achieve a perfect score on all acid-base rooms', icon: '🧪', rarity: 'Rare', color: '#a855f7', unlocked: true },
];

const rarityColors = {
  Common: { bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.25)', text: '#22d3ee' },
  Uncommon: { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)', text: '#34d399' },
  Rare: { bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.25)', text: '#a855f7' },
  Epic: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', text: '#fbbf24' },
  Legendary: { bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.3)', text: '#ec4899' },
};

function AchievementCard({ ach, index, isInView }) {
  const r = rarityColors[ach.rarity];
  return (
    <motion.div
      id={ach.id}
      className={`relative group rounded-2xl p-4.5 flex flex-col justify-between h-full border backdrop-blur-md transition-all ${
        ach.unlocked ? 'glass' : 'glass opacity-55'
      }`}
      style={{
        borderColor: ach.unlocked ? r.border : 'rgba(255,255,255,0.08)',
        background: ach.unlocked ? r.bg : 'rgba(255,255,255,0.02)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: ach.unlocked ? 1 : 0.55, y: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.04 * index }}
      whileHover={ach.unlocked ? {
        y: -4,
        borderColor: ach.color,
        boxShadow: `0 12px 30px ${ach.color}25`,
      } : {}}
    >
      <div>
        {/* Top Header Row: Icon + Rarity Badge */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border"
            style={{
              background: ach.unlocked ? `${ach.color}15` : 'rgba(255,255,255,0.04)',
              borderColor: ach.unlocked ? `${ach.color}40` : 'rgba(255,255,255,0.08)',
            }}
          >
            {ach.unlocked ? ach.icon : <Lock size={16} className="text-slate-400" />}
          </div>

          <span
            className="text-[10px] font-orbitron font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border"
            style={{
              background: r.bg,
              color: r.text,
              borderColor: r.border,
            }}
          >
            {ach.rarity}
          </span>
        </div>

        {/* Title */}
        <h4 className={`font-orbitron font-bold text-sm mb-1.5 leading-snug ${
          ach.unlocked ? 'text-white' : 'text-slate-300'
        }`}>
          {ach.name}
        </h4>

        {/* Description */}
        <p className={`text-xs font-space leading-relaxed ${
          ach.unlocked ? 'text-slate-300' : 'text-slate-400'
        }`}>
          {ach.desc}
        </p>
      </div>

      {/* Footer Status */}
      <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between">
        <span className={`text-[10px] font-mono ${ach.unlocked ? 'text-cyan-400' : 'text-slate-500'}`}>
          {ach.unlocked ? '✓ UNLOCKED' : '🔒 LOCKED'}
        </span>
        <div
          className={`w-2 h-2 rounded-full ${ach.unlocked ? 'animate-pulse' : ''}`}
          style={{ background: ach.unlocked ? ach.color : 'rgba(255,255,255,0.15)' }}
        />
      </div>
    </motion.div>
  );
}

export default function AchievementsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const unlocked = achievements.filter(a => a.unlocked).length;

  return (
    <section id="achievements" className="relative py-20 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-purple-600/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass border border-purple-500/30 text-xs font-orbitron font-bold text-purple-300 tracking-widest uppercase mb-4">
            <Trophy size={14} className="text-amber-400" />
            <span>Achievements & Badges</span>
          </div>

          <h2 className="font-orbitron font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-wide uppercase mb-3">
            EARN YOUR <span className="gradient-text-cyan-purple">LEGEND</span>
          </h2>
          <p className="text-slate-400 font-space text-xs sm:text-sm max-w-xl mx-auto">
            150+ chemical achievements waiting to be claimed. Each one tells your chemistry story.
          </p>
        </motion.div>

        {/* ── PROGRESS BAR SECTION (Section 3 Requirements) ── */}
        <motion.div
          className="mb-8 p-4 rounded-2xl glass border border-cyan-500/20 max-w-4xl mx-auto shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-orbitron text-xs font-bold text-slate-200 uppercase tracking-wider">
              <Zap size={16} className="text-cyan-400" />
              <span>Your Progress</span>
            </div>

            {/* Progress Bar Container */}
            <div className="flex-1 w-full sm:mx-4 h-3 bg-slate-900 rounded-full border border-white/10 overflow-hidden relative">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-400"
                initial={{ width: 0 }}
                animate={isInView ? { width: `${(unlocked / achievements.length) * 100}%` } : {}}
                transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
              />
            </div>

            <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-orbitron font-bold text-xs whitespace-nowrap">
              {unlocked}/{achievements.length} Unlocked
            </div>
          </div>
        </motion.div>

        {/* ── ACHIEVEMENT GRID (Section 4 & 5 Requirements: 3 col desktop, 2 col tablet, 1 col mobile) ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach, i) => (
            <AchievementCard key={ach.id} ach={ach} index={i} isInView={isInView} />
          ))}
        </div>

        <p className="text-center text-slate-500 text-xs font-space mt-8">
          Showing 12 of 150+ chemical achievements
        </p>
      </div>
    </section>
  );
}
