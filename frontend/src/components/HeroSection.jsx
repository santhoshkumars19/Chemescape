import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Play, Shield, Sparkles } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

function MoleculeFloat({ delay = 0, x = '10%', top = '20%', size = 60, color = '#00d4ff' }) {
  return (
    <motion.div
      className="absolute pointer-events-none z-0 hidden md:block"
      style={{ left: x, top }}
      animate={{
        y: [0, -25, 0],
        rotate: [0, 15, -15, 0],
        scale: [1, 1.05, 0.95, 1],
      }}
      transition={{
        duration: 8 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        <line x1="40" y1="40" x2="20" y2="20" stroke={color} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        <line x1="40" y1="40" x2="65" y2="25" stroke={color} strokeWidth="1.5" opacity="0.6" />
        <line x1="40" y1="40" x2="40" y2="68" stroke={color} strokeWidth="1.5" opacity="0.6" />
        <circle cx="40" cy="40" r="12" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2" />
        <circle cx="20" cy="20" r="8" fill="#a855f7" fillOpacity="0.3" stroke="#a855f7" strokeWidth="1.5" />
        <circle cx="65" cy="25" r="7" fill="#00d4ff" fillOpacity="0.3" stroke="#00d4ff" strokeWidth="1.5" />
        <circle cx="40" cy="68" r="9" fill="#ec4899" fillOpacity="0.3" stroke="#ec4899" strokeWidth="1.5" />
      </svg>
    </motion.div>
  );
}

function FloatingBeaker({ x, top, delay }) {
  return (
    <motion.div
      className="absolute pointer-events-none opacity-20 z-0 hidden lg:block"
      style={{ left: x, top }}
      animate={{ y: [0, -30, 0], rotate: [0, 8, -8, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <div className="w-14 h-18 border-2 border-cyan-400 rounded-b-2xl relative overflow-hidden flex items-end p-1">
        <motion.div
          className="w-full bg-gradient-to-t from-cyan-500 to-purple-500 rounded-b-xl"
          animate={{ height: ['40%', '65%', '40%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
}

function FloatingTestTube({ x, top, delay }) {
  return (
    <motion.div
      className="absolute pointer-events-none opacity-20 z-0 hidden lg:block"
      style={{ left: x, top }}
      animate={{ y: [0, 25, 0], rotate: [0, -12, 12, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <div className="w-5 h-20 border-2 border-purple-400 rounded-b-full relative overflow-hidden flex items-end p-0.5">
        <motion.div
          className="w-full bg-gradient-to-t from-pink-500 to-purple-500 rounded-b-full"
          animate={{ height: ['30%', '70%', '30%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
}

export default function HeroSection() {
  const { navigateTo } = useNavigation();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      id="play"
      className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden lab-grid pt-24 md:pt-32 pb-16 w-full"
    >
      {/* Background Floating Elements Wrapper - clipped */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Radial ambient glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] sm:w-[700px] h-[600px] sm:h-[700px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)' }} />

        {/* Floating lab elements */}
        <MoleculeFloat delay={0} x="6%" top="18%" size={70} color="#00d4ff" />
        <MoleculeFloat delay={1.5} x="82%" top="14%" size={50} color="#a855f7" />
        <MoleculeFloat delay={3} x="85%" top="55%" size={40} color="#00d4ff" />
        <MoleculeFloat delay={0.5} x="4%" top="60%" size={36} color="#ec4899" />
        <FloatingBeaker x="76%" top="25%" delay={0.5} />
        <FloatingBeaker x="12%" top="42%" delay={2} />
        <FloatingTestTube x="88%" top="42%" delay={1} />
        <FloatingTestTube x="4%" top="32%" delay={3} />

        {/* Horizontal scan line */}
        <motion.div
          className="absolute left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)' }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Main content - perfectly centered */}
      <motion.div
        className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto w-full flex flex-col items-center justify-center"
        style={{ y, opacity }}
      >
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-emerald-500/30 text-xs font-orbitron text-emerald-300 tracking-widest uppercase mb-6 shadow-lg shadow-emerald-500/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Sparkles size={13} className="text-emerald-400" />
          <span>Gamified Educational Quiz Platform</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          className="font-orbitron font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white mb-6 uppercase leading-tight text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          MASTER YOUR <br className="hidden sm:inline" />
          <span className="gradient-text-emerald">CURRICULUM</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="font-space text-base sm:text-lg text-slate-300 max-w-xl mx-auto mb-10 leading-relaxed font-normal text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.7 }}
        >
          Master curriculum topics, solve interactive chapter quizzes, and climb to the top of the leaderboard.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.7 }}
        >
          {/* Play Now */}
          <motion.button
            onClick={() => navigateTo('login')}
            className="relative group flex items-center justify-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl overflow-hidden font-orbitron font-extrabold text-sm sm:text-base tracking-widest text-[#050807] uppercase cursor-pointer whitespace-nowrap w-full sm:w-auto"
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              boxShadow: '0 0 30px rgba(16,185,129,0.35)',
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 50px rgba(16,185,129,0.55)',
            }}
            whileTap={{ scale: 0.97 }}
            id="play-now-btn"
          >
            <motion.div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)' }}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Play size={18} className="relative z-10 fill-[#050807]" />
            <span className="relative z-10">Play Now</span>
          </motion.button>

          {/* Learn More */}
          <motion.a
            href="#how-it-works"
            className="group flex items-center justify-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl glass-strong border border-emerald-500/20 font-space font-semibold text-sm sm:text-base text-emerald-300 hover:text-white tracking-wide transition-all duration-300 hover:border-emerald-500/40 whitespace-nowrap w-full sm:w-auto"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            id="learn-more-btn"
          >
            <Shield size={16} className="text-emerald-400" />
            Learn More
          </motion.a>
        </motion.div>
      </motion.div>
    </section>
  );
}
