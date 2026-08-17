import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import PageContainer from '../components/PageContainer';
import {
  ArrowLeft, Zap, Clock, Target, Shield, Star,
  ChevronRight, Rocket, AlertTriangle, CheckCircle,
  Crosshair, Radio, Map, Trophy, Sparkles, Play,
  FlaskConical, Lock, Award, SkipForward,
} from 'lucide-react';

// ─── Mission data per chapter ──────────────────────────────────────────────────
const missionData = {
  'ch-1': {
    chapterId: 'ch-1',
    missionCode: 'MSN-0011',
    missionName: 'The Mole Vault',
    subtitle: 'A race against conversion',
    accentColor: '#22d3ee',
    glowColor: 'rgba(34,211,238,0.4)',
    difficultyLabel: 'Beginner',
    difficultyLevel: 1,
    timeEst: '3h',
    xp: 500,
    coins: 120,
    badgeName: 'Mole Pioneer',
    badgeIcon: '⚗️',
    badgeRarity: 'Common',
    badgeColor: '#22d3ee',
    rooms: 2,
    classification: 'ALPHA',
    story: [
      'A rogue chemist has locked down the institute\'s Mole Vault — a fortified chamber housing centuries of stoichiometry research.',
      'The automated security system demands answers to increasingly complex conversion problems before it grants access to each new corridor.',
      'You are the only agent with both the chemistry knowledge and the nerve to navigate the Vault. Every second counts — the self-destruct timer is already running.',
    ],
    objectives: [
      { text: 'Calculate molar masses of 10 unknown compounds', done: false },
      { text: 'Solve 3 stoichiometry conversion puzzles', done: false },
      { text: 'Apply Laws of Chemical Combination to unlock the inner vault', done: false },
      { text: 'Disarm the destruct sequence with Avogadro\'s number', done: false },
    ],
    tacticalNotes: 'The Vault security AI is calibrated for basic chemistry. Stay calm and convert systematically.',
    threatLevel: 'Low',
    threatColor: '#22d3ee',
  },
  'ch-2': {
    chapterId: 'ch-2',
    missionCode: 'MSN-0022',
    missionName: 'Quantum Core Breach',
    subtitle: 'Electrons hold the key',
    accentColor: '#00d4ff',
    glowColor: 'rgba(0,212,255,0.4)',
    difficultyLabel: 'Beginner',
    difficultyLevel: 2,
    timeEst: '4h',
    xp: 650,
    coins: 160,
    badgeName: 'Orbital Engineer',
    badgeIcon: '⚛️',
    badgeRarity: 'Common',
    badgeColor: '#00d4ff',
    rooms: 3,
    classification: 'BETA',
    story: [
      'Deep within the Institute\'s quantum research wing, a reactor core has gone critical. The only way to stabilize it is by correctly mapping the electron configuration of radioactive isotopes powering it.',
      'The security system is built around Bohr\'s atomic model — each door requires you to calculate the correct shell energies and quantum numbers to advance.',
      'Three chambers, three cores. Solve the electron configuration puzzles before the reactor reaches critical mass.',
    ],
    objectives: [
      { text: 'Identify the correct electron shell for 5 elements', done: false },
      { text: 'Assign all four quantum numbers for target atoms', done: false },
      { text: 'Map electron configurations using Aufbau principle', done: false },
      { text: 'Stabilize the quantum core by solving energy level transitions', done: false },
    ],
    tacticalNotes: 'Remember Pauli Exclusion Principle. No two electrons share all four quantum numbers.',
    threatLevel: 'Low',
    threatColor: '#22d3ee',
  },
  'ch-3': {
    chapterId: 'ch-3',
    missionCode: 'MSN-0033',
    missionName: 'Escape from the Periodic Research Lab',
    subtitle: 'The elements are your only allies',
    accentColor: '#a78bfa',
    glowColor: 'rgba(167,139,250,0.4)',
    difficultyLabel: 'Intermediate',
    difficultyLevel: 2,
    timeEst: '4.5h',
    xp: 700,
    coins: 180,
    badgeName: 'Table Commander',
    badgeIcon: '🏛️',
    badgeRarity: 'Uncommon',
    badgeColor: '#a78bfa',
    rooms: 3,
    classification: 'GAMMA',
    story: [
      'A rogue scientist has sabotaged the Periodic Research Lab — locking every exit behind elemental security panels that respond only to precise knowledge of periodic trends.',
      'The lab is divided into three wings: the Group Wing, the Period Corridor, and the Trends Chamber. Each demands mastery of a different aspect of the periodic table.',
      'Recover the Master Key by solving Periodic Table puzzles scattered across each wing. The key is fragmented — reassemble it to unlock the final escape hatch.',
    ],
    objectives: [
      { text: 'Identify the correct group and period for 8 elements', done: false },
      { text: 'Predict ionization energies across a given period', done: false },
      { text: 'Decode the electronegativity pattern in the Trends Chamber', done: false },
      { text: 'Recover the Master Key fragments and escape the lab', done: false },
    ],
    tacticalNotes: 'Periodic trends are your compass. Atomic radius decreases across a period, increases down a group.',
    threatLevel: 'Moderate',
    threatColor: '#f59e0b',
  },
  'ch-4': {
    chapterId: 'ch-4',
    missionCode: 'MSN-0044',
    missionName: 'The Molecular Prison',
    subtitle: 'Break the bonds, break free',
    accentColor: '#7c3aed',
    glowColor: 'rgba(124,58,237,0.4)',
    difficultyLabel: 'Intermediate',
    difficultyLevel: 3,
    timeEst: '5h',
    xp: 800,
    coins: 200,
    badgeName: 'Bond Breaker',
    badgeIcon: '🔗',
    badgeRarity: 'Uncommon',
    badgeColor: '#7c3aed',
    rooms: 4,
    classification: 'DELTA',
    story: [
      'You have been captured and imprisoned inside a molecular simulation — a virtual construct built entirely from chemical bond geometry.',
      'The prison walls are VSEPR molecular structures. Each cell door is locked by an incorrect geometry — solve it correctly and the bond breaks, freeing the next passage.',
      'Four chambers of increasing complexity stand between you and the exit. Ionic to covalent, simple to complex — master every bond type to escape.',
    ],
    objectives: [
      { text: 'Distinguish ionic from covalent bond characteristics', done: false },
      { text: 'Determine VSEPR geometry for 6 different molecules', done: false },
      { text: 'Solve hybridization puzzles (sp, sp2, sp3)', done: false },
      { text: 'Identify intermolecular forces to unlock the final exit', done: false },
    ],
    tacticalNotes: 'Lone pairs repel more than bond pairs. Use this to determine molecular geometry precisely.',
    threatLevel: 'Moderate',
    threatColor: '#f59e0b',
  },
  'ch-5': {
    chapterId: 'ch-5',
    missionCode: 'MSN-0055',
    missionName: 'The Phase Chamber',
    subtitle: 'Control the state, control your fate',
    accentColor: '#f97316',
    glowColor: 'rgba(249,115,22,0.4)',
    difficultyLabel: 'Intermediate',
    difficultyLevel: 3,
    timeEst: '4h',
    xp: 750,
    coins: 190,
    badgeName: 'Phase Master',
    badgeIcon: '🌡️',
    badgeRarity: 'Rare',
    badgeColor: '#f97316',
    rooms: 3,
    classification: 'EPSILON',
    story: [
      'An experimental Phase Chamber has malfunctioned, trapping its operators in a loop of uncontrolled matter state transitions. Solid. Liquid. Gas. Repeat.',
      'To reset the chamber, you must pass through each phase zone and solve the governing gas law equations that stabilize the transitions.',
      'The Ideal Gas Law is your master equation. Every chamber door opens only when the correct pressure, volume, and temperature relationship is satisfied.',
    ],
    objectives: [
      { text: 'Apply Boyle\'s Law to the solid-liquid transition lock', done: false },
      { text: 'Use Charles\'s Law to regulate the liquid-gas chamber', done: false },
      { text: 'Solve the combined gas law equation to exit the chamber', done: false },
    ],
    tacticalNotes: 'PV = nRT is the master key. Know which variable is constant in each sub-room.',
    threatLevel: 'Moderate',
    threatColor: '#f59e0b',
  },
  'ch-6': {
    chapterId: 'ch-6',
    missionCode: 'MSN-0066',
    missionName: 'Inferno Protocol',
    subtitle: 'Harness the heat or be consumed',
    accentColor: '#ec4899',
    glowColor: 'rgba(236,72,153,0.4)',
    difficultyLabel: 'Advanced',
    difficultyLevel: 4,
    timeEst: '6h',
    xp: 900,
    coins: 240,
    badgeName: 'Entropy Slayer',
    badgeIcon: '🔥',
    badgeRarity: 'Rare',
    badgeColor: '#ec4899',
    rooms: 4,
    classification: 'ZETA',
    story: [
      'The institute\'s thermodynamic reactor has entered "Inferno Protocol" — a runaway exothermic cycle threatening to melt down the entire facility.',
      'You must navigate through four increasingly hot zones, each locked by energy calculations. Calculate enthalpy changes, predict entropy direction, and determine Gibbs Free Energy spontaneity.',
      'Only by proving mastery of all three thermodynamic laws can you initiate the emergency shutdown sequence.',
    ],
    objectives: [
      { text: 'Calculate ΔH for 5 chemical reactions using Hess\'s Law', done: false },
      { text: 'Determine entropy change (ΔS) direction for each zone', done: false },
      { text: 'Evaluate Gibbs Free Energy (ΔG = ΔH - TΔS) spontaneity', done: false },
      { text: 'Initiate emergency shutdown using thermodynamic calculations', done: false },
    ],
    tacticalNotes: 'A negative ΔG means spontaneous. Use this to identify which reactions the reactor will favor.',
    threatLevel: 'High',
    threatColor: '#ef4444',
  },
  'ch-7': {
    chapterId: 'ch-7',
    missionCode: 'MSN-0077',
    missionName: 'The Balance Point',
    subtitle: 'Shift the equilibrium, shift the outcome',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245,158,11,0.4)',
    difficultyLabel: 'Advanced',
    difficultyLevel: 4,
    timeEst: '6.5h',
    xp: 950,
    coins: 260,
    badgeName: 'Le Chatelier\'s Ghost',
    badgeIcon: '⚖️',
    badgeRarity: 'Epic',
    badgeColor: '#f59e0b',
    rooms: 4,
    classification: 'ETA',
    story: [
      'A delicate equilibrium system controls the entire institute\'s power grid. A saboteur has deliberately stressed the system — pushing every reaction out of balance.',
      'You must apply Le Chatelier\'s Principle to each room, predicting how the equilibrium shifts under imposed stress — temperature, pressure, and concentration changes.',
      'Four interconnected reaction chambers, each feeding the next. Fix the balance point in each room to restore power and unlock the final escape.',
    ],
    objectives: [
      { text: 'Predict equilibrium shift under 6 stress conditions', done: false },
      { text: 'Calculate Kc and Kp values for the power chambers', done: false },
      { text: 'Solve ionic equilibrium puzzles in the buffer zone', done: false },
      { text: 'Restore the balance point and escape the grid', done: false },
    ],
    tacticalNotes: 'Increasing concentration of reactants shifts equilibrium right. Increasing pressure favors fewer moles of gas.',
    threatLevel: 'High',
    threatColor: '#ef4444',
  },
  'ch-8': {
    chapterId: 'ch-8',
    missionCode: 'MSN-0088',
    missionName: 'Carbon Labyrinth',
    subtitle: 'Navigate the organic maze',
    accentColor: '#f43f5e',
    glowColor: 'rgba(244,63,94,0.4)',
    difficultyLabel: 'Expert',
    difficultyLevel: 5,
    timeEst: '8h',
    xp: 1200,
    coins: 320,
    badgeName: 'Carbon Architect',
    badgeIcon: '🧬',
    badgeRarity: 'Legendary',
    badgeColor: '#f43f5e',
    rooms: 5,
    classification: 'OMEGA',
    story: [
      'The most dangerous escape yet. A vast Carbon Labyrinth — a maze of organic compound chains — has been activated by an unknown hostile agent.',
      'Every wall is a carbon skeleton. Every door is a functional group. Every corridor is an isomeric path with only one correct route.',
      'Navigate using IUPAC nomenclature, identify functional groups to unlock corridor junctions, and solve isomerism puzzles to find the single exit hidden deep within the labyrinth.',
    ],
    objectives: [
      { text: 'Name 10 organic compounds using IUPAC nomenclature', done: false },
      { text: 'Identify 8 functional groups across compound structures', done: false },
      { text: 'Distinguish structural isomers to navigate correct corridors', done: false },
      { text: 'Identify the hidden exit compound to escape the labyrinth', done: false },
    ],
    tacticalNotes: 'Always identify the longest carbon chain first. Substituents are named alphabetically. Double bonds take priority.',
    threatLevel: 'Critical',
    threatColor: '#f43f5e',
  },
};

