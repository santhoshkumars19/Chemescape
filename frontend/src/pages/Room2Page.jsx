import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import {
  Heart, Lightbulb, Clock, ArrowLeft, CheckCircle,
  RotateCcw, Key, ChevronRight, Zap, ShieldAlert,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════
const GROUPS = [
  { id: 'alkali',     label: 'Alkali Metals',    icon: '⚡', color: '#f97316', border: 'rgba(249,115,22,0.45)', bg: 'rgba(249,115,22,0.06)', desc: 'Group 1 · Highly reactive metals' },
  { id: 'halogen',    label: 'Halogens',          icon: '🔥', color: '#ef4444', border: 'rgba(239,68,68,0.45)',  bg: 'rgba(239,68,68,0.06)',  desc: 'Group 17 · Reactive non-metals' },
  { id: 'noble',      label: 'Noble Gases',       icon: '💎', color: '#a855f7', border: 'rgba(168,85,247,0.45)', bg: 'rgba(168,85,247,0.06)', desc: 'Group 18 · Inert, full valence shells' },
  { id: 'transition', label: 'Transition Metals', icon: '⚙️', color: '#22d3ee', border: 'rgba(34,211,238,0.45)', bg: 'rgba(34,211,238,0.06)', desc: 'd-block · Variable valency' },
];

const ELEMENTS = [
  { id: 'Li', sym: 'Li', num: 3,  name: 'Lithium',   group: 'alkali',     mass: '6.94',  color: '#f97316', fact: 'Lightest solid metal' },
  { id: 'Na', sym: 'Na', num: 11, name: 'Sodium',    group: 'alkali',     mass: '22.99', color: '#f97316', fact: 'Reacts violently with water' },
  { id: 'K',  sym: 'K',  num: 19, name: 'Potassium', group: 'alkali',     mass: '39.10', color: '#f97316', fact: 'Essential for nerve impulses' },
  { id: 'F',  sym: 'F',  num: 9,  name: 'Fluorine',  group: 'halogen',    mass: '19.00', color: '#ef4444', fact: 'Most electronegative element' },
  { id: 'Cl', sym: 'Cl', num: 17, name: 'Chlorine',  group: 'halogen',    mass: '35.45', color: '#ef4444', fact: 'Used in water purification' },
  { id: 'Br', sym: 'Br', num: 35, name: 'Bromine',   group: 'halogen',    mass: '79.90', color: '#ef4444', fact: 'Only liquid non-metal at RT' },
  { id: 'He', sym: 'He', num: 2,  name: 'Helium',    group: 'noble',      mass: '4.00',  color: '#a855f7', fact: 'Second most abundant in universe' },
  { id: 'Ne', sym: 'Ne', num: 10, name: 'Neon',      group: 'noble',      mass: '20.18', color: '#a855f7', fact: 'Glows reddish-orange in high voltage' },
  { id: 'Ar', sym: 'Ar', num: 18, name: 'Argon',     group: 'noble',      mass: '39.95', color: '#a855f7', fact: 'Makes up 0.93% of Earth\'s atmosphere' },
  { id: 'Fe', sym: 'Fe', num: 26, name: 'Iron',      group: 'transition', mass: '55.85', color: '#22d3ee', fact: 'Most common element on Earth by mass' },
  { id: 'Cu', sym: 'Cu', num: 29, name: 'Copper',    group: 'transition', mass: '63.55', color: '#22d3ee', fact: 'First metal used by humans' },
  { id: 'Au', sym: 'Au', num: 79, name: 'Gold',      group: 'transition', mass: '196.97',color: '#22d3ee', fact: 'Unreactive noble transition metal' },
];

const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// ═══════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

// Single Element Card (Draggable)
function ElementCard({ element, isPlaced, isShaking, isHinted, onDragStart, onDragEnd }) {
  return (
    <motion.div
      draggable={!isPlaced}
      onDragStart={() => onDragStart(element.id)}
      onDragEnd={onDragEnd}
      style={{
        width: 80, height: 96,
        background: isPlaced ? 'rgba(255,255,255,0.03)' : `linear-gradient(135deg, ${element.color}18 0%, rgba(10,5,24,0.8) 100%)`,
        border: `1px solid ${isHinted ? '#fbbf24' : isPlaced ? 'rgba(255,255,255,0.06)' : element.color + '45'}`,
        borderRadius: 12,
        padding: '6px 7px',
        display: 'flex', flexDirection: 'column', justifyBetween: 'space-between',
        cursor: isPlaced ? 'default' : 'grab',
        opacity: isPlaced ? 0.35 : 1,
        boxShadow: isHinted ? '0 0 20px #fbbf24' : isPlaced ? 'none' : `0 0 12px ${element.color}25`,
        pointerEvents: isPlaced ? 'none' : 'auto',
      }}
      animate={isShaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.5 }}
      whileHover={!isPlaced ? { scale: 1.06, y: -4 } : {}}
      whileTap={!isPlaced ? { scale: 0.95 } : {}}
    >
      <div className="flex justify-between items-center text-[9px] font-space text-white/40">
        <span>{element.num}</span>
        <span className="text-[8px]">{element.mass}</span>
      </div>
      <div className="text-center my-auto">
        <span className="font-orbitron font-black text-2xl tracking-tight block" style={{ color: isPlaced ? 'rgba(255,255,255,0.3)' : element.color }}>
          {element.sym}
        </span>
        <span className="text-[9px] font-space text-white/60 truncate block mt-0.5">{element.name}</span>
      </div>
    </motion.div>
  );
}

