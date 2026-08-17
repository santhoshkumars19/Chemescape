import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Gamepad2, DoorOpen, FlaskConical, Bot,
  BarChart3, Trophy, Star, Atom
} from 'lucide-react';

const features = [
  {
    id: 'gamified-learning',
    icon: Gamepad2,
    title: 'Gamified Learning',
    description: 'Learn chemistry through immersive gameplay mechanics. XP systems, skill trees, and dynamic difficulty keep you hooked.',
    color: '#00d4ff',
    glow: 'rgba(0,212,255,0.15)',
    tag: 'Core Feature',
  },
  {
    id: 'escape-rooms',
    icon: DoorOpen,
    title: 'Escape Rooms',
    description: '12 unique chemistry-themed escape rooms. Each room escalates in complexity with multi-step reactions and hidden clues.',
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.15)',
    tag: 'Adventure',
  },
  {
    id: 'interactive-puzzles',
    icon: FlaskConical,
    title: 'Interactive Chemistry Puzzles',
    description: 'Mix reagents, balance equations, and simulate real lab experiments in our hyper-realistic puzzle engine.',
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.15)',
    tag: 'Simulation',
  },
  {
    id: 'ai-assistant',
    icon: Bot,
    title: 'AI Learning Assistant',
    description: 'Your personal AI lab partner guides you through concepts, explains solutions, and adapts to your learning pace.',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.15)',
    tag: 'AI Powered',
  },
  {
    id: 'progress-tracking',
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Real-time analytics on your performance. Track mastery levels, reaction speed, and improvement over time.',
    color: '#818cf8',
    glow: 'rgba(129,140,248,0.15)',
    tag: 'Analytics',
  },
  {
    id: 'leaderboard',
    icon: Trophy,
    title: 'Global Leaderboard',
    description: 'Compete with students worldwide. Weekly resets, seasonal rankings, and exclusive rewards for top chemists.',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.15)',
    tag: 'Competitive',
  },
  {
    id: 'achievements',
    icon: Star,
    title: 'Achievements',
    description: '150+ unique achievement badges. Unlock rare titles like "Quantum Chemist" and "Molecular Mastermind."',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.15)',
    tag: 'Rewards',
  },
  {
    id: 'periodic-table',
    icon: Atom,
    title: 'Living Periodic Table',
    description: 'An interactive 3D periodic table that unlocks elements as you progress, revealing hidden chemistry stories.',
    color: '#f472b6',
    glow: 'rgba(244,114,182,0.15)',
    tag: 'Interactive',
  },
];

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  return (
    <motion.div
      id={feature.id}
      className="group relative rounded-2xl p-6 flex flex-col justify-between backdrop-blur-md transition-all cursor-pointer overflow-hidden border border-white/10"
      style={{
        background: `linear-gradient(135deg, ${feature.glow} 0%, rgba(255,255,255,0.02) 100%)`,
      }}
      whileHover={{
        y: -4,
        borderColor: `${feature.color}60`,
        boxShadow: `0 16px 40px ${feature.glow}`,
      }}
      transition={{ duration: 0.3 }}
    >
      <div>
        {/* Tag */}
        <div
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold mb-4 tracking-widest uppercase border"
          style={{ background: `${feature.color}15`, color: feature.color, borderColor: `${feature.color}30` }}
        >
          {feature.tag}
        </div>

        {/* Icon & Title */}
        <div className="flex items-center gap-3.5 mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center relative flex-shrink-0 border"
            style={{ background: `${feature.color}15`, borderColor: `${feature.color}30` }}
          >
            <Icon size={20} style={{ color: feature.color }} />
          </div>
          <h3 className="font-orbitron font-bold text-white text-base leading-snug">{feature.title}</h3>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-space">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <section id="features" className="relative py-16 md:py-24 border-t border-white/5 overflow-hidden">
      <div className="relative max-w-[1440px] mx-auto px-4 md:px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass border border-purple-500/30 text-xs font-orbitron font-bold text-purple-300 tracking-widest uppercase mb-4">
            <Atom size={14} />
            <span>Game Features</span>
          </div>

          <h2 className="font-orbitron font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-wide uppercase mb-3">
            CHEMISTRY <span className="gradient-text-cyan-purple">REIMAGINED</span>
          </h2>

          <p className="text-slate-400 font-space text-xs sm:text-sm max-w-xl mx-auto">
            Where the periodic table meets the pulse of a thriller. Every puzzle is a chemical reaction waiting to happen.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