// ─── Animated typewriter text ──────────────────────────────────────────────────
function TypewriterText({ text, delay = 0, speed = 18, className = '', onDone }) {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (displayed.length >= text.length) {
      onDone?.();
      return;
    }
    const t = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(t);
  }, [started, displayed, text, speed, onDone]);

  return (
    <span className={className}>
      {displayed}
      {displayed.length < text.length && started && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.7, repeat: Infinity }}
          className="inline-block w-0.5 h-4 ml-0.5 align-middle"
          style={{ background: 'currentColor' }}
        />
      )}
    </span>
  );
}

// ─── Radar sweep animation ─────────────────────────────────────────────────────
function RadarDisplay({ color, rooms, missionCode }) {
  const dots = [
    { x: 50, y: 30, r: 3, label: 'Entry' },
    { x: 70, y: 55, r: 2.5, label: 'Rm 1' },
    { x: 40, y: 65, r: 2.5, label: 'Rm 2' },
    { x: 60, y: 80, r: 2.5, label: 'Rm 3' },
    { x: 50, y: 50, r: 4, label: 'EXIT', isExit: true },
  ].slice(0, rooms + 2);

  return (
    <div className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.5)',
        border: `1px solid ${color}25`,
        width: '100%',
        height: 220,
      }}>
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        {[20, 40, 60, 80].map(v => (
          <g key={v}>
            <line x1={v} y1={0} x2={v} y2={100} stroke={color} strokeWidth="0.3" />
            <line x1={0} y1={v} x2={100} y2={v} stroke={color} strokeWidth="0.3" />
          </g>
        ))}
      </svg>

      {/* Radar circles */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id={`radarGrad${missionCode}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} stopOpacity="0.06" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="80" fill={`url(#radarGrad${missionCode})`} stroke={color} strokeWidth="0.5" strokeOpacity="0.2" />
        <circle cx="100" cy="100" r="55" fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.15" />
        <circle cx="100" cy="100" r="30" fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.12" />
        <circle cx="100" cy="100" r="8" fill={color} fillOpacity="0.2" />

        {/* Crosshairs */}
        <line x1="100" y1="20" x2="100" y2="180" stroke={color} strokeWidth="0.4" strokeOpacity="0.12" />
        <line x1="20" y1="100" x2="180" y2="100" stroke={color} strokeWidth="0.4" strokeOpacity="0.12" />

        {/* Sweep line */}
        <motion.line
          x1="100" y1="100" x2="100" y2="22"
          stroke={color} strokeWidth="1.5" strokeOpacity="0.7"
          style={{ transformOrigin: '100px 100px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Sweep gradient trail */}
        <motion.path
          d="M 100 100 L 100 22 A 78 78 0 0 0 22 100 Z"
          fill={color} fillOpacity="0.04"
          style={{ transformOrigin: '100px 100px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />

        {/* Room blips */}
        {dots.map((d, i) => (
          <motion.g key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.3, type: 'spring' }}>
            <motion.circle
              cx={d.x * 2} cy={d.y * 2} r={d.r * 2}
              fill={d.isExit ? '#34d399' : color}
              fillOpacity="0.9"
              animate={{ r: [d.r * 2, d.r * 3, d.r * 2], fillOpacity: [0.9, 1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
            <text
              x={d.x * 2 + 5} y={d.y * 2 + 4}
              fontSize="7" fill={d.isExit ? '#34d399' : color}
              fillOpacity="0.7" fontFamily="Orbitron">{d.label}</text>
          </motion.g>
        ))}

        {/* Path lines between rooms */}
        {dots.slice(0, -1).map((d, i) => (
          <motion.line key={i}
            x1={d.x * 2} y1={d.y * 2}
            x2={dots[i + 1].x * 2} y2={dots[i + 1].y * 2}
            stroke={color} strokeWidth="0.6" strokeOpacity="0.2" strokeDasharray="3 2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.8 + i * 0.2, duration: 0.5 }}
          />
        ))}
      </svg>

      {/* HUD overlays */}
      <div className="absolute top-2 left-3 font-orbitron text-[9px] tracking-widest" style={{ color }}>
        {missionCode}
      </div>
      <div className="absolute top-2 right-3 font-orbitron text-[9px]" style={{ color }}>
        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          ● LIVE
        </motion.span>
      </div>
      <div className="absolute bottom-2 left-3 font-space text-[8px] text-white/25 tracking-widest">
        TACTICAL MAP
      </div>
      <div className="absolute bottom-2 right-3 font-orbitron text-[9px]" style={{ color, opacity: 0.6 }}>
        {rooms} ROOMS
      </div>
    </div>
  );
}

// ─── Difficulty bar ────────────────────────────────────────────────────────────
function DifficultyBar({ level, color }) {
  const labels = ['', 'Beginner', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <motion.div
            key={i}
            className="h-2 rounded-sm"
            style={{
              width: 24,
              background: i <= level ? color : 'rgba(255,255,255,0.06)',
              boxShadow: i <= level ? `0 0 6px ${color}60` : 'none',
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8 + i * 0.08, duration: 0.3 }}
          />
        ))}
      </div>
      <span className="font-space text-sm font-semibold" style={{ color }}>
        {labels[level]}
      </span>
    </div>
  );
}

// ─── Rarity config ─────────────────────────────────────────────────────────────
const rarityConfig = {
  Common:    { bg: 'rgba(34,211,238,0.1)',  border: 'rgba(34,211,238,0.3)',  text: '#22d3ee' },
  Uncommon:  { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)',  text: '#34d399' },
  Rare:      { bg: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.3)',  text: '#a855f7' },
  Epic:      { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.3)',  text: '#fbbf24' },
  Legendary: { bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.4)',   text: '#f43f5e' },
};

// ─── Badge preview ─────────────────────────────────────────────────────────────
function BadgePreview({ badge, color, rarity }) {
  const rc = rarityConfig[rarity] || rarityConfig.Common;
  return (
    <motion.div
      className="flex flex-col items-center gap-3 p-5 rounded-2xl"
      style={{ background: rc.bg, border: `1px solid ${rc.border}` }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
    >
      {/* Badge icon with pulse rings */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className="absolute w-16 h-16 rounded-full"
          style={{ border: `2px solid ${rc.text}`, opacity: 0.2 }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <motion.div
          className="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
          style={{
            background: `${color}15`,
            border: `2px solid ${color}40`,
            boxShadow: `0 0 25px ${color}30`,
          }}
          animate={{ boxShadow: [`0 0 20px ${color}20`, `0 0 40px ${color}50`, `0 0 20px ${color}20`] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          {badge.icon}
        </motion.div>
      </div>

      <div className="text-center">
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-space font-semibold"
          style={{ background: rc.bg, border: `1px solid ${rc.border}`, color: rc.text }}
        >
          {rarity}
        </span>
        <p className="font-space font-bold text-white text-sm mt-1.5">{badge.name}</p>
        <p className="text-[10px] text-white/30 font-inter mt-0.5">Mission Completion Badge</p>
      </div>
    </motion.div>
  );
}

// ─── Scanline overlay effect ───────────────────────────────────────────────────
function ScanlineOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50" style={{ opacity: 0.015 }}>
      <div className="w-full h-full" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,255,0.8) 0px, rgba(0,255,255,0.8) 1px, transparent 1px, transparent 4px)',
        backgroundSize: '100% 4px',
      }} />
    </div>
  );
}

// ─── HUD corner brackets ───────────────────────────────────────────────────────
function HUDCorners({ color, size = 20 }) {
  const style = { position: 'absolute', width: size, height: size };
  const lineStyle = { background: color, opacity: 0.7 };
  return (
    <>
      <div style={{ ...style, top: 0, left: 0 }}>
        <div style={{ ...lineStyle, width: '100%', height: 2, position: 'absolute', top: 0 }} />
        <div style={{ ...lineStyle, height: '100%', width: 2, position: 'absolute', left: 0 }} />
      </div>
      <div style={{ ...style, top: 0, right: 0 }}>
        <div style={{ ...lineStyle, width: '100%', height: 2, position: 'absolute', top: 0 }} />
        <div style={{ ...lineStyle, height: '100%', width: 2, position: 'absolute', right: 0 }} />
      </div>
      <div style={{ ...style, bottom: 0, left: 0 }}>
        <div style={{ ...lineStyle, width: '100%', height: 2, position: 'absolute', bottom: 0 }} />
        <div style={{ ...lineStyle, height: '100%', width: 2, position: 'absolute', left: 0 }} />
      </div>
      <div style={{ ...style, bottom: 0, right: 0 }}>
        <div style={{ ...lineStyle, width: '100%', height: 2, position: 'absolute', bottom: 0 }} />
        <div style={{ ...lineStyle, height: '100%', width: 2, position: 'absolute', right: 0 }} />
      </div>
    </>
  );
}

// ─── Main Mission Brief Page ───────────────────────────────────────────────────
export default function MissionBriefPage() {
  const { navigateTo, selectedChapter } = useNavigation();
  const chapterId = selectedChapter?.id || 'ch-1';
  const mission = missionData[chapterId] || missionData['ch-1'];

  const [phase, setPhase] = useState('boot'); // boot | brief | ready
  const [storyParagraph, setStoryParagraph] = useState(0);
  const [objectivesVisible, setObjectivesVisible] = useState(false);
  const [launching, setLaunching] = useState(false);

  // Boot sequence → brief phase
  useEffect(() => {
    const t = setTimeout(() => setPhase('brief'), 1400);
    return () => clearTimeout(t);
  }, []);

  // After story renders, show objectives
  const handleStoryDone = () => {
    if (storyParagraph < mission.story.length - 1) {
      setTimeout(() => setStoryParagraph(p => p + 1), 300);
    } else {
      setTimeout(() => { setObjectivesVisible(true); setPhase('ready'); }, 600);
    }
  };

  const handleLaunch = async () => {
    setLaunching(true);

    try {
      // Import game registry helpers dynamically
      const { getGameEndpointByGameType } = await import('../games/gameRegistry');
      const { roomService } = await import('../services/roomService');

      let targetScreen = 'calculation-heist';

      if (chapterId) {
        const roomsData = await roomService.getRoomsByChapter(chapterId);
        const roomsList = Array.isArray(roomsData) ? roomsData : roomsData.rooms || [];

        if (roomsList.length > 0 && roomsList[0].gameType) {
          targetScreen = getGameEndpointByGameType(roomsList[0].gameType);
        } else {
          // Fallback based on chapter ID or title pattern
          const cid = String(chapterId || mission.chapterId);
          const cTitle = String(selectedChapter?.title || '');
          if (cid.includes('chap-2') || cid.includes('ch-2') || cTitle.includes('Atom')) targetScreen = 'quantum-architect';
          else if (cid.includes('chap-3') || cid.includes('ch-3') || cTitle.includes('Periodic')) targetScreen = 'grid-reconstruction';
          else if (cid.includes('chap-4') || cid.includes('ch-4') || cTitle.includes('Hydrogen')) targetScreen = 'hydrogen-reactor';
          else if (cid.includes('chap-5') || cid.includes('ch-5') || cTitle.includes('Metal') || cTitle.includes('s-Block')) targetScreen = 'metal-sorting';
          else if (cid.includes('chap-6') || cid.includes('ch-6') || cTitle.includes('Gas')) targetScreen = 'gas-simulator';
          else targetScreen = 'calculation-heist';
        }
      }

      setTimeout(() => {
        navigateTo(targetScreen);
      }, 1400);
    } catch (err) {
      console.warn('Fallback launch routing:', err);
      setTimeout(() => {
        const cid = String(chapterId || mission.chapterId);
        const cTitle = String(selectedChapter?.title || '');
        if (cid.includes('chap-2') || cid.includes('ch-2') || cTitle.includes('Atom')) navigateTo('quantum-architect');
        else if (cid.includes('chap-3') || cid.includes('ch-3') || cTitle.includes('Periodic')) navigateTo('grid-reconstruction');
        else if (cid.includes('chap-4') || cid.includes('ch-4') || cTitle.includes('Hydrogen')) navigateTo('hydrogen-reactor');
        else if (cid.includes('chap-5') || cid.includes('ch-5') || cTitle.includes('Metal') || cTitle.includes('s-Block')) navigateTo('metal-sorting');
        else if (cid.includes('chap-6') || cid.includes('ch-6') || cTitle.includes('Gas')) navigateTo('gas-simulator');
        else navigateTo('calculation-heist');
      }, 1400);
    }
  };

  const color = mission.accentColor;
  const glow = mission.glowColor;

  return (
    <div className="relative min-h-screen bg-[#020609] text-white overflow-x-hidden flex flex-col">
      <ScanlineOverlay />

      {/* ── Boot Sequence ── */}
      <AnimatePresence>
        {phase === 'boot' && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: '#020609' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center gap-5">
              {/* Scanning animation */}
              <div className="relative w-20 h-20">
                <motion.div className="absolute inset-0 rounded-full"
                  style={{ border: `2px solid ${color}30` }} />
                <motion.div className="absolute inset-0 rounded-full"
                  style={{ border: `2px solid ${color}`, borderColor: `${color} transparent transparent transparent` }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                <Crosshair size={28} className="absolute inset-0 m-auto" style={{ color }} />
              </div>
              <div className="text-center">
                <motion.p className="font-orbitron text-xs tracking-[0.4em] mb-1" style={{ color }}
                  animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                  INITIALIZING MISSION BRIEF
                </motion.p>
                <p className="font-space text-xs text-white/20 tracking-widest">{mission.missionCode}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Launch sequence overlay ── */}
      <AnimatePresence>
        {launching && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: '#020609' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="flex flex-col items-center gap-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="text-6xl"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              >
                {mission.badgeIcon}
              </motion.div>
              <div className="text-center">
                <motion.p className="font-orbitron font-black text-2xl text-white mb-2"
                  animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                  MISSION LAUNCHING
                </motion.p>
                <p className="font-space text-sm" style={{ color }}>{mission.missionName}</p>
              </div>
              {/* Progress bar */}
              <div className="w-64 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${color}, ${color}99)` }}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(0,0,0,0.8) 0%, transparent 70%)' }} />
        <motion.div
          className="absolute top-1/2 right-0 w-[600px] h-[600px] rounded-full -translate-y-1/2"
          style={{ background: `radial-gradient(circle, ${glow.replace('0.4', '0.08')} 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Lab grid */}
      <div className="fixed inset-0 lab-grid opacity-15 pointer-events-none z-0" />

      {/* ── Top navigation bar ── */}
      <motion.div
        className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-5"
        style={{ borderBottom: `1px solid ${color}15` }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: phase === 'boot' ? 0 : 1, y: phase === 'boot' ? -20 : 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Back button */}
        <button
          onClick={() => navigateTo('chapters')}
          id="brief-back-btn"
          className="inline-flex items-center gap-2 text-white/30 hover:text-white/70 font-space text-sm transition-colors group bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Chapters
        </button>

        {/* Mission code + status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
            <Radio size={12} style={{ color }} />
            <span className="font-orbitron text-xs tracking-widest" style={{ color }}>{mission.missionCode}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{
              background: `${mission.threatColor}10`,
              border: `1px solid ${mission.threatColor}25`,
            }}>
            <AlertTriangle size={12} style={{ color: mission.threatColor }} />
            <span className="font-orbitron text-xs tracking-widest" style={{ color: mission.threatColor }}>
              {mission.threatLevel.toUpperCase()} THREAT
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Main content ── */}
      <motion.div
        className="relative z-10 flex-1 px-6 sm:px-10 py-6 pb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'boot' ? 0 : 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="max-w-7xl mx-auto">

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ════ LEFT COLUMN (3/5) ════ */}
            <div className="lg:col-span-3 flex flex-col gap-6">

              {/* Mission title block */}
              <div>
                {/* Classification badge */}
                <motion.div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-4"
                  style={{ background: `${color}0d`, border: `1px solid ${color}25` }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <FlaskConical size={12} style={{ color }} />
                  <span className="font-orbitron text-[10px] tracking-[0.3em]" style={{ color }}>
                    CLASS-{mission.classification} · 11TH STD · CHAPTER {chapterId?.replace('ch-', '')}
                  </span>
                </motion.div>

                {/* Mission name */}
                <motion.h1
                  className="font-orbitron font-black text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.span
                    style={{ color }}
                    animate={{ textShadow: [`0 0 20px ${color}40`, `0 0 50px ${color}80`, `0 0 20px ${color}40`] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {mission.missionName}
                  </motion.span>
                </motion.h1>
                <motion.p
                  className="text-white/35 font-space text-base italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  "{mission.subtitle}"
                </motion.p>
              </div>

              {/* ── Story / Intel Report ── */}
              <motion.div
                className="relative rounded-2xl p-6"
                style={{
                  background: 'rgba(0,0,0,0.45)',
                  border: `1px solid ${color}18`,
                  backdropFilter: 'blur(12px)',
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <HUDCorners color={color} size={14} />

                {/* Header */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                    <Radio size={12} style={{ color }} />
                  </div>
                  <span className="font-orbitron text-xs tracking-[0.25em] uppercase" style={{ color }}>
                    Intel Report
                  </span>
                  <motion.div
                    className="ml-auto w-1.5 h-1.5 rounded-full"
                    style={{ background: color }}
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                </div>

                {/* Story paragraphs */}
                <div className="space-y-4">
                  {mission.story.map((para, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: i <= storyParagraph ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {i < storyParagraph ? (
                        <p className="text-white/55 text-sm font-inter leading-relaxed">{para}</p>
                      ) : i === storyParagraph && phase !== 'boot' ? (
                        <TypewriterText
                          text={para}
                          delay={i === 0 ? 200 : 0}
                          speed={16}
                          className="text-white/55 text-sm font-inter leading-relaxed"
                          onDone={handleStoryDone}
                        />
                      ) : null}
                    </motion.div>
                  ))}
                </div>

                {/* Tactical note */}
                <AnimatePresence>
                  {objectivesVisible && (
                    <motion.div
                      className="mt-5 p-3 rounded-xl flex items-start gap-2.5"
                      style={{ background: `${color}08`, border: `1px solid ${color}20` }}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.4 }}
                    >
                      <AlertTriangle size={14} style={{ color, flexShrink: 0, marginTop: 2 }} />
                      <p className="text-xs font-inter leading-relaxed" style={{ color: `${color}cc` }}>
                        <span className="font-semibold">TACTICAL NOTE: </span>
                        {mission.tacticalNotes}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ── Objectives ── */}
              <AnimatePresence>
                {objectivesVisible && (
                  <motion.div
                    className="relative rounded-2xl p-6"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${color}18`,
                      backdropFilter: 'blur(12px)',
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <HUDCorners color={color} size={14} />

                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                        <Target size={12} style={{ color }} />
                      </div>
                      <span className="font-orbitron text-xs tracking-[0.25em] uppercase" style={{ color }}>
                        Objectives
                      </span>
                      <span className="ml-auto text-xs font-space text-white/30">
                        {mission.objectives.length} tasks
                      </span>
                    </div>

                    <div className="space-y-3">
                      {mission.objectives.map((obj, i) => (
                        <motion.div
                          key={i}
                          className="flex items-start gap-3 group"
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {/* Objective number */}
                          <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              background: `${color}12`,
                              border: `1px solid ${color}28`,
                            }}>
                            <span className="font-orbitron text-[10px] font-bold" style={{ color }}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm font-inter leading-relaxed group-hover:text-white/80 transition-colors">
                            {obj.text}
                          </p>
                          {/* Pending indicator */}
                          <motion.div
                            className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                            style={{ background: 'rgba(255,255,255,0.15)' }}
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ════ RIGHT COLUMN (2/5) ════ */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Tactical radar map */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <RadarDisplay color={color} rooms={mission.rooms} missionCode={mission.missionCode} />
              </motion.div>

              {/* ── Mission Stats ── */}
              <motion.div
                className="relative rounded-2xl p-5"
                style={{
                  background: 'rgba(0,0,0,0.4)',
                  border: `1px solid ${color}18`,
                  backdropFilter: 'blur(12px)',
                }}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <HUDCorners color={color} size={12} />

                <p className="font-orbitron text-[10px] tracking-[0.25em] mb-4" style={{ color }}>
                  MISSION PARAMETERS
                </p>

                <div className="space-y-4">
                  {/* Difficulty */}
                  <div>
                    <p className="text-[10px] text-white/30 font-space tracking-widest uppercase mb-2">Difficulty</p>
                    <DifficultyBar level={mission.difficultyLevel} color={color} />
                  </div>

                  {/* Divider */}
                  <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}20, transparent)` }} />

                  {/* Time + Rooms grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Est. Duration', value: mission.timeEst, icon: Clock },
                      { label: 'Rooms', value: `${mission.rooms} rooms`, icon: Map },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="p-3 rounded-xl"
                        style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                        <Icon size={13} style={{ color, marginBottom: 6 }} />
                        <p className="font-orbitron font-bold text-white text-sm leading-none">{value}</p>
                        <p className="text-[10px] text-white/30 font-space mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* ── Rewards ── */}
              <AnimatePresence>
                {objectivesVisible && (
                  <motion.div
                    className="relative rounded-2xl p-5"
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: `1px solid ${color}18`,
                      backdropFilter: 'blur(12px)',
                    }}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <HUDCorners color={color} size={12} />

                    <p className="font-orbitron text-[10px] tracking-[0.25em] mb-4" style={{ color }}>
                      MISSION REWARDS
                    </p>

                    {/* XP + Coins */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {/* XP */}
                      <motion.div
                        className="flex flex-col gap-1.5 p-3.5 rounded-xl relative overflow-hidden"
                        style={{ background: `${color}0d`, border: `1px solid ${color}22` }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <motion.div className="absolute inset-0 rounded-xl opacity-0"
                          style={{ background: `${color}15` }}
                          whileHover={{ opacity: 1 }} transition={{ duration: 0.2 }} />
                        <Zap size={16} style={{ color }} className="relative z-10" />
                        <span className="font-orbitron font-black text-xl relative z-10" style={{ color }}>
                          +{mission.xp.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-white/30 font-space relative z-10">Experience Points</span>
                      </motion.div>

                      {/* Coins */}
                      <motion.div
                        className="flex flex-col gap-1.5 p-3.5 rounded-xl relative overflow-hidden"
                        style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <span className="text-xl relative z-10">🪙</span>
                        <span className="font-orbitron font-black text-xl text-amber-400 relative z-10">
                          +{mission.coins}
                        </span>
                        <span className="text-[10px] text-white/30 font-space relative z-10">Lab Coins</span>
                      </motion.div>
                    </div>

                    {/* Badge */}
                    <BadgePreview
                      badge={{ name: mission.badgeName, icon: mission.badgeIcon }}
                      color={color}
                      rarity={mission.badgeRarity}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Start Mission Button ── */}
              <AnimatePresence>
                {phase === 'ready' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.button
                      id="start-mission-btn"
                      onClick={handleLaunch}
                      disabled={launching}
                      className="relative w-full py-5 rounded-2xl font-orbitron font-black text-lg tracking-[0.15em] uppercase text-white overflow-hidden flex items-center justify-center gap-3"
                      style={{
                        background: `linear-gradient(135deg, ${color}, ${color}99)`,
                        boxShadow: `0 0 30px ${glow}, 0 10px 40px rgba(0,0,0,0.5)`,
                        border: `1px solid ${color}60`,
                      }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: `0 0 60px ${glow}, 0 15px 50px rgba(0,0,0,0.5)`,
                      }}
                      whileTap={{ scale: 0.97 }}
                      animate={{
                        boxShadow: [
                          `0 0 25px ${glow}, 0 10px 35px rgba(0,0,0,0.4)`,
                          `0 0 50px ${glow}, 0 10px 35px rgba(0,0,0,0.4)`,
                          `0 0 25px ${glow}, 0 10px 35px rgba(0,0,0,0.4)`,
                        ],
                      }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      {/* Animated shine sweep */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      />

                      {/* Pulse ring */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{ border: `2px solid ${color}` }}
                        animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.03, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />

                      <Rocket size={20} className="relative z-10" />
                      <span className="relative z-10">Start Mission</span>
                      <ChevronRight size={18} className="relative z-10 opacity-70" />
                    </motion.button>

                    {/* Skip / abort link */}
                    <div className="flex items-center justify-center gap-3 mt-3">
                      <button
                        onClick={() => navigateTo('chapters')}
                        className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/50 font-space transition-colors bg-transparent border-0 cursor-pointer"
                      >
                        <SkipForward size={12} />
                        Abort Mission
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
