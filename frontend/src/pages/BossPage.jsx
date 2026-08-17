import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import {
  Heart, Clock, Zap, Lightbulb, ArrowLeft,
  Shield, Key, ChevronRight, AlertTriangle,
  Cpu, RotateCcw, CheckCircle, X,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
// QUESTION BANK  (20 mixed chemistry questions)
// ═══════════════════════════════════════════════════════
const RAW_QUESTIONS = [
  { q: 'Which element has Atomic Number 8?',                  choices: ['Nitrogen (N)',   'Oxygen (O)',        'Fluorine (F)',       'Carbon (C)'],       ans: 1, cat: 'PERIODIC TABLE',  catColor: '#22d3ee', icon: '⚛️' },
  { q: 'What chemical symbol does Iron use?',                 choices: ['Ir',             'In',                'Fe',                 'Fr'],                ans: 2, cat: 'PERIODIC TABLE',  catColor: '#22d3ee', icon: '⚛️' },
  { q: 'How many periods exist in the modern Periodic Table?',choices: ['5',              '6',                 '7',                  '8'],                 ans: 2, cat: 'PERIODIC TABLE',  catColor: '#22d3ee', icon: '⚛️' },
  { q: 'Which element is found in Period 3, Group 1?',        choices: ['Potassium',      'Lithium',           'Sodium',             'Rubidium'],          ans: 2, cat: 'PERIODIC TABLE',  catColor: '#22d3ee', icon: '⚛️' },
  { q: 'Atomic number equals the number of…',                choices: ['Neutrons',       'Protons',           'Electrons',          'Nucleons'],           ans: 1, cat: 'PERIODIC TABLE',  catColor: '#22d3ee', icon: '⚛️' },
  { q: 'Which element has the chemical symbol "Cu"?',         choices: ['Calcium',        'Chromium',          'Cobalt',             'Copper'],            ans: 3, cat: 'PERIODIC TABLE',  catColor: '#22d3ee', icon: '⚛️' },
  { q: 'Li, Na, and K belong to which element group?',        choices: ['Halogens',       'Noble Gases',       'Alkali Metals',      'Transition Metals'], ans: 2, cat: 'ELEMENT GROUPS', catColor: '#f97316', icon: '🧪' },
  { q: 'Group 18 elements are famously known as…',            choices: ['Alkali Earth',   'Halogens',          'Noble Gases',        'Metalloids'],        ans: 2, cat: 'ELEMENT GROUPS', catColor: '#f97316', icon: '🧪' },
  { q: 'Which group contains Fluorine, Chlorine & Bromine?',  choices: ['Group 1',        'Group 16',          'Group 17 (Halogens)','Group 18'],          ans: 2, cat: 'ELEMENT GROUPS', catColor: '#f97316', icon: '🧪' },
  { q: 'd-block elements are commonly classified as…',         choices: ['Representative', 'Transition Metals', 'Lanthanides',        'Actinides'],         ans: 1, cat: 'ELEMENT GROUPS', catColor: '#f97316', icon: '🧪' },
  { q: 'What is the full valence electron count for Neon?',   choices: ['2',              '6',                 '8',                  '10'],                ans: 2, cat: 'CONFIGURATIONS', catColor: '#a855f7', icon: '⚡' },
  { q: 'Which orbital fills immediately after 3p?',           choices: ['3d',             '4s',                '4p',                 '4d'],                ans: 1, cat: 'CONFIGURATIONS', catColor: '#a855f7', icon: '⚡' },
  { q: 'Maximum electron capacity of a p-subshell is…',       choices: ['2',              '6',                 '10',                 '14'],                ans: 1, cat: 'CONFIGURATIONS', catColor: '#a855f7', icon: '⚡' },
  { q: 'Chromium (Z=24) configuration exception ends in…',    choices: ['4s² 3d⁴',        '4s¹ 3d⁵',           '4s⁰ 3d⁶',            '4s² 3d⁵'],           ans: 1, cat: 'CONFIGURATIONS', catColor: '#a855f7', icon: '⚡' },
  { q: 'Electronegativity increases across a period because…',choices: ['Radius grows',   'Nuclear charge increases', 'Shells increase', 'Shielding grows'],ans: 1, cat: 'PERIODIC TRENDS',catColor: '#ec4899', icon: '🔥' },
  { q: 'Which has the smallest atomic radius?',               choices: ['Francium (Fr)',  'Fluorine (F)',      'Cesium (Cs)',        'Iodine (I)'],        ans: 1, cat: 'PERIODIC TRENDS',catColor: '#ec4899', icon: '🔥' },
  { q: 'Ionization energy is the energy required to…',       choices: ['Gain an e⁻',     'Remove an e⁻',      'Split nucleus',      'Form covalent bond'],ans: 1, cat: 'PERIODIC TRENDS',catColor: '#ec4899', icon: '🔥' },
  { q: 'pH of pure water at 25°C is…',                        choices: ['0',              '1',                 '7 (Neutral)',        '14'],                ans: 2, cat: 'REACTION KINETICS',catColor: '#34d399', icon: '💥' },
  { q: 'In an exothermic reaction, heat is…',                 choices: ['Absorbed',       'Released',          'Unchanged',          'Created from mass'], ans: 1, cat: 'REACTION KINETICS',catColor: '#34d399', icon: '💥' },
  { q: 'Oxidation is defined as the…',                       choices: ['Gain of e⁻',     'Loss of e⁻',        'Gain of protons',    'Loss of neutrons'],   ans: 1, cat: 'REACTION KINETICS',catColor: '#34d399', icon: '💥' },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const BOSS_MAX_HP   = 6;
const PLAYER_MAX_HP = 3;
const Q_TIME        = 18;

const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

// ═══════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

function BossAvatar({ hp, maxHp, flash, phase, beam }) {
  const hpPct = (hp / maxHp) * 100;
  const isDanger = hp <= 2;

  return (
    <div className="flex flex-col items-center relative">
      {/* Laser beam effect */}
      <AnimatePresence>
        {beam === 'up' && (
          <motion.div
            className="absolute -top-32 w-2 rounded-full pointer-events-none z-20"
            style={{ background: 'linear-gradient(0deg, #34d399, #00d4ff)', height: 160, filter: 'blur(2px)' }}
            initial={{ scaleY: 0, opacity: 1 }} animate={{ scaleY: 1, opacity: 0.8 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
        {beam === 'down' && (
          <motion.div
            className="absolute -bottom-32 w-3 rounded-full pointer-events-none z-20"
            style={{ background: 'linear-gradient(180deg, #ef4444, #f97316)', height: 160, filter: 'blur(2px)' }}
            initial={{ scaleY: 0, opacity: 1 }} animate={{ scaleY: 1, opacity: 0.9 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Main Boss Graphic */}
      <motion.div
        className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl relative flex flex-col items-center justify-center p-3 shadow-2xl"
        style={{
          background: flash
            ? 'rgba(239,68,68,0.4)'
            : phase === 2
            ? 'linear-gradient(135deg,rgba(239,68,68,0.2) 0%,rgba(168,85,247,0.3) 100%)'
            : 'linear-gradient(135deg,rgba(168,85,247,0.2) 0%,rgba(4,8,20,0.8) 100%)',
          border: `2px solid ${flash ? '#ef4444' : phase === 2 ? '#f43f5e' : '#a855f7'}`,
          boxShadow: flash
            ? '0 0 60px rgba(239,68,68,0.6)'
            : phase === 2
            ? '0 0 50px rgba(244,63,94,0.4)'
            : '0 0 35px rgba(168,85,247,0.25)',
        }}
        animate={
          flash
            ? { x: [-12, 12, -8, 8, 0], scale: [1, 0.95, 1.02, 1] }
            : { y: [0, -8, 0] }
        }
        transition={flash ? { duration: 0.4 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-5xl sm:text-6xl block">{phase === 2 ? '🔥' : '🤖'}</span>
        <span className="font-orbitron text-[10px] font-black text-white tracking-widest uppercase mt-1">
          AEGIS-9000
        </span>
        <span className="text-[9px] font-space text-purple-300/70">
          {phase === 2 ? 'PHASE 2 · ENRAGED' : 'SECURITY AI'}
        </span>
      </motion.div>

      {/* HP Bar */}
      <div className="w-48 sm:w-64 mt-3">
        <div className="flex justify-between text-[10px] font-orbitron font-bold mb-1">
          <span className="text-purple-300">AEGIS-9000 HEALTH</span>
          <span style={{ color: isDanger ? '#ef4444' : '#a855f7' }}>{hp}/{maxHp} HP</span>
        </div>
        <div className="h-3 rounded-full bg-slate-900 border border-white/10 p-0.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: isDanger
                ? 'linear-gradient(90deg,#ef4444,#f97316)'
                : 'linear-gradient(90deg,#a855f7,#00d4ff)',
            }}
            animate={{ width: `${hpPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}

function PlayerAvatar({ hp, maxHp, flash, xp, combo }) {
  return (
    <div className="flex flex-col items-center">
      {/* Player Card */}
      <motion.div
        className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl relative flex flex-col items-center justify-center p-3 shadow-2xl"
        style={{
          background: flash
            ? 'rgba(239,68,68,0.3)'
            : 'linear-gradient(135deg,rgba(0,212,255,0.15) 0%,rgba(4,8,20,0.8) 100%)',
          border: `2px solid ${flash ? '#ef4444' : '#00d4ff'}`,
          boxShadow: flash ? '0 0 50px rgba(239,68,68,0.5)' : '0 0 30px rgba(0,212,255,0.25)',
        }}
        animate={flash ? { x: [-10, 10, -5, 5, 0] } : { y: [0, -6, 0] }}
        transition={flash ? { duration: 0.4 } : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-4xl sm:text-5xl block">🧑‍🔬</span>
        <span className="font-orbitron text-[10px] font-black text-cyan-300 tracking-widest uppercase mt-1">
          STUDENT
        </span>

        {combo >= 2 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-3 -right-2 px-2 py-0.5 rounded-full text-[9px] font-orbitron font-extrabold bg-amber-400 text-slate-950 shadow-lg"
          >
            ×{combo} COMBO
          </motion.span>
        )}
      </motion.div>

      {/* HP & Hearts */}
      <div className="w-40 sm:w-48 mt-3 text-center">
        <div className="flex justify-between text-[10px] font-orbitron font-bold mb-1">
          <span className="text-cyan-300">STUDENT HEALTH</span>
          <span className="text-rose-400">{hp}/{maxHp} LIVES</span>
        </div>
        <div className="flex justify-center gap-2">
          {Array.from({ length: maxHp }).map((_, i) => (
            <Heart key={i} size={16} className={i < hp ? 'text-rose-500 fill-rose-500' : 'text-white/10'} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Victory Screen Overlay
function WinScreen({ xp, onExit }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-w-md w-full p-8 rounded-3xl text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,rgba(20,10,40,0.95),rgba(4,2,12,0.98))',
          border: '2px solid rgba(251,191,36,0.5)',
          boxShadow: '0 0 80px rgba(251,191,36,0.3)',
        }}
        initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', damping: 20 }}
      >
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
          style={{ background: 'rgba(251,191,36,0.15)', border: '2px solid rgba(251,191,36,0.4)', boxShadow: '0 0 30px rgba(251,191,36,0.3)' }}>
          🏆
        </div>

        <h3 className="font-orbitron font-black text-3xl text-amber-400 mb-1">BOSS DEFEATED!</h3>
        <p className="font-space text-xs text-white/60 tracking-widest uppercase mb-6">AEGIS-9000 Security AI Neutralized · Main Lab Door Unlocked</p>

        <div className="flex justify-center items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10 mb-6">
          <div>
            <p className="text-[10px] text-white/40 font-space uppercase">XP Earned</p>
            <p className="font-orbitron font-extrabold text-xl text-cyan-400">+{xp + 500} XP</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-[10px] text-white/40 font-space uppercase">Reward Title</p>
            <p className="font-orbitron font-extrabold text-sm text-amber-300">Master Chemist</p>
          </div>
        </div>

        <button
          onClick={onExit}
          className="w-full py-4 rounded-xl font-orbitron font-black text-xs uppercase tracking-widest text-white shadow-xl cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: '#040810', boxShadow: '0 0 30px rgba(251,191,36,0.4)' }}
        >
          Claim Rewards & View Certificate →
        </button>
      </motion.div>
    </motion.div>
  );
}

// GameOver Screen Overlay
function GameOverScreen({ onRetry }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="max-w-sm w-full p-6 rounded-2xl text-center bg-slate-900 border border-red-500/40">
        <span className="text-4xl block mb-2">💀</span>
        <h3 className="font-orbitron font-bold text-xl text-white mb-1">SYSTEM OVERRIDE</h3>
        <p className="text-xs text-red-400 font-space mb-6">AEGIS-9000 depleted your health points with counter-measure questions.</p>
        <button
          onClick={onRetry}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white font-orbitron font-bold text-xs uppercase tracking-widest cursor-pointer"
        >
          Re-engage Boss
        </button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN BOSS BATTLE PAGE
// ═══════════════════════════════════════════════════════
export default function BossPage() {
  const { navigateTo } = useNavigation();

  const [questions,  setQuestions]   = useState(() => shuffleArray(RAW_QUESTIONS));
  const [qIdx,       setQIdx]        = useState(0);
  const [bossHp,     setBossHp]      = useState(BOSS_MAX_HP);
  const [playerHp,   setPlayerHp]    = useState(PLAYER_MAX_HP);
  const [qTimer,     setQTimer]      = useState(Q_TIME);
  const [battleTime, setBattleTime]  = useState(300);
  const [xp,         setXp]          = useState(0);
  const [combo,      setCombo]       = useState(0);
  const [phase,      setPhase]       = useState(1);
  const [beam,       setBeam]        = useState(null);   // 'up' | 'down'
  const [feedback,   setFeedback]    = useState(null);   // { type, combo }
  const [bossFlash,  setBossFlash]   = useState(false);
  const [playerFlash,setPlayerFlash] = useState(false);
  const [combatMsg,  setCombatMsg]   = useState('');
  const [hints,      setHints]       = useState(3);
  const [showHint,   setShowHint]    = useState(false);
  const [won,        setWon]         = useState(false);
  const [gameOver,   setGameOver]    = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);

  const timerRef   = useRef(null);
  const qTimerRef  = useRef(null);

  const currentQ   = questions[qIdx % questions.length];
  const timerRed   = battleTime < 60;

  // ── Battle timer ──
  useEffect(() => {
    if (won || gameOver) return;
    timerRef.current = setInterval(() => setBattleTime(t => {
      if (t <= 1) { setGameOver(true); return 0; }
      return t - 1;
    }), 1000);
    return () => clearInterval(timerRef.current);
  }, [won, gameOver]);

  // ── Per-question timer ──
  const resetQTimer = useCallback(() => setQTimer(Q_TIME), []);

  useEffect(() => {
    if (won || gameOver || answerLocked) return;
    clearInterval(qTimerRef.current);
    qTimerRef.current = setInterval(() => {
      setQTimer(t => {
        if (t <= 1) {
          clearInterval(qTimerRef.current);
          handleAnswer(-1); // timeout = boss attack
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(qTimerRef.current);
  }, [qIdx, won, gameOver, answerLocked]); // eslint-disable-line

  // ── Phase 2 trigger ──
  useEffect(() => {
    if (bossHp <= Math.floor(BOSS_MAX_HP / 2) && phase === 1) setPhase(2);
  }, [bossHp, phase]);

  // ── Handle answer ──
  const handleAnswer = useCallback((choiceIdx) => {
    if (answerLocked || won || gameOver) return;
    clearInterval(qTimerRef.current);
    setAnswerLocked(true);

    const correct = choiceIdx === currentQ.ans;

    if (correct) {
      const newCombo = combo + 1;
      const earned   = 50 * (newCombo >= 3 ? 2 : 1);
      setCombo(newCombo);
      setXp(x => x + earned);
      setFeedback({ type: 'correct', combo: newCombo, earned });
      setBeam('up');
      setCombatMsg(newCombo >= 3 ? `🔥 COMBO ×${newCombo}! +${earned} XP` : `⚡ DIRECT HIT! +${earned} XP`);

      setTimeout(() => {
        setBossFlash(true);
        setBossHp(h => {
          const next = Math.max(0, h - 1);
          if (next <= 0) setTimeout(() => setWon(true), 600);
          return next;
        });
        setTimeout(() => setBossFlash(false), 450);
      }, 300);
    } else {
      setCombo(0);
      setFeedback({ type: 'wrong' });
      setBeam('down');
      setCombatMsg('💀 AEGIS COUNTERATTACKS!');

      setTimeout(() => {
        setPlayerFlash(true);
        setPlayerHp(h => {
          const next = Math.max(0, h - 1);
          if (next <= 0) setTimeout(() => setGameOver(true), 600);
          return next;
        });
        setTimeout(() => setPlayerFlash(false), 450);
      }, 300);
    }

    setTimeout(() => {
      setBeam(null);
      setFeedback(null);
      setCombatMsg('');
      setQIdx(i => i + 1);
      resetQTimer();
      setAnswerLocked(false);
      setShowHint(false);
    }, 1400);
  }, [answerLocked, won, gameOver, currentQ, combo, resetQTimer]);

  const handleHint = () => {
    if (hints <= 0 || answerLocked) return;
    setHints(h => h - 1);
    setShowHint(true);
  };

  const reset = () => {
    setQuestions(shuffleArray(RAW_QUESTIONS));
    setQIdx(0); setBossHp(BOSS_MAX_HP); setPlayerHp(PLAYER_MAX_HP);
    setQTimer(Q_TIME); setBattleTime(300); setXp(0); setCombo(0);
    setPhase(1); setBeam(null); setFeedback(null); setBossFlash(false);
    setPlayerFlash(false); setCombatMsg(''); setHints(3); setShowHint(false);
    setWon(false); setGameOver(false); setAnswerLocked(false);
  };

  const hintText = (() => {
    if (!currentQ) return '';
    const correct = currentQ.choices[currentQ.ans];
    return `💡 The correct answer starts with "${correct.slice(0,1)}" — ${currentQ.cat} hint: ${currentQ.icon}`;
  })();

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col select-none"
      style={{ background:'radial-gradient(ellipse at 50% 20%, #1a003a 0%, #0a0020 45%, #020010 100%)' }}>

      {/* Background grid */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:'linear-gradient(rgba(168,85,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.04) 1px,transparent 1px)',
        backgroundSize:'60px 60px' }} />

      {/* Player flash */}
      <AnimatePresence>
        {playerFlash && (
          <motion.div className="fixed inset-0 z-40 pointer-events-none"
            style={{ background:'rgba(239,68,68,0.15)' }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.2 }} />
        )}
      </AnimatePresence>

      {/* ── TOP HUD ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 h-14 z-30"
        style={{ background:'rgba(4,0,12,0.97)', borderBottom:'1px solid rgba(168,85,247,0.15)', backdropFilter:'blur(12px)' }}>
        <button
          onClick={() => navigateTo('lab')}
          className="flex items-center gap-1.5 text-white/25 hover:text-white/55 text-xs transition-colors bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={13} /> Lab
        </button>
        <div style={{ width:1, height:20, background:'rgba(255,255,255,0.07)' }} />
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
          <AlertTriangle size={11} className="text-red-400" />
          <span style={{ fontFamily:'Orbitron,monospace', fontSize:9, color:'#ef4444', letterSpacing:'0.15em' }}>
            BOSS BATTLE — AEGIS-9000 SECURITY AI
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <Clock size={11} className={timerRed ? 'text-red-400' : 'text-white/30'} />
          <span className="font-orbitron font-bold text-sm" style={{ color: timerRed ? '#f87171' : 'white' }}>
            {fmtTime(battleTime)}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleHint}
            disabled={hints <= 0 || answerLocked}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-space text-xs transition-colors cursor-pointer ${
              hints > 0 ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20' : 'bg-white/5 text-white/20 border border-white/5'
            }`}
          >
            <Lightbulb size={13} className="text-amber-400" />
            <span>Hint ({hints})</span>
          </button>
        </div>
      </div>

      {/* Main Battle Arena */}
      <div className="flex-1 flex flex-col justify-between p-4 max-w-6xl mx-auto w-full overflow-hidden">
        {/* Upper Battle Arena */}
        <div className="flex justify-between items-center px-8 pt-2 relative">
          <PlayerAvatar hp={playerHp} maxHp={PLAYER_MAX_HP} flash={playerFlash} xp={xp} combo={combo} />
          
          <div className="text-center z-10">
            <AnimatePresence mode="wait">
              {combatMsg && (
                <motion.div
                  key={combatMsg}
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="px-4 py-1.5 rounded-full font-orbitron font-black text-xs uppercase"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  {combatMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <BossAvatar hp={bossHp} maxHp={BOSS_MAX_HP} flash={bossFlash} phase={phase} beam={beam} />
        </div>

        {/* Question & Answer Card */}
        <div className="mb-2">
          {/* Hint Overlay */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                className="mb-3 p-3 rounded-xl flex items-center gap-2 text-xs font-space max-w-2xl mx-auto"
                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              >
                <span>{hintText}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-6 rounded-3xl backdrop-blur-xl border border-purple-500/20 max-w-3xl mx-auto shadow-2xl relative"
            style={{ background: 'linear-gradient(135deg,rgba(20,10,40,0.8) 0%,rgba(6,2,16,0.9) 100%)' }}>

            {/* Category Pill & Per-Question Timer */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-orbitron font-bold px-3 py-1 rounded-full uppercase"
                style={{ background: `${currentQ.catColor}15`, color: currentQ.catColor, border: `1px solid ${currentQ.catColor}30` }}>
                {currentQ.icon} {currentQ.cat}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40 font-space">Time left:</span>
                <span className="font-orbitron font-bold text-sm text-cyan-400">{qTimer}s</span>
              </div>
            </div>

            {/* Question Text */}
            <h3 className="font-space font-bold text-white text-base md:text-lg mb-6 leading-relaxed">
              {currentQ.q}
            </h3>

            {/* Answer Choices Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.choices.map((choice, i) => {
                const isSelected = answerLocked && i === currentQ.ans;
                return (
                  <motion.button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={answerLocked}
                    className="p-4 rounded-xl text-left font-space text-sm flex items-center justify-between transition-all cursor-pointer"
                    style={{
                      background: isSelected ? 'rgba(52,211,153,0.18)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? '#34d399' : 'rgba(255,255,255,0.08)'}`,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-orbitron font-bold text-xs text-white/40 mr-2">
                      [{String.fromCharCode(65 + i)}]
                    </span>
                    <span className="text-white flex-1">{choice}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAYS */}
      <AnimatePresence>{won && <WinScreen xp={xp} onExit={() => navigateTo('mission-complete')} />}</AnimatePresence>
      <AnimatePresence>{gameOver && !won && <GameOverScreen onRetry={reset} />}</AnimatePresence>
    </div>
  );
}
