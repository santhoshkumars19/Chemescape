import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { FlaskConical } from 'lucide-react';

const LOADING_STEPS = [
  { text: 'Initializing laboratory…', duration: 700 },
  { text: 'Loading periodic table…', duration: 600 },
  { text: 'Calibrating reaction engine…', duration: 700 },
  { text: 'Activating escape protocols…', duration: 600 },
  { text: 'Ready. Enter the lab.', duration: 500 },
];

function AtomRing({ size = 200, color = '#00d4ff', duration = 4, rx = 1, ry = 0.4, rotate = 0 }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      style={{ rotate }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <ellipse
          cx={size / 2} cy={size / 2}
          rx={(size / 2 - 4) * rx}
          ry={(size / 2 - 4) * ry}
          stroke={color} strokeWidth="1" fill="none" opacity="0.3"
        />
        <motion.circle
          cx={size / 2 + (size / 2 - 4) * rx}
          cy={size / 2}
          r="4"
          fill={color}
          animate={{
            cx: [
              size / 2 + (size / 2 - 6) * rx,
              size / 2,
              size / 2 - (size / 2 - 6) * rx,
              size / 2,
              size / 2 + (size / 2 - 6) * rx,
            ],
            cy: [
              size / 2,
              size / 2 + (size / 2 - 6) * ry,
              size / 2,
              size / 2 - (size / 2 - 6) * ry,
              size / 2,
            ],
          }}
          transition={{ duration, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
    </motion.div>
  );
}

export default function SplashScreen({ onDone }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const { navigateTo } = useNavigation();

  useEffect(() => {
    let total = LOADING_STEPS.reduce((a, s) => a + s.duration, 0);
    let elapsed = 0;
    let step = 0;

    const interval = setInterval(() => {
      elapsed += 50;
      setProgress(Math.min((elapsed / total) * 100, 100));
      if (elapsed >= LOADING_STEPS.slice(0, step + 1).reduce((a, s) => a + s.duration, 0)) {
        step = Math.min(step + 1, LOADING_STEPS.length - 1);
        setStepIdx(step);
      }
    }, 50);

    const totalTime = total + 300;
    const done = setTimeout(() => {
      clearInterval(interval);
      setFadeOut(true);
      setTimeout(() => {
        if (onDone) onDone();
        else navigateTo('login');
      }, 600);
    }, totalTime);

    return () => { clearInterval(interval); clearTimeout(done); };
  }, [navigateTo, onDone]);

  return (
    <AnimatePresence>
      {!fadeOut ? (
        <motion.div
          key="splash"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#040810' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background ambient glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
            <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />
          </div>

          {/* Hex grid */}
          <div className="absolute inset-0 lab-grid opacity-20 pointer-events-none" />

          {/* Main atom visual */}
          <div className="relative w-52 h-52 flex items-center justify-center mb-10">
            <motion.div
              className="absolute rounded-full"
              style={{ width: 220, height: 220, border: '1px solid rgba(0,212,255,0.1)' }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            <AtomRing size={180} color="#00d4ff" duration={3.5} rx={1} ry={0.35} rotate={0} />
            <AtomRing size={180} color="#a855f7" duration={5} rx={0.85} ry={0.45} rotate={60} />
            <AtomRing size={180} color="#ec4899" duration={4} rx={0.9} ry={0.38} rotate={120} />

            <motion.div
              className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #00d4ff20, #7c3aed30)',
                border: '2px solid rgba(0,212,255,0.3)',
                boxShadow: '0 0 40px rgba(0,212,255,0.3), 0 0 80px rgba(124,58,237,0.2)',
              }}
              animate={{ boxShadow: ['0 0 30px rgba(0,212,255,0.3)', '0 0 60px rgba(0,212,255,0.5)', '0 0 30px rgba(0,212,255,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FlaskConical size={26} style={{ color: '#00d4ff' }} />
            </motion.div>
          </div>

          {/* Title */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <h1 className="font-orbitron font-black text-4xl sm:text-5xl gradient-text-cyan-purple tracking-widest mb-2">
              CHEMESCAPE
            </h1>
            <p className="font-space text-white/35 tracking-[0.4em] text-xs uppercase">
              Escape the Lab
            </p>
          </motion.div>

          {/* Loading bar */}
          <div className="w-64 sm:w-80">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-4">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #00d4ff, #7c3aed, #ec4899)',
                  boxShadow: '0 0 10px rgba(0,212,255,0.5)',
                }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={stepIdx}
                className="text-center text-xs font-space text-white/35 tracking-widest"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
              >
                {LOADING_STEPS[stepIdx].text}
              </motion.p>
            </AnimatePresence>

            <p className="text-center font-orbitron text-xs text-white/20 mt-2 tracking-widest">
              {Math.round(progress)}%
            </p>
          </div>

          {/* Skip */}
          <motion.button
            className="absolute bottom-8 text-xs text-white/20 font-space tracking-widest hover:text-white/50 transition-colors bg-transparent border-0 cursor-pointer"
            onClick={() => navigateTo('login')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            id="splash-skip-btn"
          >
            SKIP →
          </motion.button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
