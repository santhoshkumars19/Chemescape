import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Lock, FlaskConical, Zap, Trophy, ArrowRight } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

const steps = [
  {
    id: 'step-1',
    num: '01',
    icon: Lock,
    title: 'Enter the Lab',
    desc: 'Choose your escape room. Each lab is sealed — your only way out is through chemistry.',
    color: '#00d4ff',
  },
  {
    id: 'step-2',
    num: '02',
    icon: FlaskConical,
    title: 'Solve the Puzzles',
    desc: 'Mix compounds, balance equations, identify elements. Every correct answer opens a new door.',
    color: '#a855f7',
  },
  {
    id: 'step-3',
    num: '03',
    icon: Zap,
    title: 'Race the Clock',
    desc: 'Alarms are blaring. Earn bonus XP for speed. Problem hints are limited — use them wisely.',
    color: '#ec4899',
  },
  {
    id: 'step-4',
    num: '04',
    icon: Trophy,
    title: 'Claim Your Rank',
    desc: 'Escape and earn your title. Climb the global leaderboard and unlock rare achievements.',
    color: '#fbbf24',
  },
];

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const { navigateTo } = useNavigation();

  return (
    <section id="how-it-works" className="relative py-16 md:py-24 bg-slate-950/60 border-t border-white/5 overflow-hidden">
      {/* Background glow blobs */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }}
      />
      <div
        className="absolute right-0 top-1/4 w-60 h-60 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-[1440px] mx-auto px-4 md:px-6" ref={ref}>
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass border border-cyan-500/20 text-xs font-orbitron font-bold text-cyan-400 tracking-widest uppercase mb-4">
            <Zap size={13} />
            <span>Game Loop</span>
          </div>

          <h2 className="font-orbitron font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-wide uppercase mb-3">
            HOW TO <span className="gradient-text-cyan-purple">ESCAPE</span>
          </h2>

          <p className="text-slate-400 font-space text-xs sm:text-sm max-w-xl mx-auto">
            Four steps between you and freedom. Master them all to become a legendary chemist.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
          {/* Connector Line (Desktop lg+) */}
          <div
            className="absolute top-16 left-12 right-12 h-0.5 hidden lg:block pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), rgba(168,85,247,0.4), rgba(236,72,153,0.4), transparent)',
            }}
          />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                id={step.id}
                className="relative flex flex-col items-center text-center p-6 rounded-2xl glass border border-white/5 backdrop-blur-md"
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {/* Circle Icon */}
                <div className="relative z-10 mb-5">
                  <motion.div
                    className="w-24 h-24 rounded-full flex items-center justify-center glass-strong border relative shadow-xl"
                    style={{ borderColor: `${step.color}40` }}
                    whileHover={{ scale: 1.06 }}
                  >
                    {/* Rotating Ring */}
                    <motion.div
                      className="absolute inset-1.5 rounded-full border border-dashed opacity-40"
                      style={{ borderColor: step.color }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                    />

                    <div className="relative flex flex-col items-center">
                      <Icon size={24} style={{ color: step.color }} />
                      <span
                        className="font-orbitron text-[10px] font-extrabold mt-1 tracking-widest"
                        style={{ color: step.color }}
                      >
                        {step.num}
                      </span>
                    </div>
                  </motion.div>
                </div>

                {/* Content */}
                <h3 className="font-orbitron font-bold text-white text-base mb-2">{step.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed font-space max-w-[240px]">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Button Container */}
        <motion.div
          className="text-center pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.button
            onClick={() => navigateTo('standards')}
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl font-orbitron font-black text-xs md:text-sm tracking-widest uppercase text-white shadow-xl cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #7c3aed, #ec4899)',
              boxShadow: '0 0 30px rgba(124,58,237,0.3)',
            }}
            whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(124,58,237,0.5)' }}
            whileTap={{ scale: 0.97 }}
            id="start-escaping-btn"
          >
            <span>Start Escaping Now</span>
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