// Drop Zone for a Group
function DropZone({ group, placedElements, isHovered, onDragOver, onDragLeave, onDrop }) {
  return (
    <div
      onDragOver={(e) => onDragOver(e, group.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, group.id)}
      style={{
        background: isHovered ? group.bg.replace('0.06', '0.18') : group.bg,
        border: `1.5px dashed ${isHovered ? group.color : group.border}`,
        borderRadius: 16,
        padding: 12,
        minHeight: 140,
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.2s ease',
        boxShadow: isHovered ? `0 0 25px ${group.color}35` : 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2 pb-2" style={{ borderBottom: `1px solid ${group.border}` }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 16 }}>{group.icon}</span>
          <div>
            <h4 style={{ fontFamily: 'Orbitron,monospace', fontSize: 11, color: group.color, fontWeight: 800 }}>{group.label}</h4>
            <p style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter,sans-serif' }}>{group.desc}</p>
          </div>
        </div>
        <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 10, color: group.color, fontWeight: 700 }}>
          {placedElements.length}/3
        </span>
      </div>

      {/* Placed Cards Grid */}
      <div className="flex-1 grid grid-cols-3 gap-2 items-center">
        {placedElements.map(el => (
          <motion.div
            key={el.id}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              background: `linear-gradient(135deg, ${group.color}25 0%, rgba(10,5,24,0.9) 100%)`,
              border: `1px solid ${group.color}60`,
              borderRadius: 10,
              padding: '4px 6px',
              textAlign: 'center',
              boxShadow: `0 0 10px ${group.color}30`,
            }}
          >
            <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 13, fontWeight: 800, color: '#fff', display: 'block' }}>{el.sym}</span>
            <span style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.5)', display: 'block' }}>{el.name}</span>
          </motion.div>
        ))}

        {/* Empty slots placeholders */}
        {Array.from({ length: 3 - placedElements.length }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 48,
              border: `1px stroke ${group.color}20`,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.01)',
              display: 'flex', alignItems: 'center', justifyCenter: 'center',
            }}
          >
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.1)' }}>+</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Chemical Cabinet (3D 2-Door Lock Graphic)
function ChemCabinet({ open, totalPlaced, total }) {
  return (
    <div className="relative w-36 h-48 rounded-2xl p-2 flex flex-col justify-between overflow-hidden"
      style={{
        background: 'linear-gradient(180deg,#1a0e36 0%,#0c061d 100%)',
        border: `2px solid ${open ? '#34d399' : 'rgba(168,85,247,0.3)'}`,
        boxShadow: open ? '0 0 35px rgba(52,211,153,0.3)' : '0 0 20px rgba(168,85,247,0.15)',
      }}>
      {/* Cabinet doors animation */}
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 z-10"
        style={{
          background: 'linear-gradient(90deg,#24134b,#150a2e)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          transformOrigin: 'left center',
        }}
        animate={open ? { rotateY: -110, opacity: 0.3 } : { rotateY: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 z-10"
        style={{
          background: 'linear-gradient(-90deg,#24134b,#150a2e)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          transformOrigin: 'right center',
        }}
        animate={open ? { rotateY: 110, opacity: 0.3 } : { rotateY: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Inside Content */}
      <div className="relative z-0 h-full flex flex-col items-center justify-center text-center p-2">
        {open ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="flex flex-col items-center"
          >
            <span style={{ fontSize: 32 }}>🔑</span>
            <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#34d399', fontWeight: 800, marginTop: 4 }}>
              KEY UNLOCKED
            </span>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center">
            <span style={{ fontSize: 24, opacity: 0.6 }}>🔒</span>
            <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
              {totalPlaced}/{total} SET
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Win Overlay Screen
function WinScreen({ onExit }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-w-md w-full p-8 rounded-3xl text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,rgba(24,12,50,0.95),rgba(8,4,20,0.98))',
          border: '2px solid rgba(52,211,153,0.5)',
          boxShadow: '0 0 60px rgba(52,211,153,0.25)',
        }}
        initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 20 }}
      >
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
          style={{ background: 'rgba(52,211,153,0.15)', border: '2px solid rgba(52,211,153,0.4)' }}>
          🔑
        </div>

        <h3 className="font-orbitron font-black text-2xl text-white mb-1">ROOM 2 ESCAPED!</h3>
        <p className="font-space text-xs text-emerald-400 tracking-widest uppercase mb-6">Periodic Wall Restored · Key Obtained</p>

        <p className="text-white/60 text-xs font-inter leading-relaxed mb-6">
          You successfully sorted all elements into their respective groups and unlocked the chemical cabinet key. Proceed to Room 3.
        </p>

        <button
          onClick={onExit}
          className="w-full py-3.5 rounded-xl font-orbitron font-bold text-xs uppercase tracking-widest text-white shadow-xl cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 0 25px rgba(16,185,129,0.4)' }}
        >
          Proceed to Room 3 →
        </button>
      </motion.div>
    </motion.div>
  );
}

