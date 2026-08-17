import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import {
  Heart, Lightbulb, Clock, ArrowLeft, CheckCircle,
  RotateCcw, ChevronRight, Zap, Terminal, Cpu,
  Wifi, Shield, Key, AlertCircle,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
// STAGE DATA
// ═══════════════════════════════════════════════════════
const STAGES = [
  {
    id: 'boot',
    module: 'BOOT ROM',
    moduleIcon: '💾',
    color: '#00ff88',
    type: 'identify',
    element: { sym: 'Ne', num: 10, name: 'Neon', period: 2, group: 'Noble Gas' },
    config: '1s² 2s² 2p⁶',
    question: 'Identify the element that matches this complete electron configuration.',
    hint: 'Noble gases have fully filled outer shells. Count the electrons: 2 + 2 + 6 = 10 total.',
    choices: [
      { sym: 'He', name: 'Helium',  correct: false, num: 2,  sub: '1s² only' },
      { sym: 'Ne', name: 'Neon',    correct: true,  num: 10, sub: 'Period 2 · Group 18' },
      { sym: 'Ar', name: 'Argon',   correct: false, num: 18, sub: '3s² 3p⁶ outer' },
      { sym: 'F',  name: 'Fluorine',correct: false, num: 9,  sub: '2p⁵ outer' },
    ],
    bootLine: '[BOOT] System kernel verified — Neon (Z=10) configuration matched. Shell 1s² 2s² 2p⁶ valid.',
  },
  {
    id: 'subshell',
    module: 'SUBSHELL ALLOCATOR',
    moduleIcon: '⚡',
    color: '#00d4ff',
    type: 'fill_count',
    element: { sym: 'Cr', num: 24, name: 'Chromium', period: 4, group: 'Transition Metal' },
    config: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s¹ 3d⁵',
    question: 'Chromium is an Aufbau exception (4s¹ 3d⁵). How many total d-electrons are present?',
    hint: 'Look at the last term: 3d⁵ has 5 electrons in the d-subshell (half-filled stability exception).',
    choices: [
      { label: '4 electrons', value: 4, correct: false, reason: '4s² 3d⁴ would be un-promoted' },
      { label: '5 electrons', value: 5, correct: true,  reason: 'Correct! 3d⁵ half-filled d-subshell is extra stable' },
      { label: '6 electrons', value: 6, correct: false, reason: 'Too many for chromium' },
      { label: '2 electrons', value: 2, correct: false, reason: 'Too few d-electrons' },
    ],
    bootLine: '[SUBSHELL] Aufbau exception resolved — Chromium 3d⁵ half-filled subshell stabilized.',
  },
  {
    id: 'aufbau',
    module: 'AUFBAU LOGIC CORE',
    moduleIcon: '⚙️',
    color: '#a855f7',
    type: 'sequence',
    element: { sym: 'Fe', num: 26, name: 'Iron', period: 4, group: 'Transition Metal' },
    config: '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶',
    question: 'Arrange the filling order of subshells according to the (n+l) Aufbau rule:',
    hint: '3p (n+l=4) fills before 4s (n+l=4, but lower n), which fills before 3d (n+l=5). Order: 3p → 4s → 3d.',
    steps: [
      { label: '3p subshell', id: '3p' },
      { label: '4s subshell', id: '4s' },
      { label: '3d subshell', id: '3d' },
    ],
    correctOrder: ['3p', '4s', '3d'],
    bootLine: '[AUFBAU] Subshell filling sequence 3p → 4s → 3d validated. Energy levels synchronized.',
  },
  {
    id: 'valence',
    module: 'VALENCE BUS GATEWAY',
    moduleIcon: '💎',
    color: '#fbbf24',
    type: 'valence',
    element: { sym: 'Cl', num: 17, name: 'Chlorine', period: 3, group: 'Halogen' },
    config: '1s² 2s² 2p⁶ 3s² 3p⁵',
    question: 'Chlorine (Z=17) is in Group 17. How many valence (outermost shell) electrons does it have?',
    hint: 'Count the highest principal quantum number (n=3) electrons: 3s² + 3p⁵ = ? valence electrons.',
    choices: [
      { val: 5, label: '5 valence e⁻', correct: false },
      { val: 7, label: '7 valence e⁻', correct: true },
      { val: 8, label: '8 valence e⁻', correct: false },
      { val: 17, label: '17 total e⁻',  correct: false },
    ],
    bootLine: '[GATEWAY] Valence bus unlocked — Chlorine 7 valence electrons matched. Terminal fully operational!',
  },
];

const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// ═══════════════════════════════════════════════════════
// SUB-PUZZLE COMPONENTS
// ═══════════════════════════════════════════════════════

function IdentifyPuzzle({ stage, onCorrect, onWrong, disabled }) {
  const [selected, setSelected] = useState(null);

  const handleChoose = (c) => {
    if (disabled) return;
    setSelected(c.sym);
    if (c.correct) onCorrect(); else onWrong();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Configuration display */}
      <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.2)' }}>
        <p style={{ fontSize: 10, fontFamily: 'Orbitron,monospace', color: '#00ff88', letterSpacing: '0.2em', marginBottom: 6 }}>
          TARGET ELECTRON CONFIGURATION
        </p>
        <p style={{ fontSize: 24, fontFamily: 'Orbitron,monospace', fontWeight: 800, color: '#fff', letterSpacing: '0.15em' }}>
          {stage.config}
        </p>
      </div>

      {/* Choices grid */}
      <div className="grid grid-cols-2 gap-3">
        {stage.choices.map((c) => {
          const isSel = selected === c.sym;
          return (
            <motion.button
              key={c.sym}
              onClick={() => handleChoose(c)}
              disabled={disabled}
              className="p-4 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer"
              style={{
                background: isSel ? (c.correct ? 'rgba(52,211,153,0.18)' : 'rgba(239,68,68,0.18)') : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSel ? (c.correct ? '#34d399' : '#ef4444') : 'rgba(255,255,255,0.08)'}`,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center font-orbitron font-bold text-lg flex-shrink-0"
                style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
                {c.sym}
              </div>
              <div>
                <p style={{ fontFamily: 'Orbitron,monospace', fontSize: 12, fontWeight: 700, color: '#fff' }}>{c.name}</p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter,sans-serif' }}>Z = {c.num} · {c.sub}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function FillCountPuzzle({ stage, onCorrect, onWrong, disabled }) {
  const [selected, setSelected] = useState(null);

  const handleChoose = (c) => {
    if (disabled) return;
    setSelected(c.value);
    if (c.correct) onCorrect(); else onWrong();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)' }}>
        <p style={{ fontSize: 10, fontFamily: 'Orbitron,monospace', color: '#00d4ff', letterSpacing: '0.2em', marginBottom: 6 }}>
          CHROMIUM (Z=24) CONFIGURATION
        </p>
        <p style={{ fontSize: 20, fontFamily: 'Orbitron,monospace', fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>
          {stage.config}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stage.choices.map((c) => {
          const isSel = selected === c.value;
          return (
            <motion.button
              key={c.value}
              onClick={() => handleChoose(c)}
              disabled={disabled}
              className="p-4 rounded-xl flex flex-col justify-between text-left transition-all cursor-pointer"
              style={{
                background: isSel ? (c.correct ? 'rgba(52,211,153,0.18)' : 'rgba(239,68,68,0.18)') : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSel ? (c.correct ? '#34d399' : '#ef4444') : 'rgba(255,255,255,0.08)'}`,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p style={{ fontFamily: 'Orbitron,monospace', fontSize: 14, fontWeight: 800, color: c.correct && isSel ? '#34d399' : '#fff' }}>
                {c.label}
              </p>
              <p style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter,sans-serif', marginTop: 4 }}>
                {c.reason}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function SequencePuzzle({ stage, onCorrect, onWrong, disabled }) {
  const [order, setOrder] = useState(stage.steps);

  const moveUp = (idx) => {
    if (idx === 0 || disabled) return;
    const next = [...order];
    const temp = next[idx - 1];
    next[idx - 1] = next[idx];
    next[idx] = temp;
    setOrder(next);
  };

  const handleVerify = () => {
    if (disabled) return;
    const currentOrderIds = order.map(s => s.id);
    const isMatch = currentOrderIds.every((id, i) => id === stage.correctOrder[i]);
    if (isMatch) onCorrect(); else onWrong();
  };

  return (
    <div className="flex flex-col gap-4">
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter,sans-serif' }}>
        Use buttons to order the subshells in ascending energy order:
      </p>

      <div className="flex flex-col gap-2">
        {order.map((step, idx) => (
          <div
            key={step.id}
            className="p-3.5 rounded-xl flex items-center justify-between"
            style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}
          >
            <div className="flex items-center gap-3">
              <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 11, color: '#a855f7', fontWeight: 800 }}>#{idx + 1}</span>
              <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, color: '#fff', fontWeight: 700 }}>{step.label}</span>
            </div>
            {idx > 0 && (
              <button
                onClick={() => moveUp(idx)}
                className="px-3 py-1 rounded-lg text-xs font-orbitron font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 cursor-pointer"
              >
                ↑ Move Up
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleVerify}
        disabled={disabled}
        className="w-full py-3 rounded-xl font-orbitron font-bold text-xs uppercase tracking-widest text-white cursor-pointer"
        style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)', boxShadow: '0 0 20px rgba(168,85,247,0.3)' }}
      >
        Verify Subshell Order
      </button>
    </div>
  );
}

function ValencePuzzle({ stage, onCorrect, onWrong, disabled }) {
  const [selected, setSelected] = useState(null);

  const handleChoose = (c) => {
    if (disabled) return;
    setSelected(c.val);
    if (c.correct) onCorrect(); else onWrong();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
        <p style={{ fontSize: 10, fontFamily: 'Orbitron,monospace', color: '#fbbf24', letterSpacing: '0.2em', marginBottom: 6 }}>
          CHLORINE (Z=17) ELECTRON SHELLS
        </p>
        <p style={{ fontSize: 22, fontFamily: 'Orbitron,monospace', fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>
          {stage.config}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stage.choices.map((c) => {
          const isSel = selected === c.val;
          return (
            <motion.button
              key={c.val}
              onClick={() => handleChoose(c)}
              disabled={disabled}
              className="p-4 rounded-xl text-center transition-all cursor-pointer"
              style={{
                background: isSel ? (c.correct ? 'rgba(52,211,153,0.18)' : 'rgba(239,68,68,0.18)') : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSel ? (c.correct ? '#34d399' : '#ef4444') : 'rgba(255,255,255,0.08)'}`,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p style={{ fontFamily: 'Orbitron,monospace', fontSize: 15, fontWeight: 800, color: isSel && c.correct ? '#34d399' : '#fff' }}>
                {c.label}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Boot Complete Overlay
function BootCompleteOverlay({ onExit }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-w-md w-full p-8 rounded-3xl text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,rgba(4,20,12,0.95),rgba(2,10,6,0.98))',
          border: '2px solid rgba(0,255,136,0.5)',
          boxShadow: '0 0 60px rgba(0,255,136,0.25)',
        }}
        initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 20 }}
      >
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
          style={{ background: 'rgba(0,255,136,0.15)', border: '2px solid rgba(0,255,136,0.4)' }}>
          💻
        </div>

        <h3 className="font-orbitron font-black text-2xl text-white mb-1">COMPUTER REPAIRED!</h3>
        <p className="font-space text-xs text-emerald-400 tracking-widest uppercase mb-6">Terminal Boot ROM Restored · Boss Access Unlocked</p>

        <p className="text-white/60 text-xs font-inter leading-relaxed mb-6">
          All 4 electron configuration diagnostic modules have been verified and patched. The lab security exit door is now powered up for the final boss battle!
        </p>

        <button
          onClick={onExit}
          className="w-full py-3.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-widest text-white shadow-xl cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#00ff88,#059669)', boxShadow: '0 0 25px rgba(0,255,136,0.4)', color: '#040810' }}
        >
          Face AEGIS-9000 Boss Battle →
        </button>
      </motion.div>
    </motion.div>
  );
}

// GameOver Overlay
function GameOverScreen({ onRetry }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="max-w-sm w-full p-6 rounded-2xl text-center bg-slate-900 border border-red-500/40">
        <span className="text-4xl block mb-2">💥</span>
        <h3 className="font-orbitron font-bold text-xl text-white mb-1">TERMINAL CRASHED</h3>
        <p className="text-xs text-red-400 font-space mb-6">Electron configuration memory fault triggered core shutdown.</p>
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-orbitron font-bold text-xs uppercase tracking-widest cursor-pointer"
        >
          Reboot Terminal
        </button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN ROOM 3 PAGE
// ═══════════════════════════════════════════════════════
export default function Room3Page() {
  const { navigateTo } = useNavigation();

  const [stageIdx,  setStageIdx]  = useState(0);
  const [completed, setCompleted] = useState(0);
  const [lives,     setLives]     = useState(3);
  const [timer,     setTimer]     = useState(600);
  const [hints,     setHints]     = useState(3);
  const [showHint,  setShowHint]  = useState(false);
  const [bootLines, setBootLines] = useState([]);
  const [feedback,  setFeedback]  = useState(null);
  const [won,       setWon]       = useState(false);
  const [gameOver,  setGameOver]  = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);

  const stage = STAGES[stageIdx];

  useEffect(() => {
    if (won || gameOver) return;
    const t = setInterval(() => setTimer(s => {
      if (s <= 1) { setGameOver(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [won, gameOver]);

  const handleCorrect = () => {
    setFeedback('correct');
    setBootLines(prev => [...prev, stage.bootLine]);
    const next = stageIdx + 1;
    setTimeout(() => {
      setFeedback(null);
      setCompleted(next);
      setShowHint(false);
      if (next >= STAGES.length) {
        setWon(true);
      } else {
        setStageIdx(next);
      }
    }, 700);
  };

  const handleWrong = () => {
    setFeedback('wrong');
    setWrongFlash(true);
    setLives(prev => {
      const next = Math.max(0, prev - 1);
      if (next <= 0) setTimeout(() => setGameOver(true), 700);
      return next;
    });
    setTimeout(() => { setFeedback(null); setWrongFlash(false); }, 700);
  };

  const handleHint = () => {
    if (hints <= 0) return;
    setHints(h => h - 1);
    setShowHint(true);
    setTimeout(() => setShowHint(false), 5000);
  };

  const reset = () => {
    setStageIdx(0); setCompleted(0); setLives(3); setTimer(600);
    setHints(3); setShowHint(false); setBootLines([]);
    setFeedback(null); setWon(false); setGameOver(false); setWrongFlash(false);
  };

  const timerRed = timer < 120;

  const renderPuzzle = () => {
    const props = { stage, onCorrect: handleCorrect, onWrong: handleWrong, disabled: !!feedback };
    switch (stage.type) {
      case 'identify': return <IdentifyPuzzle {...props} />;
      case 'fill_count': return <FillCountPuzzle {...props} />;
      case 'sequence': return <SequencePuzzle {...props} />;
      case 'valence':  return <ValencePuzzle {...props} />;
      default: return null;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col select-none"
      style={{ background: '#020e06' }}>

      {/* Wrong flash */}
      <AnimatePresence>
        {wrongFlash && (
          <motion.div className="fixed inset-0 z-40 pointer-events-none"
            style={{ background: 'rgba(239,68,68,0.1)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} />
        )}
      </AnimatePresence>

      {/* ── TOP HUD ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 h-14 z-30"
        style={{ background: 'rgba(0,8,3,0.97)', borderBottom: '1px solid rgba(0,255,136,0.1)', backdropFilter: 'blur(12px)' }}>
        <button
          onClick={() => navigateTo('lab')}
          className="flex items-center gap-1.5 text-white/25 hover:text-white/55 text-xs font-space transition-colors bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={13} /> Lab
        </button>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.07)' }} />
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.18)' }}>
          <Terminal size={11} style={{ color: '#00ff88' }} />
          <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#00ff88', letterSpacing: '0.15em' }}>
            ROOM 3 · REPAIR LABORATORY COMPUTER
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Clock size={11} className={timerRed ? 'text-red-400' : 'text-white/30'} />
          <motion.span className="font-orbitron font-bold text-sm" style={{ color: timerRed ? '#f87171' : 'white' }}
            animate={timerRed ? { opacity: [1, 0.4, 1] } : {}} transition={{ duration: 0.6, repeat: Infinity }}>
            {fmtTime(timer)}
          </motion.span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Lives */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart key={i} size={14} className={i < lives ? 'text-rose-500 fill-rose-500' : 'text-white/10'} />
            ))}
          </div>

          {/* Hint */}
          <button
            onClick={handleHint}
            disabled={hints <= 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-space text-xs transition-colors cursor-pointer ${
              hints > 0 ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20' : 'bg-white/5 text-white/20 border border-white/5'
            }`}
          >
            <Lightbulb size={13} className="text-amber-400" />
            <span>Hint ({hints})</span>
          </button>
        </div>
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 flex p-4 gap-4 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left: Terminal Console */}
        <div className="w-80 flex flex-col p-4 rounded-2xl font-mono text-xs overflow-hidden"
          style={{ background: '#020b05', border: '1px solid rgba(0,255,136,0.2)' }}>
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-500/20">
            <span style={{ color: '#00ff88', fontFamily: 'Orbitron,monospace', fontSize: 10 }}>TERMINAL LOG</span>
            <span className="text-white/30 text-[9px]">{completed}/4 REPAIRED</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 text-emerald-400/80 pr-1 no-scrollbar">
            <p className="text-white/30">[SYS_INIT] Booting Diagnostic Suite v4.02…</p>
            <p className="text-white/30">[SCAN] 4 Configuration modules corrupted.</p>
            {bootLines.map((line, i) => (
              <p key={i} className="text-emerald-300 font-semibold">{line}</p>
            ))}
          </div>
        </div>

        {/* Right: CRT Terminal Display */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 rounded-t-2xl flex flex-col justify-between relative overflow-hidden"
            style={{ background: 'radial-gradient(ellipse at center, #051a0d 0%, #020b05 100%)', border: '2px solid rgba(0,255,136,0.3)' }}>
            {/* Header info */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <span className="text-lg">{stage.moduleIcon}</span>
                <h3 className="font-orbitron font-bold text-sm text-emerald-400">{stage.module}</h3>
              </div>
              <span className="text-xs font-orbitron font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: `${stage.color}15`, color: stage.color, border: `1px solid ${stage.color}30` }}>
                STAGE {stageIdx + 1}/4
              </span>
            </div>

            {/* Question & Hint */}
            <div className="my-auto py-4">
              <p className="font-space text-white/90 text-sm mb-4">{stage.question}</p>

              <AnimatePresence>
                {showHint && (
                  <motion.div className="flex items-start gap-2 p-3 rounded-xl mb-4"
                    style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Lightbulb size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p style={{ fontSize: 11, color: 'rgba(251,191,36,0.85)', fontFamily: 'Inter,sans-serif', lineHeight: 1.6 }}>{stage.hint}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Puzzle */}
              {renderPuzzle()}
            </div>
          </div>

          <div style={{ height: 8, background: 'linear-gradient(135deg,#0a1208,#060a04)', borderTop: '1px solid rgba(0,255,136,0.06)', borderRadius: '0 0 10px 10px', display: 'flex', alignItems: 'center', justifyCenter: 'center' }}>
            <div style={{ width: 60, height: 3, background: 'rgba(0,255,136,0.1)', borderRadius: 2 }} />
          </div>
        </div>
      </div>

      {/* OVERLAYS */}
      <AnimatePresence>{won && <BootCompleteOverlay onExit={() => navigateTo('boss')} />}</AnimatePresence>
      <AnimatePresence>{gameOver && !won && <GameOverScreen onRetry={reset} />}</AnimatePresence>
    </div>
  );
}
