import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import {
  Heart, Lightbulb, Clock, X, CheckCircle, ArrowLeft,
  Key, Sparkles, RotateCcw, ChevronRight, Zap,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════
// PUZZLE DATA
// ═══════════════════════════════════════════════════════
const PUZZLES = [
  {
    id: 'pt_board',
    objectLabel: 'Periodic Table Board',
    type: 'grid_select',
    color: '#00d4ff',
    question: 'One element is missing from the board. Atomic Number 8 belongs in Period 2, Group 16. Which element fills the gap?',
    hint: 'Period 2 means 2 electron shells. Group 16 means 6 valence electrons. This element is essential for breathing!',
    clue: { label: 'Atomic Number', value: '8', sub: 'Period 2 · Group 16' },
    wrongFeedback: 'That\'s not right. Study the periodic trends — period tells you the electron shell count.',
    // Puzzle-specific data
    period2: [
      { sym: 'Li', num: 3, color: '#f97316' },
      { sym: 'Be', num: 4, color: '#fbbf24' },
      { sym: 'B',  num: 5, color: '#a78bfa' },
      { sym: 'C',  num: 6, color: '#22d3ee' },
      { sym: 'N',  num: 7, color: '#00d4ff' },
      { sym: '?',  num: 8, color: '#ef4444', missing: true },
      { sym: 'F',  num: 9, color: '#f97316' },
      { sym: 'Ne', num: 10, color: '#a855f7' },
    ],
    choices: [
      { sym: 'O', name: 'Oxygen',  correct: true,  color: '#00d4ff' },
      { sym: 'S', name: 'Sulfur',  correct: false, color: '#fbbf24' },
      { sym: 'Na',name: 'Sodium',  correct: false, color: '#f97316' },
      { sym: 'Ar',name: 'Argon',   correct: false, color: '#a855f7' },
    ],
  },
  {
    id: 'computer',
    objectLabel: 'Lab Terminal',
    type: 'terminal_fill',
    color: '#22d3ee',
    question: 'The terminal shows a chemical element file with the symbol field corrupted. Identify the correct symbol.',
    hint: 'The element is in Period 2 with atomic mass ≈ 16 amu, and it\'s a non-metal in Group 16.',
    clue: { label: 'Element Symbol', value: 'O', sub: 'Atomic Mass 15.99 amu' },
    wrongFeedback: 'Incorrect symbol. Check the atomic mass and group — it\'s a Period 2 non-metal.',
    terminalLines: [
      { text: '> LOADING ELEMENT DATABASE...', delay: 0 },
      { text: '> FILE: ELEMENT_PROFILE_08.dat', delay: 0.2 },
      { text: '> PERIOD: 2', delay: 0.4 },
      { text: '> GROUP: 16', delay: 0.6 },
      { text: '> ATOMIC MASS: 15.999 amu', delay: 0.8 },
      { text: '> CATEGORY: Non-metal', delay: 1.0 },
      { text: '> SYMBOL: [CORRUPTED]', delay: 1.2, highlight: true },
    ],
    choices: [
      { sym: 'N',  name: 'Nitrogen', correct: false, color: '#a855f7' },
      { sym: 'O',  name: 'Oxygen',   correct: true,  color: '#22d3ee' },
      { sym: 'F',  name: 'Fluorine', correct: false, color: '#f97316' },
      { sym: 'S',  name: 'Sulfur',   correct: false, color: '#fbbf24' },
    ],
  },
  {
    id: 'cabinet',
    objectLabel: 'Chemical Cabinet',
    type: 'anagram',
    color: '#f97316',
    question: 'The reagent label has its letters scrambled by the security lock! Rearrange the letters to reveal the element name.',
    hint: 'The element name starts with O and has 6 letters. It\'s the gas you breathe in every moment.',
    clue: { label: 'Element Name', value: 'OXYGEN', sub: '6-letter non-metal gas' },
    wrongFeedback: 'Not in the right order. Try again — the element starts with O!',
    letters: ['X', 'G', 'O', 'E', 'Y', 'N'],
    answer: ['O', 'X', 'Y', 'G', 'E', 'N'],
  },
  {
    id: 'microscope',
    objectLabel: 'Microscope Slide',
    type: 'slide_select',
    color: '#34d399',
    question: 'Four sample slides are ready for analysis. Load the slide whose atomic mass matches the mystery element (≈ 16 amu).',
    hint: 'The atomic mass of the element is approximately 16 amu. Look for the slide closest to that value.',
    clue: { label: 'Atomic Mass', value: '15.99 amu', sub: 'Lightest Group-16 element' },
    wrongFeedback: 'That slide doesn\'t match. The atomic mass should be very close to 16 amu.',
    slides: [
      { label: '12.01', element: 'Carbon (C)',  correct: false, color: '#22d3ee' },
      { label: '14.01', element: 'Nitrogen (N)',correct: false, color: '#a855f7' },
      { label: '15.99', element: 'Oxygen (O)',  correct: true,  color: '#34d399' },
      { label: '19.00', element: 'Fluorine (F)',correct: false, color: '#f97316' },
    ],
  },
  {
    id: 'beaker',
    objectLabel: 'Mystery Beaker',
    type: 'property_bubble',
    color: '#a855f7',
    question: 'The glowing substance has 3 property tags attached. Read the clues and identify the mystery element.',
    hint: 'This element: supports combustion (needed for fire), is diatomic (O₂), and makes up 21% of Earth\'s atmosphere.',
    clue: { label: 'Key Property', value: '21% of atmosphere', sub: 'Supports combustion · O₂' },
    wrongFeedback: 'That element doesn\'t match. Think about what makes fire burn and what we breathe!',
    propertyCards: [
      { icon: '🔥', text: 'Required for combustion' },
      { icon: '🌍', text: '21% of Earth\'s atmosphere' },
      { icon: '💧', text: 'H₂___ forms water (H₂O)' },
    ],
    choices: [
      { name: 'Nitrogen',  sym: 'N',  correct: false, color: '#a78bfa' },
      { name: 'Oxygen',    sym: 'O',  correct: true,  color: '#a855f7' },
      { name: 'Fluorine',  sym: 'F',  correct: false, color: '#f97316' },
      { name: 'Carbon',    sym: 'C',  correct: false, color: '#22d3ee' },
    ],
  },
];

// ═══════════════════════════════════════════════════════
// ROOM OBJECTS (positions as % of container)
// ═══════════════════════════════════════════════════════
const ROOM_OBJS = [
  { id: 'pt_board',   label: 'Periodic Table Board', emoji: '⚛️', x: 50, y: 14,  w: 300, h: 110, color: '#00d4ff', wallMounted: true },
  { id: 'computer',  label: 'Lab Terminal',          emoji: '💻', x: 83, y: 34,  w: 150, h: 130, color: '#22d3ee' },
  { id: 'cabinet',   label: 'Chemical Cabinet',      emoji: '🧪', x: 10, y: 46,  w: 100, h: 180, color: '#f97316' },
  { id: 'microscope',label: 'Microscope',            emoji: '🔬', x: 18, y: 73,  w: 90,  h: 110, color: '#34d399' },
  { id: 'beaker',    label: 'Mystery Beaker',        emoji: '⚗️', x: 78, y: 67,  w: 100, h: 100, color: '#a855f7' },
  { id: 'door',      label: 'Exit Door',             emoji: '🚪', x: 50, y: 90,  w: 170, h: 44,  color: '#f59e0b', isDoor: true },
];

// ═══════════════════════════════════════════════════════
// PUZZLE COMPONENTS
// ═══════════════════════════════════════════════════════

function GridSelectPuzzle({ puzzle, onCorrect, onWrong, disabled }) {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const pick = (c) => {
    if (disabled || feedback) return;
    setSelected(c.sym);
    if (c.correct) {
      setFeedback('correct');
      setTimeout(onCorrect, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => { setFeedback(null); setSelected(null); onWrong(); }, 1000);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Period 2 mini table */}
      <div className="p-3 rounded-2xl" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,212,255,0.15)' }}>
        <p className="font-orbitron text-[9px] text-cyan-400 tracking-widest mb-3 opacity-80">PERIOD 2 — MISSING ELEMENT HIGHLIGHTED</p>
        <div className="grid grid-cols-8 gap-1.5">
          {puzzle.period2.map(el => (
            <motion.div key={el.sym}
              className="flex flex-col items-center justify-center rounded-lg py-1.5"
              style={{ background: el.missing ? 'rgba(239,68,68,0.12)' : `${el.color}12`, border: `1px solid ${el.missing ? '#ef4444' : el.color}35` }}
              animate={el.missing ? { boxShadow: ['0 0 6px rgba(239,68,68,0.3)', '0 0 18px rgba(239,68,68,0.7)', '0 0 6px rgba(239,68,68,0.3)'] } : {}}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              {el.missing ? (
                <motion.span style={{ fontSize: 16, color: '#ef4444', fontFamily: 'Orbitron,monospace', fontWeight: 900 }}
                  animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.4, repeat: Infinity }}>?</motion.span>
              ) : (
                <>
                  <span style={{ fontSize: 6, color: el.color, opacity: 0.5, fontFamily: 'Orbitron,monospace' }}>{el.num}</span>
                  <span style={{ fontSize: 12, color: el.color, fontWeight: 900, fontFamily: 'Orbitron,monospace' }}>{el.sym}</span>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Choices */}
      <div>
        <p className="text-center text-xs text-white/40 font-space mb-3">Select the element that belongs in the highlighted position:</p>
        <div className="grid grid-cols-4 gap-3">
          {puzzle.choices.map(c => (
            <motion.button key={c.sym} onClick={() => pick(c)}
              className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl relative overflow-hidden"
              style={{
                background: selected === c.sym ? (feedback === 'correct' ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.18)') : `${c.color}0d`,
                border: `2px solid ${selected === c.sym ? (feedback === 'correct' ? '#34d399' : '#ef4444') : c.color + '35'}`,
                cursor: feedback ? 'default' : 'pointer',
              }}
              whileHover={!feedback ? { scale: 1.06, boxShadow: `0 0 25px ${c.color}35` } : {}}
              whileTap={!feedback ? { scale: 0.95 } : {}}
              animate={selected === c.sym && feedback === 'wrong' ? { x: [-6, 6, -6, 6, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              <span style={{ fontSize: 28, fontFamily: 'Orbitron,monospace', fontWeight: 900, color: c.color }}>{c.sym}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'Space Grotesk,sans-serif' }}>{c.name}</span>
              {selected === c.sym && feedback === 'correct' && (
                <motion.div className="absolute inset-0 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(52,211,153,0.3)' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <CheckCircle size={28} className="text-emerald-400" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TerminalFillPuzzle({ puzzle, onCorrect, onWrong, disabled }) {
  const [filledSym, setFilledSym] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const pick = (c) => {
    if (disabled || feedback) return;
    setFilledSym(c.sym);
    if (c.correct) {
      setFeedback('correct');
      setTimeout(onCorrect, 1200);
    } else {
      setFeedback('wrong');
      setTimeout(() => { setFeedback(null); setFilledSym(null); onWrong(); }, 1100);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Terminal screen */}
      <div className="rounded-2xl p-4 font-mono" style={{ background: '#020a0e', border: '1px solid #22d3ee25' }}>
        <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(34,211,238,0.12)' }}>
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-60" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 opacity-60" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 opacity-60" />
          <span className="text-[10px] ml-2 text-white/20 font-space tracking-widest">CHEMLAB TERMINAL — ELEMENT DATABASE</span>
        </div>
        {puzzle.terminalLines.map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: line.delay + 0.2 }}
            className="flex items-center gap-2 mb-1.5">
            {line.highlight ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontSize: 11, color: 'rgba(34,211,238,0.6)' }}>{line.text.replace('[CORRUPTED]', '')}</span>
                <motion.div className="inline-flex items-center justify-center px-3 py-1 rounded-lg"
                  style={{ background: filledSym ? (feedback === 'correct' ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.15)') : 'rgba(239,68,68,0.1)', border: `1px solid ${filledSym ? (feedback === 'correct' ? '#34d399' : '#ef4444') : '#ef4444'}` }}
                  animate={{ boxShadow: !filledSym ? ['0 0 6px rgba(239,68,68,0.3)', '0 0 14px rgba(239,68,68,0.6)', '0 0 6px rgba(239,68,68,0.3)'] : [] }}
                  transition={{ duration: 1.3, repeat: Infinity }}>
                  <span style={{ fontSize: 13, fontFamily: 'Orbitron,monospace', fontWeight: 900, color: filledSym ? (feedback === 'correct' ? '#34d399' : '#ef4444') : '#ef4444' }}>
                    {filledSym || '████'}
                  </span>
                </motion.div>
              </div>
            ) : (
              <span style={{ fontSize: 11, color: i > 1 ? '#22d3ee' : 'rgba(34,211,238,0.45)' }}>{line.text}</span>
            )}
          </motion.div>
        ))}
        {!filledSym && (
          <motion.span style={{ fontSize: 11, color: '#22d3ee' }}
            animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>█</motion.span>
        )}
      </div>

      {/* Symbol choices */}
      <div>
        <p className="text-center text-xs text-white/40 font-space mb-3">Click the correct element symbol to repair the file:</p>
        <div className="grid grid-cols-4 gap-3">
          {puzzle.choices.map(c => (
            <motion.button key={c.sym} onClick={() => pick(c)}
              className="flex flex-col items-center gap-1 py-3.5 rounded-xl"
              style={{
                background: filledSym === c.sym ? (feedback === 'correct' ? 'rgba(52,211,153,0.18)' : 'rgba(239,68,68,0.15)') : `${c.color}0a`,
                border: `2px solid ${filledSym === c.sym ? (feedback === 'correct' ? '#34d399' : '#ef4444') : c.color + '30'}`,
                fontFamily: 'Orbitron,monospace',
                cursor: feedback ? 'default' : 'pointer',
              }}
              whileHover={!feedback ? { scale: 1.05 } : {}}
              animate={filledSym === c.sym && feedback === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : {}}
            >
              <span style={{ fontSize: 22, fontWeight: 900, color: c.color }}>{c.sym}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Grotesk,sans-serif' }}>{c.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnagramPuzzle({ puzzle, onCorrect, onWrong, disabled }) {
  const [remaining, setRemaining] = useState([...puzzle.letters].map((l, i) => ({ letter: l, id: i, used: false })));
  const [word, setWord] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const addLetter = (tile) => {
    if (disabled || feedback || tile.used) return;
    const newWord = [...word, tile.letter];
    const newRemaining = remaining.map(r => r.id === tile.id ? { ...r, used: true } : r);
    setWord(newWord);
    setRemaining(newRemaining);

    if (newWord.length === puzzle.answer.length) {
      const isCorrect = newWord.join('') === puzzle.answer.join('');
      setFeedback(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) {
        setTimeout(onCorrect, 1000);
      } else {
        setTimeout(() => {
          setFeedback(null);
          setWord([]);
          setRemaining([...puzzle.letters].map((l, i) => ({ letter: l, id: i, used: false })));
          onWrong();
        }, 1100);
      }
    }
  };

  const removeLast = () => {
    if (feedback || word.length === 0) return;
    const newWord = word.slice(0, -1);
    setWord(newWord);
    // re-enable last used tile
    const usedTile = remaining.filter(r => r.used)[remaining.filter(r => r.used).length - 1];
    if (usedTile) {
      setRemaining(prev => prev.map(r => r.id === usedTile.id ? { ...r, used: false } : r));
    }
  };

  const tileColors = ['#f97316', '#fbbf24', '#f97316', '#fb923c', '#fbbf24', '#f97316'];

  return (
    <div className="flex flex-col gap-5">
      {/* Word slots */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs text-white/40 font-space">Spell the element name by clicking the letter tiles:</p>
        <div className="flex gap-2.5 justify-center">
          {puzzle.answer.map((_, i) => {
            const letter = word[i];
            const isCorrect = feedback === 'correct';
            const isWrong = feedback === 'wrong';
            return (
              <motion.div key={i}
                className="w-11 h-14 rounded-xl flex flex-col items-center justify-center"
                style={{
                  background: letter ? (isCorrect ? 'rgba(52,211,153,0.2)' : isWrong ? 'rgba(239,68,68,0.2)' : 'rgba(249,115,22,0.12)') : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${letter ? (isCorrect ? '#34d399' : isWrong ? '#ef4444' : '#f97316') : 'rgba(255,255,255,0.1)'}`,
                }}
                animate={isWrong && letter ? { x: [-4, 4, -4, 4, 0] } : isCorrect && letter ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.35 }}
              >
                {letter && (
                  <motion.span style={{ fontSize: 20, fontFamily: 'Orbitron,monospace', fontWeight: 900, color: isCorrect ? '#34d399' : isWrong ? '#ef4444' : '#f97316' }}
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                    {letter}
                  </motion.span>
                )}
                {!letter && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.1)' }}>{i + 1}</span>}
              </motion.div>
            );
          })}
        </div>
        {word.length > 0 && !feedback && (
          <button onClick={removeLast} className="text-[10px] text-white/25 hover:text-white/50 font-space flex items-center gap-1 transition-colors">
            <RotateCcw size={10} /> undo last letter
          </button>
        )}
      </div>

      {/* Letter tiles */}
      <div className="p-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(249,115,22,0.12)' }}>
        <p className="text-[9px] text-amber-500 font-orbitron tracking-widest mb-3 opacity-70">SCRAMBLED REAGENT LABEL</p>
        <div className="flex gap-3 flex-wrap justify-center">
          {remaining.map((tile, i) => (
            <motion.button key={tile.id} onClick={() => addLetter(tile)}
              disabled={tile.used || !!feedback}
              className="w-14 h-16 rounded-xl flex flex-col items-center justify-center gap-0.5 relative"
              style={{
                background: tile.used ? 'rgba(255,255,255,0.03)' : `${tileColors[i]}15`,
                border: `2px solid ${tile.used ? 'rgba(255,255,255,0.06)' : tileColors[i] + '50'}`,
                opacity: tile.used ? 0.25 : 1,
                cursor: tile.used ? 'default' : 'pointer',
              }}
              whileHover={!tile.used && !feedback ? { scale: 1.1, boxShadow: `0 0 18px ${tileColors[i]}40` } : {}}
              whileTap={!tile.used && !feedback ? { scale: 0.92 } : {}}
            >
              <span style={{ fontSize: 22, fontFamily: 'Orbitron,monospace', fontWeight: 900, color: tileColors[i] }}>
                {tile.letter}
              </span>
              <span style={{ fontSize: 7, color: `${tileColors[i]}60`, fontFamily: 'monospace' }}>TAP</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideSelectPuzzle({ puzzle, onCorrect, onWrong, disabled }) {
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loadedIdx, setLoadedIdx] = useState(null);

  const pick = (slide, idx) => {
    if (disabled || feedback) return;
    setLoadedIdx(idx);
    setTimeout(() => {
      setSelectedSlide(slide.label);
      if (slide.correct) {
        setFeedback('correct');
        setTimeout(onCorrect, 1300);
      } else {
        setFeedback('wrong');
        setTimeout(() => { setFeedback(null); setSelectedSlide(null); setLoadedIdx(null); onWrong(); }, 1200);
      }
    }, 500);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Microscope viewer */}
      <div className="flex gap-6 items-start">
        {/* Microscope lens view */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="relative" style={{ width: 110, height: 110 }}>
            <div style={{ width: 110, height: 110, borderRadius: '50%', border: `3px solid ${feedback === 'correct' ? '#34d399' : feedback === 'wrong' ? '#ef4444' : '#34d39960'}`,
              background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              boxShadow: feedback === 'correct' ? '0 0 30px rgba(52,211,153,0.5)' : feedback === 'wrong' ? '0 0 20px rgba(239,68,68,0.4)' : '0 0 10px rgba(52,211,153,0.2)',
              transition: 'box-shadow 0.5s, border-color 0.5s' }}>
              {loadedIdx !== null ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
                  className="flex flex-col items-center gap-1">
                  <span style={{ fontSize: 11, color: feedback === 'correct' ? '#34d399' : feedback === 'wrong' ? '#ef4444' : '#34d399', fontFamily: 'Orbitron,monospace', fontWeight: 700 }}>
                    {puzzle.slides[loadedIdx].label}
                  </span>
                  <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Grotesk,sans-serif', textAlign: 'center', padding: '0 8px' }}>
                    {puzzle.slides[loadedIdx].element}
                  </span>
                  {feedback === 'correct' && <CheckCircle size={20} className="text-emerald-400" />}
                  {feedback === 'wrong' && <span style={{ fontSize: 16 }}>✗</span>}
                </motion.div>
              ) : (
                <span style={{ fontSize: 10, color: 'rgba(52,211,153,0.3)', fontFamily: 'Orbitron,monospace', textAlign: 'center', padding: 10 }}>LOAD SLIDE</span>
              )}
              {/* Crosshair */}
              <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', border: '1px solid rgba(52,211,153,0.1)' }} />
              <div style={{ position: 'absolute', top: '50%', left: 10, right: 10, height: 1, background: 'rgba(52,211,153,0.08)' }} />
              <div style={{ position: 'absolute', left: '50%', top: 10, bottom: 10, width: 1, background: 'rgba(52,211,153,0.08)' }} />
            </div>
            <p className="text-center text-[9px] font-orbitron mt-1.5" style={{ color: 'rgba(52,211,153,0.5)' }}>LENS VIEW</p>
          </div>
        </div>

        {/* Slide tray */}
        <div className="flex-1">
          <p className="text-xs text-white/40 font-space mb-3">Click a slide to load it into the microscope:</p>
          <div className="grid grid-cols-2 gap-2.5">
            {puzzle.slides.map((slide, idx) => (
              <motion.button key={slide.label} onClick={() => pick(slide, idx)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl relative overflow-hidden"
                style={{
                  background: loadedIdx === idx ? (feedback === 'correct' ? 'rgba(52,211,153,0.15)' : feedback === 'wrong' ? 'rgba(239,68,68,0.12)' : `${slide.color}12`) : `${slide.color}08`,
                  border: `2px solid ${loadedIdx === idx ? (feedback === 'correct' ? '#34d399' : feedback === 'wrong' ? '#ef4444' : slide.color) : slide.color + '25'}`,
                  cursor: feedback ? 'default' : 'pointer',
                }}
                whileHover={!feedback ? { scale: 1.04, boxShadow: `0 0 16px ${slide.color}30` } : {}}
              >
                {/* Slide visual */}
                <div style={{ width: '100%', height: 24, background: `${slide.color}20`, border: `1px solid ${slide.color}40`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 13, fontFamily: 'Orbitron,monospace', fontWeight: 900, color: slide.color }}>{slide.label}</span>
                </div>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Grotesk,sans-serif' }}>{slide.element}</span>
                <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>amu</span>
                {loadedIdx === idx && (
                  <motion.div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(90deg,transparent,${slide.color}15,transparent)` }}
                    animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity }} />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyBubblePuzzle({ puzzle, onCorrect, onWrong, disabled }) {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [revealedCards, setRevealedCards] = useState(0);

  useEffect(() => {
    const intervals = puzzle.propertyCards.map((_, i) =>
      setTimeout(() => setRevealedCards(r => Math.max(r, i + 1)), i * 800 + 300)
    );
    return () => intervals.forEach(clearTimeout);
  }, [puzzle.propertyCards]);

  const pick = (c) => {
    if (disabled || feedback) return;
    setSelected(c.sym);
    if (c.correct) {
      setFeedback('correct');
      setTimeout(onCorrect, 1100);
    } else {
      setFeedback('wrong');
      setTimeout(() => { setFeedback(null); setSelected(null); onWrong(); }, 1100);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Vial + property cards */}
      <div className="flex gap-5 items-start">
        {/* Vial */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className="relative" style={{ width: 56, height: 120 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '6px 6px 24px 24px', background: 'rgba(168,85,247,0.1)', border: '1.5px solid rgba(168,85,247,0.5)', overflow: 'hidden' }}>
              <motion.div style={{ position: 'absolute', bottom: 0, left: 3, right: 3, height: '65%', background: 'linear-gradient(180deg,rgba(168,85,247,0.4),rgba(168,85,247,0.7))', borderRadius: '0 0 22px 22px' }}
                animate={{ height: ['62%', '68%', '62%'] }} transition={{ duration: 2.5, repeat: Infinity }} />
              {[0, 1, 2].map(i => (
                <motion.div key={i} style={{ position: 'absolute', bottom: `${40 + i * 18}%`, left: '50%', width: 5, height: 5, borderRadius: '50%', background: '#a855f7', marginLeft: -2.5 }}
                  animate={{ y: [0, -20], opacity: [0.7, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.5 }} />
              ))}
            </div>
            <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', width: 20, height: 10, background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.4)', borderRadius: '3px 3px 0 0' }} />
          </div>
          <div style={{ fontSize: 20 }}>❓</div>
          <p style={{ fontSize: 8, fontFamily: 'Orbitron,monospace', color: '#a855f7', opacity: 0.7, textAlign: 'center' }}>MYSTERY<br />ELEMENT</p>
        </div>

        {/* Property cards */}
        <div className="flex-1 flex flex-col gap-2.5">
          {puzzle.propertyCards.map((card, i) => (
            <AnimatePresence key={i}>
              {i < revealedCards && (
                <motion.div className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}
                  initial={{ opacity: 0, x: 20, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 250 }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{card.icon}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter,sans-serif' }}>{card.text}</span>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>

      {/* Element choices */}
      <div>
        <p className="text-center text-xs text-white/40 font-space mb-3">Based on the property clues, identify the mystery element:</p>
        <div className="grid grid-cols-4 gap-3">
          {puzzle.choices.map(c => (
            <motion.button key={c.sym} onClick={() => pick(c)}
              className="flex flex-col items-center gap-1.5 py-4 rounded-2xl relative overflow-hidden"
              style={{
                background: selected === c.sym ? (feedback === 'correct' ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.18)') : `${c.color}0a`,
                border: `2px solid ${selected === c.sym ? (feedback === 'correct' ? '#34d399' : '#ef4444') : c.color + '30'}`,
                cursor: feedback ? 'default' : 'pointer',
              }}
              whileHover={!feedback ? { scale: 1.06, boxShadow: `0 0 22px ${c.color}35` } : {}}
              animate={selected === c.sym && feedback === 'wrong' ? { x: [-5, 5, -5, 5, 0] } : selected === c.sym && feedback === 'correct' ? { scale: [1, 1.1, 1] } : {}}
            >
              <span style={{ fontSize: 22, fontFamily: 'Orbitron,monospace', fontWeight: 900, color: c.color }}>{c.sym}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontFamily: 'Space Grotesk,sans-serif' }}>{c.name}</span>
              {selected === c.sym && feedback === 'correct' && (
                <motion.div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.25)' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <CheckCircle size={24} className="text-emerald-400" />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ROOM OBJECT VISUAL
// ═══════════════════════════════════════════════════════
function RoomObjectCard({ obj, solved, near, onClick, disabled }) {
  const isSolved = solved.includes(obj.id);
  return (
    <motion.div
      onClick={!isSolved && !disabled ? onClick : undefined}
      style={{
        position: 'absolute',
        left: `${obj.x}%`,
        top: `${obj.y}%`,
        width: obj.w,
        height: obj.h,
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
        cursor: isSolved || disabled ? 'default' : 'pointer',
      }}
      animate={{
        boxShadow: isSolved
          ? `0 0 16px rgba(52,211,153,0.4), 0 0 30px rgba(52,211,153,0.15)`
          : near
            ? [`0 0 15px ${obj.color}50`, `0 0 35px ${obj.color}70`, `0 0 15px ${obj.color}50`]
            : `0 0 8px ${obj.color}18`,
        borderColor: isSolved ? 'rgba(52,211,153,0.5)' : near ? obj.color + '60' : obj.color + '20',
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
      whileHover={!isSolved && !disabled ? { scale: 1.04 } : {}}
      whileTap={!isSolved && !disabled ? { scale: 0.96 } : {}}
      className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-1.5 select-none"
      style={{ border: `1px solid ${isSolved ? 'rgba(52,211,153,0.4)' : obj.color + '20'}`, background: isSolved ? 'rgba(52,211,153,0.06)' : `${obj.color}08` }}
    >
      {/* Solved overlay */}
      {isSolved && (
        <motion.div className="absolute inset-0 flex items-center justify-center flex-col gap-1"
          style={{ background: 'rgba(52,211,153,0.08)', zIndex: 5 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <CheckCircle size={22} className="text-emerald-400" />
          <span style={{ fontSize: 8, color: '#34d399', fontFamily: 'Orbitron,monospace' }}>SOLVED</span>
        </motion.div>
      )}
      {/* Pulse ring (unsolved) */}
      {!isSolved && !disabled && (
        <motion.div style={{ position: 'absolute', inset: -4, borderRadius: 20, border: `1px solid ${obj.color}` }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }} />
      )}
      {/* Content */}
      <span style={{ fontSize: obj.isDoor ? 24 : 22 }}>{obj.emoji}</span>
      <span style={{ fontSize: obj.isDoor ? 9 : 8, color: isSolved ? '#34d399' : obj.color, fontFamily: 'Orbitron,monospace', textAlign: 'center', opacity: 0.8, padding: '0 4px' }}>
        {isSolved ? '✓ DONE' : obj.label}
      </span>
      {!isSolved && !disabled && !obj.isDoor && (
        <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Grotesk,sans-serif' }}>click to interact</span>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// CLUE FRAGMENT
// ═══════════════════════════════════════════════════════
function ClueFragment({ clue, collected }) {
  return (
    <motion.div className="flex flex-col items-center gap-0.5 p-1.5 rounded-xl"
      style={{ background: collected ? `${clue.color}12` : 'rgba(255,255,255,0.03)', border: `1px solid ${collected ? clue.color + '35' : 'rgba(255,255,255,0.06)'}`, minWidth: 64 }}
      animate={collected ? { scale: [1, 1.15, 1] } : {}}
      transition={{ duration: 0.4 }}>
      {collected ? (
        <>
          <span style={{ fontSize: 9, color: clue.color, fontFamily: 'Orbitron,monospace', fontWeight: 700 }}>{clue.value}</span>
          <span style={{ fontSize: 6.5, color: 'rgba(255,255,255,0.3)', fontFamily: 'Space Grotesk,sans-serif' }}>{clue.label}</span>
        </>
      ) : (
        <span style={{ fontSize: 16, opacity: 0.2 }}>🔒</span>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// ELEMENT REVEAL WIN SCREEN
// ═══════════════════════════════════════════════════════
function ElementReveal({ onContinue }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(2,6,14,0.95)', backdropFilter: 'blur(20px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col items-center gap-8 text-center px-6">

        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p style={{ fontFamily: 'Orbitron,monospace', fontSize: 10, color: 'rgba(0,212,255,0.6)', letterSpacing: '0.4em', marginBottom: 6 }}>ALL CLUES ASSEMBLED</p>
          <h2 style={{ fontFamily: 'Orbitron,monospace', fontSize: 28, fontWeight: 900, color: 'white' }}>MISSING ELEMENT FOUND!</h2>
        </motion.div>

        {/* Oxygen element card (big reveal) */}
        {phase >= 1 && (
          <motion.div
            className="relative flex flex-col items-center justify-center rounded-3xl"
            style={{ width: 220, height: 260, background: 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(0,212,255,0.05))', border: '2px solid rgba(0,212,255,0.5)', boxShadow: '0 0 60px rgba(0,212,255,0.3), 0 0 120px rgba(0,212,255,0.1)' }}
            initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}>

            {/* Particle ring */}
            <motion.div style={{ position: 'absolute', inset: -20, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.2)' }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }} />
            <motion.div style={{ position: 'absolute', inset: -40, borderRadius: '50%', border: '1px solid rgba(0,212,255,0.1)' }}
              animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.05, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />

            <span style={{ fontSize: 11, fontFamily: 'Orbitron,monospace', color: 'rgba(0,212,255,0.6)', letterSpacing: 3, marginBottom: 8 }}>ELEMENT</span>
            <span style={{ fontSize: 90, fontFamily: 'Orbitron,monospace', fontWeight: 900, color: '#00d4ff', lineHeight: 1, textShadow: '0 0 40px rgba(0,212,255,0.8)' }}>O</span>
            <span style={{ fontSize: 22, fontFamily: 'Orbitron,monospace', fontWeight: 900, color: 'white', letterSpacing: 4, marginTop: 4 }}>OXYGEN</span>
            <div className="flex gap-4 mt-4">
              <div className="text-center">
                <p style={{ fontSize: 18, fontFamily: 'Orbitron,monospace', fontWeight: 700, color: '#00d4ff' }}>8</p>
                <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Grotesk,sans-serif' }}>Atomic No.</p>
              </div>
              <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
              <div className="text-center">
                <p style={{ fontSize: 18, fontFamily: 'Orbitron,monospace', fontWeight: 700, color: '#00d4ff' }}>15.99</p>
                <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontFamily: 'Space Grotesk,sans-serif' }}>Atomic Mass</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Reward */}
        {phase >= 2 && (
          <motion.div className="flex gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {[{ icon: '⚡', val: '+350 XP', col: '#00d4ff' }, { icon: '🔑', val: 'Key Collected', col: '#f59e0b' }, { icon: '⭐', val: 'Room Clear!', col: '#fbbf24' }].map(r => (
              <div key={r.val} className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-xl">{r.icon}</span>
                <span style={{ fontFamily: 'Orbitron,monospace', fontWeight: 700, fontSize: 12, color: r.col }}>{r.val}</span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Continue button */}
        {phase >= 3 && (
          <motion.button onClick={onContinue} id="room-win-continue"
            className="px-10 py-4 rounded-2xl font-orbitron font-black text-sm tracking-widest uppercase text-black flex items-center gap-3 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#00d4ff,#22d3ee)', boxShadow: '0 0 35px rgba(0,212,255,0.5)' }}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <motion.div className="absolute inset-0" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)' }}
              animate={{ x: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity }} />
            <Key size={16} className="relative z-10" />
            <span className="relative z-10">Enter Room 2 →</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// GAME OVER
// ═══════════════════════════════════════════════════════
function GameOverScreen({ onRetry }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(2,6,14,0.96)', backdropFilter: 'blur(16px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div className="flex flex-col items-center gap-6 text-center"
        initial={{ scale: 0.8, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
        <span style={{ fontSize: 60 }}>💀</span>
        <div>
          <p style={{ fontFamily: 'Orbitron,monospace', fontSize: 11, color: 'rgba(239,68,68,0.7)', letterSpacing: '0.3em', marginBottom: 6 }}>NO LIVES REMAINING</p>
          <h2 style={{ fontFamily: 'Orbitron,monospace', fontSize: 36, fontWeight: 900, color: '#ef4444' }}>MISSION FAILED</h2>
        </div>
        <motion.button onClick={onRetry} id="retry-btn"
          className="px-8 py-4 rounded-xl font-orbitron font-bold text-sm tracking-widest uppercase flex items-center gap-2"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }}
          whileHover={{ scale: 1.04 }}>
          <RotateCcw size={15} /> Try Again
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN ROOM 1 PAGE
// ═══════════════════════════════════════════════════════
const fmtTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function Room1Page() {
  const { navigateTo, lives, deductLife } = useNavigation();

  const [activePuzzle, setActivePuzzle] = useState(null); // puzzle id
  const [solved, setSolved]             = useState([]);   // array of solved obj ids
  const [clues, setClues]               = useState([]);   // collected clue ids (numbers 0-4)
  const [timer, setTimer]               = useState(600);  // 10 min
  const [hints, setHints]               = useState(3);
  const [showHint, setShowHint]         = useState(false);
  const [hintText, setHintText]         = useState('');
  const [feedback, setFeedback]         = useState(null); // 'correct' | 'wrong' | null
  const [gameOver, setGameOver]         = useState(false);
  const [won, setWon]                   = useState(false);
  const [doorUnlock, setDoorUnlock]     = useState(false);

  // Timer
  useEffect(() => {
    if (gameOver || won) return;
    const t = setInterval(() => setTimer(s => {
      if (s <= 1) { clearInterval(t); setGameOver(true); return 0; }
      return s - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [gameOver, won]);

  // Win condition
  useEffect(() => {
    if (solved.length === PUZZLES.length && !won) {
      setActivePuzzle(null);
      setTimeout(() => setDoorUnlock(true), 400);
      setTimeout(() => setWon(true), 2000);
    }
  }, [solved, won]);

  const handleObjectClick = (objId) => {
    if (gameOver || won || solved.includes(objId) || objId === 'door') return;
    setFeedback(null);
    setShowHint(false);
    setActivePuzzle(objId);
  };

  const handleCorrect = (puzzleIdx) => {
    setFeedback('correct');
    const puzzle = PUZZLES[puzzleIdx];
    setSolved(prev => [...prev, puzzle.id]);
    setClues(prev => [...prev, puzzleIdx]);
    setTimeout(() => {
      setFeedback(null);
      setActivePuzzle(null);
    }, 600);
  };

  const handleWrong = () => {
    setFeedback('wrong');
    deductLife(1);
    setTimeout(() => setFeedback(null), 600);
  };

  const handleHint = () => {
    if (hints <= 0 || !activePuzzle) return;
    const puzzleIdx = PUZZLES.findIndex(p => p.id === activePuzzle);
    if (puzzleIdx < 0) return;
    setHints(h => h - 1);
    setHintText(PUZZLES[puzzleIdx].hint);
    setShowHint(true);
  };

  const activePuzzleIdx = PUZZLES.findIndex(p => p.id === activePuzzle);
  const activePuzzleData = activePuzzleIdx >= 0 ? PUZZLES[activePuzzleIdx] : null;
  const clueData = PUZZLES.map((p, i) => ({ ...p.clue, collected: clues.includes(i) }));
  const timerRed = timer < 120;

  const renderPuzzle = () => {
    if (!activePuzzleData) return null;
    const props = { puzzle: activePuzzleData, onCorrect: () => handleCorrect(activePuzzleIdx), onWrong: handleWrong, disabled: !!feedback };
    switch (activePuzzleData.type) {
      case 'grid_select':     return <GridSelectPuzzle {...props} />;
      case 'terminal_fill':  return <TerminalFillPuzzle {...props} />;
      case 'anagram':        return <AnagramPuzzle {...props} />;
      case 'slide_select':   return <SlideSelectPuzzle {...props} />;
      case 'property_bubble':return <PropertyBubblePuzzle {...props} />;
      default: return null;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col" style={{ background: '#020608', userSelect: 'none' }}>

      {/* ── TOP HUD ── */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 h-14 z-30"
        style={{ background: 'rgba(2,6,14,0.97)', borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
        {/* Back */}
        <button
          onClick={() => navigateTo('lab')}
          id="room-back-btn"
          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 font-space text-xs transition-colors bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={13} /> Lab
        </button>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
        {/* Room tag */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.18)' }}>
          <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 9, color: '#00d4ff', letterSpacing: '0.2em' }}>ROOM 1 · PERIODIC CHAMBER</span>
        </div>
        {/* Timer */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Clock size={11} className={timerRed ? 'text-red-400' : 'text-white/30'} />
          <motion.span className="font-orbitron font-bold text-sm" style={{ color: timerRed ? '#f87171' : 'white' }}
            animate={timerRed ? { opacity: [1, 0.4, 1] } : {}} transition={{ duration: 0.6, repeat: Infinity }}>
            {fmtTime(timer)}
          </motion.span>
        </div>
        {/* Clues bar */}
        <div className="hidden md:flex items-center gap-2 flex-1">
          <span style={{ fontSize: 8, fontFamily: 'Orbitron,monospace', color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>CLUES</span>
          {clueData.map((clue, i) => <ClueFragment key={i} clue={clue} collected={clue.collected} />)}
        </div>
        <div className="flex-1 md:hidden" />
        {/* Lives */}
        <div className="flex items-center gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div key={i} animate={{ scale: i < lives ? 1 : 0.6, opacity: i < lives ? 1 : 0.18 }}>
              <Heart size={15} fill={i < lives ? '#ef4444' : 'none'} className={i < lives ? 'text-red-500' : 'text-white/20'} />
            </motion.div>
          ))}
        </div>
        {/* Hints */}
        <button id="room-hint-btn" onClick={handleHint} disabled={hints <= 0 || !activePuzzle}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg relative transition-all"
          style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.18)', opacity: (hints > 0 && activePuzzle) ? 1 : 0.4, cursor: (hints > 0 && activePuzzle) ? 'pointer' : 'default' }}>
          <Lightbulb size={13} className="text-amber-400" />
          <span style={{ fontSize: 9, fontFamily: 'Orbitron,monospace', color: '#fbbf24' }}>{hints}</span>
        </button>
        {/* Solved progress */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)' }}>
          <Key size={12} className="text-emerald-400" />
          <span style={{ fontFamily: 'Orbitron,monospace', fontSize: 11, fontWeight: 700, color: '#34d399' }}>{solved.length}/{PUZZLES.length}</span>
        </div>
      </div>

      {/* ── ROOM VIEWPORT ── */}
      <div className="flex-1 relative overflow-hidden">

        {/* Room background */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, #0a1828 0%, #060e1c 45%, #04091a 100%)',
        }}>
          {/* Floor grid */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '42%',
            backgroundImage: 'linear-gradient(rgba(0,212,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.04) 1px,transparent 1px)',
            backgroundSize: '40px 40px' }} />
          {/* Ceiling lights glow */}
          {[25, 50, 75].map(x => (
            <div key={x} style={{ position: 'absolute', top: 0, left: `${x}%`, width: 150, height: 200, transform: 'translateX(-50%)',
              background: 'radial-gradient(ellipse at top,rgba(0,212,255,0.06) 0%,transparent 70%)' }} />
          ))}
          {/* Baseboards */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(0,212,255,0.14)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(0,212,255,0.1)' }} />
          {/* Lab atmosphere text */}
          <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', fontFamily: 'Orbitron,monospace', fontSize: 8, color: 'rgba(0,212,255,0.2)', letterSpacing: '0.4em' }}>
            PERIODIC RESEARCH CHAMBER — LEVEL 1
          </div>
          {/* Scan line */}
          <motion.div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.08),transparent)' }}
            animate={{ top: ['10%', '90%', '10%'] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
        </div>

        {/* ROOM OBJECTS */}
        {ROOM_OBJS.map(obj => {
          if (obj.isDoor) {
            return (
              <motion.div key={obj.id} style={{ position: 'absolute', left: `${obj.x}%`, top: `${obj.y}%`, width: obj.w, height: obj.h, transform: 'translate(-50%, -50%)', zIndex: 10,
                background: doorUnlock ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.05)',
                border: `2px solid ${doorUnlock ? '#f59e0b' : 'rgba(245,158,11,0.25)'}`, borderRadius: 10,
                boxShadow: doorUnlock ? '0 0 50px rgba(245,158,11,0.5)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.6s',
              }}
                animate={doorUnlock ? { scale: [1, 1.06, 1] } : {}} transition={{ duration: 1.2, repeat: Infinity }}>
                <span style={{ fontSize: 22 }}>{doorUnlock ? '🔓' : '🔒'}</span>
                <div>
                  <p style={{ fontSize: 10, fontFamily: 'Orbitron,monospace', color: '#f59e0b', fontWeight: 700 }}>
                    {doorUnlock ? 'UNLOCKED!' : 'EXIT DOOR'}
                  </p>
                  {!doorUnlock && <p style={{ fontSize: 7.5, color: 'rgba(245,158,11,0.5)', fontFamily: 'Space Grotesk,sans-serif' }}>Solve all puzzles</p>}
                </div>
              </motion.div>
            );
          }
          return (
            <RoomObjectCard key={obj.id} obj={obj} solved={solved} near={activePuzzle === obj.id}
              onClick={() => handleObjectClick(obj.id)} disabled={gameOver || won} />
          );
        })}

        {/* Mobile clues row */}
        <div className="md:hidden absolute bottom-20 left-0 right-0 flex justify-center gap-1.5 px-4 z-20">
          {clueData.map((clue, i) => <ClueFragment key={i} clue={clue} collected={clue.collected} />)}
        </div>
      </div>

      {/* ── PUZZLE PANEL (slides up) ── */}
      <AnimatePresence>
        {activePuzzle && activePuzzleData && (
          <motion.div className="absolute inset-x-0 bottom-0 z-40 flex flex-col rounded-t-3xl overflow-hidden"
            style={{ maxHeight: '72vh', background: 'rgba(4,8,20,0.98)', borderTop: `2px solid ${activePuzzleData.color}40`, backdropFilter: 'blur(20px)', boxShadow: `0 -20px 60px rgba(0,0,0,0.7), 0 -2px 30px ${activePuzzleData.color}15` }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}>

            {/* Top bar */}
            <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${activePuzzleData.color},transparent)` }} />
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${activePuzzleData.color}15` }}>
              <div>
                <p style={{ fontFamily: 'Orbitron,monospace', fontSize: 10, color: activePuzzleData.color, letterSpacing: '0.2em', marginBottom: 2 }}>
                  {activePuzzleData.objectLabel.toUpperCase()} · PUZZLE
                </p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter,sans-serif', maxWidth: 600, lineHeight: 1.5 }}>
                  {activePuzzleData.question}
                </p>
              </div>
              <button id="puzzle-close-btn" onClick={() => { setActivePuzzle(null); setShowHint(false); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <X size={15} className="text-white/50" />
              </button>
            </div>

            {/* Scrollable puzzle body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Feedback flash */}
              <AnimatePresence>
                {feedback && (
                  <motion.div className="mb-4 flex items-center gap-2.5 p-3 rounded-xl"
                    style={{ background: feedback === 'correct' ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${feedback === 'correct' ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}` }}
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {feedback === 'correct'
                      ? <><CheckCircle size={16} className="text-emerald-400" /><span className="text-xs font-space text-emerald-400">Excellent! Clue collected! 🎉</span></>
                      : <><span className="text-red-400 font-space text-xs">✗ {activePuzzleData.wrongFeedback}</span></>}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hint */}
              <AnimatePresence>
                {showHint && (
                  <motion.div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl"
                    style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.2)' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Lightbulb size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-inter leading-relaxed" style={{ color: 'rgba(251,191,36,0.85)' }}>{hintText}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {renderPuzzle()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAYS */}
      <AnimatePresence>{won && <ElementReveal onContinue={() => navigateTo('room2')} />}</AnimatePresence>
      <AnimatePresence>{gameOver && !won && <GameOverScreen onRetry={() => { setSolved([]); setClues([]); setLives(3); setTimer(600); setHints(3); setActivePuzzle(null); setFeedback(null); setGameOver(false); setDoorUnlock(false); }} />}</AnimatePresence>
    </div>
  );
}