// GameOver Overlay Screen
function GameOverScreen({ onRetry }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="max-w-sm w-full p-6 rounded-2xl text-center bg-slate-900 border border-red-500/40">
        <span className="text-4xl block mb-2">💥</span>
        <h3 className="font-orbitron font-bold text-xl text-white mb-1">REACTION FAILED</h3>
        <p className="text-xs text-red-400 font-space mb-6">Incorrect element sorting overwhelmed the wall stability.</p>
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-orbitron font-bold text-xs uppercase tracking-widest cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN ROOM 2 PAGE
// ═══════════════════════════════════════════════════════
export default function Room2Page() {
  const { navigateTo, lives, deductLife } = useNavigation();

  // ── State ──
  const [placed, setPlaced]         = useState({});   // { elementId: groupId }
  const [shakingCard, setShakingCard] = useState(null);
  const [hoveredZone, setHoveredZone] = useState(null);
  const [timer, setTimer]           = useState(600);
  const [hints, setHints]           = useState(3);
  const [hintInfo, setHintInfo]     = useState(null); // { elementId, groupId }
  const [wrongFlash, setWrongFlash] = useState(false);
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [won, setWon]               = useState(false);
  const [gameOver, setGameOver]     = useState(false);

  const draggedCard = useRef(null);

  // ── Timer ──
  useEffect(() => {
    if (won || gameOver) return;
    const t = setInterval(() => setTimer(s => {
      if (s <= 1) { setGameOver(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [won, gameOver]);

  // ── Win check ──
  const totalPlaced = Object.keys(placed).length;
  useEffect(() => {
    if (totalPlaced === ELEMENTS.length && !won) {
      setTimeout(() => setCabinetOpen(true), 400);
      setTimeout(() => setWon(true), 2200);
    }
  }, [totalPlaced, won]);

  // ── Hint ──
  const handleHint = useCallback(() => {
    if (hints <= 0) return;
    const unplacedEls = ELEMENTS.filter(el => !placed[el.id]);
    if (unplacedEls.length === 0) return;
    const target = unplacedEls[Math.floor(Math.random() * unplacedEls.length)];
    setHintInfo({ elementId: target.id, groupId: target.group });
    setHints(h => h - 1);
    setTimeout(() => setHintInfo(null), 3500);
  }, [hints, placed]);

  // ── Reset ──
  const resetGame = useCallback(() => {
    setPlaced({});
    setShakingCard(null);
    setHoveredZone(null);
    setLives(3);
    setTimer(600);
    setHints(3);
    setHintInfo(null);
    setWrongFlash(false);
    setCabinetOpen(false);
    setWon(false);
    setGameOver(false);
  }, []);

  // ── Drag handlers ──
  const handleDragStart = useCallback((elementId) => {
    draggedCard.current = elementId;
  }, []);

  const handleDragEnd = useCallback(() => {
    draggedCard.current = null;
  }, []);

  const handleDragOver = useCallback((e, groupId) => {
    e.preventDefault();
    setHoveredZone(groupId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setHoveredZone(null);
  }, []);

  const handleDrop = useCallback((e, groupId) => {
    e.preventDefault();
    setHoveredZone(null);
    const cardId = draggedCard.current;
    if (!cardId) return;
    const el = ELEMENTS.find(x => x.id === cardId);
    if (!el || placed[cardId]) return;

    if (el.group === groupId) {
      setPlaced(prev => ({ ...prev, [cardId]: groupId }));
    } else {
      setShakingCard(cardId);
      setWrongFlash(true);
      deductLife(1);
      setTimeout(() => setShakingCard(null), 600);
      setTimeout(() => setWrongFlash(false), 600);
    }
    draggedCard.current = null;
  }, [placed]);

  const timerRed = timer < 120;

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col select-none"
      style={{ background: 'linear-gradient(180deg,#110824 0%,#0a0416 50%,#07031a 100%)' }}>

      {/* Wrong flash */}
      <AnimatePresence>
        {wrongFlash && (
          <motion.div className="fixed inset-0 z-40 pointer-events-none"
            style={{ background: 'rgba(239,68,68,0.08)', backdropFilter: 'blur(1px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }} />
        )}
      </AnimatePresence>

      {/* ── TOP HUD ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 h-14 z-30"
        style={{ background: 'rgba(4,2,16,0.97)', borderBottom: '1px solid rgba(168,85,247,0.12)', backdropFilter: 'blur(12px)' }}>
        <button
          onClick={() => navigateTo('lab')}
          id="r2-back"
          className="flex items-center gap-1.5 text-white/25 hover:text-white/55 text-xs font-space transition-colors bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={13} /> Lab
        </button>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.07)' }} />

        {/* Room tag */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.2)' }}>
          <span style={{ fontSize: 8 }}>🧩</span>
          <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#a855f7', letterSpacing: '0.15em' }}>ROOM 2 · RESTORE THE PERIODIC WALL</span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Clock size={11} className={timerRed ? 'text-red-400' : 'text-white/30'} />
          <motion.span className="font-orbitron font-bold text-sm" style={{ color: timerRed ? '#f87171' : 'white' }}
            animate={timerRed ? { opacity: [1, 0.4, 1] } : {}} transition={{ duration: 0.6, repeat: Infinity }}>
            {fmtTime(timer)}
          </motion.span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span className="font-orbitron font-bold text-xs text-purple-300">{totalPlaced}/{ELEMENTS.length}</span>
          <span className="text-[10px] text-white/30 font-space">Sorted</span>
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
              hints > 0 ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20' : 'bg-white/5 text-white/20 border border-white/5'
            }`}
          >
            <Lightbulb size={13} className="text-amber-400" />
            <span>Hint ({hints})</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Left: Elements Tray */}
        <div className="w-72 flex flex-col p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h4 className="font-orbitron font-bold text-xs text-white/70 tracking-widest uppercase mb-3">UNSORTED ELEMENTS</h4>
          <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2 pr-1 no-scrollbar">
            {ELEMENTS.map(el => (
              <ElementCard
                key={el.id}
                element={el}
                isPlaced={!!placed[el.id]}
                isShaking={shakingCard === el.id}
                isHinted={hintInfo?.elementId === el.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ))}
          </div>
        </div>

        {/* Center: Drop Zones (2x2 Grid) */}
        <div className="flex-1 grid grid-cols-2 gap-3 overflow-y-auto pr-1">
          {GROUPS.map(group => (
            <DropZone
              key={group.id}
              group={group}
              placedElements={ELEMENTS.filter(el => placed[el.id] === group.id)}
              isHovered={hoveredZone === group.id}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          ))}
        </div>

        {/* Right: Cabinet Visual */}
        <div className="w-44 flex flex-col items-center justify-between p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-center mb-2">
            <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>CHEMICAL</span>
            <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', display: 'block' }}>CABINET</span>
          </div>

          <ChemCabinet open={cabinetOpen} totalPlaced={totalPlaced} total={ELEMENTS.length} />

          <div className="mt-2 text-center">
            {!cabinetOpen && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <ShieldAlert size={14} className="text-amber-400 mx-auto mb-1.5" />
                <p style={{ fontSize: 8.5, fontFamily: 'Inter,sans-serif', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
                  Sort all 12 elements into their correct groups to unlock the cabinet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* OVERLAYS */}
      <AnimatePresence>{won && <WinScreen onExit={() => navigateTo('room3')} />}</AnimatePresence>
      <AnimatePresence>{gameOver && !won && <GameOverScreen onRetry={resetGame} />}</AnimatePresence>
    </div>
  );
}
