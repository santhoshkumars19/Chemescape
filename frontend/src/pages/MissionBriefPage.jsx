import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PageContainer from '../components/PageContainer';
import {
  getChaptersForStandardAndSubject,
  getChapterStatus,
  getSubjectsForStandard,
} from '../config/curriculumConfig';
import {
  ArrowLeft, Zap, Clock, Target, Shield, Star,
  ChevronRight, Rocket, AlertTriangle, CheckCircle,
  Crosshair, Radio, Map, Trophy, Sparkles, Play,
  FlaskConical, Lock, Award, SkipForward, RotateCcw,
  Heart, BookOpen, GraduationCap, CheckCircle2,
} from 'lucide-react';

// ─── Standard Chemistry Mission Presets ─────────────────────────────────────────
const CHEMISTRY_MISSIONS = {
  'chap-1': {
    missionCode: 'MSN-0011',
    missionName: 'The Mole Vault',
    subtitle: 'A race against chemical conversion',
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
    rooms: 2,
    classification: 'ALPHA',
    gameType: 'CALCULATION_HEIST',
    gameScreen: 'calculation-heist',
    topics: [
      'Mole Concept & Avogadro Number',
      'Molar Mass & Stoichiometry',
      'Empirical & Molecular Formulae',
      'Concentration of Solutions (Molarity, Molality)',
    ],
    story: [
      'A lockdown alert has been triggered in the Mole Vault — a fortified research repository housing centuries of stoichiometry algorithms.',
      'The automated security system demands answers to increasingly complex conversion and molarity puzzles before it grants access to each new chamber.',
      'You are the only agent with both the chemistry knowledge and the precision to disarm the vault lockdown before the self-destruct countdown reaches zero.',
    ],
    objectives: [
      { text: 'Calculate molar masses of target compounds', done: false },
      { text: 'Solve stoichiometry conversion equations', done: false },
      { text: 'Apply the Laws of Chemical Combination to override security', done: false },
      { text: 'Disarm the countdown with Avogadro\'s constant', done: false },
    ],
    tacticalNotes: 'Convert systematically. Watch out for unit conversions between grams and moles.',
    threatLevel: 'Low',
    threatColor: '#22d3ee',
  },
  'chap-2': {
    missionCode: 'MSN-0022',
    missionName: 'Quantum Core Breach',
    subtitle: 'Electrons hold the master key',
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
    rooms: 3,
    classification: 'BETA',
    gameType: 'QUANTUM_ARCHITECT',
    gameScreen: 'quantum-architect',
    topics: [
      'Bohr\'s Model & Dual Nature of Matter',
      'de Broglie & Heisenberg Uncertainty Principle',
      'Quantum Numbers (n, l, m, s)',
      'Aufbau Principle, Pauli Exclusion & Hund\'s Rule',
    ],
    story: [
      'Deep within the quantum research wing, an orbital containment chamber has experienced a subatomic resonance breach.',
      'The automated safety valves are locked behind electron configuration matrices that require exact quantum numbers to calibrate.',
      'Stabilize all three containment rings by mapping orbitals correctly before energy levels reach critical threshold.',
    ],
    objectives: [
      { text: 'Identify principal and azimuthal quantum numbers', done: false },
      { text: 'Assign electron configurations using Aufbau ordering', done: false },
      { text: 'Verify spin states with Hund\'s rule of maximum multiplicity', done: false },
      { text: 'Stabilize the core with radial wave node solutions', done: false },
    ],
    tacticalNotes: 'Remember the Pauli Exclusion Principle: no two electrons can share identical quantum sets.',
    threatLevel: 'Moderate',
    threatColor: '#00d4ff',
  },
  'chap-3': {
    missionCode: 'MSN-0033',
    missionName: 'Periodic Grid Reconstruction',
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
    rooms: 3,
    classification: 'GAMMA',
    gameType: 'GRID_RECONSTRUCTION',
    gameScreen: 'grid-reconstruction',
    topics: [
      'Modern Periodic Law & Table Layout',
      'Periodic Trends: Atomic & Ionic Radii',
      'Ionization Enthalpy & Electron Gain Enthalpy',
      'Electronegativity & Valence States',
    ],
    story: [
      'A cyber glitch has corrupted the master periodic matrix, scrambling elemental classifications across groups and periods.',
      'Navigate through the alkali, transition, and halogen sectors to restore damaged coordinate nodes with accurate periodic trend data.',
      'Assemble all fragmented table tiles to reactivate the mainframe containment shield.',
    ],
    objectives: [
      { text: 'Identify correct group and period coordinates for 8 elements', done: false },
      { text: 'Predict ionization energy gradients across Period 3', done: false },
      { text: 'Calibrate electronegativity meters in the halogen wing', done: false },
      { text: 'Restore the periodic core grid to full functionality', done: false },
    ],
    tacticalNotes: 'Atomic radius decreases left-to-right across periods and increases down groups.',
    threatLevel: 'Moderate',
    threatColor: '#a78bfa',
  },
  'chap-4': {
    missionCode: 'MSN-0044',
    missionName: 'Hydrogen Reactor Terminal',
    subtitle: 'Control the simplest element, harness immense power',
    accentColor: '#7c3aed',
    glowColor: 'rgba(124,58,237,0.4)',
    difficultyLabel: 'Intermediate',
    difficultyLevel: 3,
    timeEst: '5h',
    xp: 800,
    coins: 200,
    badgeName: 'Reactor Operator',
    badgeIcon: '💧',
    badgeRarity: 'Uncommon',
    rooms: 4,
    classification: 'DELTA',
    gameType: 'HYDROGEN_REACTOR',
    gameScreen: 'hydrogen-reactor',
    topics: [
      'Position of Hydrogen & Isotopes (Protium, Deuterium, Tritium)',
      'Hydrides (Ionic, Covalent, Interstitial)',
      'Water & Heavy Water (D2O)',
      'Hydrogen Peroxide & Hydrogen Economy',
    ],
    story: [
      'The hydrogen fuel cell generation unit has lost automated isotope balance regulation.',
      'Control hydrogen combustion rates, balance isotope pressure chambers, and synthesize heavy water moderators.',
      'Stabilize all four reactor injectors to bring the power grid back online safely.',
    ],
    objectives: [
      { text: 'Separate protium from deuterium isotopes', done: false },
      { text: 'Regulate covalent hydride fuel injectors', done: false },
      { text: 'Neutralize excess peroxide in the cooling channel', done: false },
      { text: 'Engage the clean hydrogen fuel cell master switch', done: false },
    ],
    tacticalNotes: 'Heavy water moderates neutrons. Monitor temperature differentials closely.',
    threatLevel: 'High',
    threatColor: '#f59e0b',
  },
  'chap-5': {
    missionCode: 'MSN-0055',
    missionName: 'Element Sorting Factory',
    subtitle: 'Flame tests and alkali reactions',
    accentColor: '#f97316',
    glowColor: 'rgba(249,115,22,0.4)',
    difficultyLabel: 'Advanced',
    difficultyLevel: 3,
    timeEst: '4h',
    xp: 900,
    coins: 240,
    badgeName: 'Metal Master',
    badgeIcon: '🔥',
    badgeRarity: 'Rare',
    rooms: 3,
    classification: 'EPSILON',
    gameType: 'METAL_SORTING',
    gameScreen: 'metal-sorting',
    topics: [
      'Group 1 Alkali Metals: Physical & Chemical Trends',
      'Group 2 Alkaline Earth Metals: Reactivity & Solubility',
      'Flame Test Emission Spectra',
      'Important Compounds of Calcium & Sodium',
    ],
    story: [
      'A robotic assembly line in the chemical purification plant has mixed up raw canisters of alkali and alkaline earth metals.',
      'Use spectral flame tests, reactivity with water, and solubility indicators to sort and categorize every element accurately before runaway reactions ignite.',
    ],
    objectives: [
      { text: 'Identify sodium (yellow), potassium (violet), and calcium (brick red) by flame', done: false },
      { text: 'Sort Group 1 and Group 2 metal ingots into insulated bins', done: false },
      { text: 'Calibrate carbonate precipitate solubility testers', done: false },
      { text: 'Restore automated factory sorting conveyor', done: false },
    ],
    tacticalNotes: 'Alkali metals react violently with moisture. Keep under mineral oil.',
    threatLevel: 'High',
    threatColor: '#f97316',
  },
  'chap-6': {
    missionCode: 'MSN-0066',
    missionName: 'Gas Chamber Simulator',
    subtitle: 'Ideal laws and molecular velocities',
    accentColor: '#ec4899',
    glowColor: 'rgba(236,72,153,0.4)',
    difficultyLabel: 'Expert',
    difficultyLevel: 4,
    timeEst: '6h',
    xp: 950,
    coins: 250,
    badgeName: 'Gas Kineticist',
    badgeIcon: '💨',
    badgeRarity: 'Rare',
    rooms: 4,
    classification: 'ZETA',
    gameType: 'GAS_SIMULATOR',
    gameScreen: 'gas-simulator',
    topics: [
      'Gas Laws: Boyle\'s, Charles\'s, Gay-Lussac\'s, Avogadro\'s',
      'Ideal Gas Equation (PV = nRT)',
      'Dalton\'s Law of Partial Pressures',
      'Kinetic Molecular Theory & Real Gas Deviations (van der Waals)',
    ],
    story: [
      'An environmental containment chamber is fluctuating across extreme pressure and temperature cycles.',
      'Adjust pressure, volume, and temperature parameters using the ideal gas and van der Waals equations to normalize atmospheric conditions before containment seals breach.',
    ],
    objectives: [
      { text: 'Apply Boyle\'s Law (P1V1 = P2V2) to depressurize Chamber 1', done: false },
      { text: 'Calibrate Charles\'s Law thermal regulators in Chamber 2', done: false },
      { text: 'Calculate partial pressures using Dalton\'s Law in Chamber 3', done: false },
      { text: 'Engage the van der Waals compressibility stabilizer', done: false },
    ],
    tacticalNotes: 'PV = nRT is your anchor. Convert temperatures to Kelvin without exception.',
    threatLevel: 'Extreme',
    threatColor: '#ec4899',
  },
};

// ─── Scanline Overlay ──────────────────────────────────────────────────────────
function ScanlineOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-40"
      style={{
        background:
          'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
      }}
    />
  );
}

// ─── HUD Corner Accents ───────────────────────────────────────────────────────
function HUDCorners({ color = '#22d3ee', size = 12 }) {
  const s = { borderColor: color };
  return (
    <>
      <div className="absolute top-0 left-0 border-t-2 border-l-2 pointer-events-none" style={{ ...s, width: size, height: size }} />
      <div className="absolute top-0 right-0 border-t-2 border-r-2 pointer-events-none" style={{ ...s, width: size, height: size }} />
      <div className="absolute bottom-0 left-0 border-b-2 border-l-2 pointer-events-none" style={{ ...s, width: size, height: size }} />
      <div className="absolute bottom-0 right-0 border-b-2 border-r-2 pointer-events-none" style={{ ...s, width: size, height: size }} />
    </>
  );
}

// ─── Tactical Radar Display ───────────────────────────────────────────────────
function RadarDisplay({ color = '#22d3ee', rooms = 3, missionCode = 'MSN-001' }) {
  return (
    <div
      className="relative w-full aspect-square rounded-2xl overflow-hidden flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)', border: `1px solid ${color}25` }}
    >
      <HUDCorners color={color} size={10} />
      {/* Concentric rings */}
      {[0.85, 0.6, 0.35].map((scale, i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{ width: `${scale * 100}%`, height: `${scale * 100}%`, borderColor: `${color}20` }}
        />
      ))}
      {/* Sweep line */}
      <motion.div
        className="absolute inset-0 origin-center"
        style={{
          background: `conic-gradient(from 0deg, transparent 300deg, ${color}35 360deg)`,
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
      />
      {/* Center blip */}
      <motion.div
        className="w-3 h-3 rounded-full z-10"
        style={{ background: color, boxShadow: `0 0 14px ${color}` }}
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      {/* Room nodes */}
      {Array.from({ length: rooms }).map((_, idx) => {
        const angle = (idx / rooms) * 2 * Math.PI - Math.PI / 2;
        const r = 38;
        const x = 50 + r * Math.cos(angle);
        const y = 50 + r * Math.sin(angle);
        return (
          <div
            key={idx}
            className="absolute w-2 h-2 rounded-full border z-10"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
              borderColor: color,
              background: idx === 0 ? color : 'transparent',
            }}
          />
        );
      })}
      {/* Label */}
      <div className="absolute bottom-2.5 left-3 text-[9px] font-space tracking-widest" style={{ color: `${color}99` }}>
        LOC: {missionCode}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MISSION BRIEF PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function MissionBriefPage() {
  const {
    navigateTo,
    selectedStandardId, selectedStandard,
    selectedSubjectId, selectedSubject,
    selectedChapterId, selectedChapter,
    completedRooms, userProgressList, lives,
  } = useNavigation();

  const { isDark } = useTheme();

  // ── 1. Resolve Standard & Subject Context ───────────────────────────────────
  const resolvedStdId = selectedStandardId || 'grade-11';
  const resolvedSubjId = selectedSubjectId || 'chemistry';
  const stdDisplayName = selectedStandard || (resolvedStdId === 'grade-4' ? '4th Standard' : '11th Standard');
  const subjDisplayName = selectedSubject || (resolvedSubjId.charAt(0).toUpperCase() + resolvedSubjId.slice(1));

  // ── 2. Resolve Chapter & Chapters List ──────────────────────────────────────
  const chaptersList = useMemo(() => {
    return getChaptersForStandardAndSubject(resolvedStdId, resolvedSubjId);
  }, [resolvedStdId, resolvedSubjId]);

  const activeChapter = useMemo(() => {
    if (typeof selectedChapter === 'object' && selectedChapter?.title) {
      return selectedChapter;
    }
    if (selectedChapterId) {
      const found = chaptersList.find(c => c.id === selectedChapterId);
      if (found) return found;
    }
    return chaptersList[0] || null;
  }, [selectedChapter, selectedChapterId, chaptersList]);

  const chapterIndex = useMemo(() => {
    if (!activeChapter) return 0;
    const idx = chaptersList.findIndex(c => c.id === activeChapter.id);
    return idx >= 0 ? idx : 0;
  }, [chaptersList, activeChapter]);

  // ── 3. Check Lock / Unlock / Progress Status ────────────────────────────────
  const chapterStatus = useMemo(() => {
    if (!activeChapter) return { isUnlocked: false, status: 'LOCKED', isCompleted: false, progress: 0 };
    return getChapterStatus(activeChapter, chapterIndex, chaptersList, completedRooms, userProgressList);
  }, [activeChapter, chapterIndex, chaptersList, completedRooms, userProgressList]);

  // ── 4. Build Mission Configuration (Dynamic or Presets) ─────────────────────
  const mission = useMemo(() => {
    // Check if chemistry preset exists
    const chemKey = activeChapter?.id || `chap-${chapterIndex + 1}`;
    if (resolvedSubjId === 'chemistry' && CHEMISTRY_MISSIONS[chemKey]) {
      return {
        ...CHEMISTRY_MISSIONS[chemKey],
        chapterTitle: activeChapter?.title || CHEMISTRY_MISSIONS[chemKey].missionName,
        chapterNumber: activeChapter?.chapterNumber || chapterIndex + 1,
      };
    }

    // Generic dynamic mission generation for all other subjects/chapters
    const subjects = getSubjectsForStandard(resolvedStdId);
    const subjConfig = subjects.find(s => s.id === resolvedSubjId);
    const accent = subjConfig?.color || '#10B981';

    const chNum = activeChapter?.chapterNumber || chapterIndex + 1;
    const chTitle = activeChapter?.title || `Chapter ${chNum}`;
    const chDesc = activeChapter?.description || `Master key ${subjDisplayName} concepts in this interactive learning unit.`;

    return {
      missionCode: activeChapter?.missionCode || `MSN-${chNum.toString().padStart(2, '0')}`,
      missionName: chTitle,
      subtitle: `Master ${subjDisplayName} — Chapter ${chNum}`,
      accentColor: accent,
      glowColor: `${accent}40`,
      difficultyLabel: activeChapter?.difficulty || (chNum <= 2 ? 'Beginner' : chNum <= 4 ? 'Intermediate' : 'Advanced'),
      difficultyLevel: chNum <= 2 ? 1 : chNum <= 4 ? 2 : 3,
      timeEst: `${3 + chNum * 0.5}h`,
      xp: activeChapter?.xpReward || (400 + chNum * 50),
      coins: activeChapter?.coinsReward || (100 + chNum * 15),
      badgeName: `${subjDisplayName} Specialist`,
      badgeIcon: '🏅',
      badgeRarity: chNum <= 2 ? 'Common' : 'Uncommon',
      rooms: 3,
      classification: 'ALPHA',
      gameType: activeChapter?.gameType || `${subjDisplayName} Interactive Quest`,
      gameScreen: 'lab',
      topics: [
        `${chTitle} Core Concepts`,
        'Interactive Problem Solving & Analysis',
        'Practical Applications & Calculation',
        'Unit Mastery & Assessment',
      ],
      story: [
        `Welcome to ${chTitle}. This mission is designed to build foundational mastery in ${stdDisplayName} ${subjDisplayName}.`,
        `Complete each interactive problem systematically to unlock progression points and advance along your adventure map.`,
        `Every correct answer earns XP and contributes toward unlocking your subject mastery certificate.`,
      ],
      objectives: [
        { text: `Understand and apply key concepts of ${chTitle}`, done: false },
        { text: 'Solve the primary interactive unit challenges', done: false },
        { text: 'Score minimum 80% accuracy in the assessment stage', done: false },
        { text: 'Claim your chapter completion rewards and advance', done: false },
      ],
      tacticalNotes: `Focus on accuracy and review mistakes to maximize XP gains.`,
      threatLevel: 'Standard',
      threatColor: accent,
      chapterTitle: chTitle,
      chapterNumber: chNum,
    };
  }, [activeChapter, chapterIndex, resolvedSubjId, resolvedStdId, subjDisplayName, stdDisplayName]);

  // ── 5. Component State ───────────────────────────────────────────────────────
  const [phase, setPhase] = useState('brief'); // brief | ready
  const [launching, setLaunching] = useState(false);

  // ── 6. Game Launch Handler ──────────────────────────────────────────────────
  const handleLaunch = useCallback(async () => {
    // Block locked chapters
    if (!chapterStatus.isUnlocked) return;

    setLaunching(true);

    try {
      const { getGameEndpointByGameType } = await import('../games/gameRegistry');
      let targetScreen = 'calculation-heist';

      // Check explicit gameType
      const gameTypeKey = (mission.gameType || '').toUpperCase().replace(/[-\s]/g, '_');
      if (mission.gameScreen) {
        targetScreen = mission.gameScreen;
      } else if (gameTypeKey && getGameEndpointByGameType) {
        targetScreen = getGameEndpointByGameType(gameTypeKey);
      }

      // Specific fallbacks for Chemistry Units 1–6
      const cid = String(activeChapter?.id || '');
      const cTitle = String(activeChapter?.title || '');
      if (cid.includes('chap-2') || cid.includes('ch-2') || cTitle.includes('Atom')) targetScreen = 'quantum-architect';
      else if (cid.includes('chap-3') || cid.includes('ch-3') || cTitle.includes('Periodic')) targetScreen = 'grid-reconstruction';
      else if (cid.includes('chap-4') || cid.includes('ch-4') || cTitle.includes('Hydrogen')) targetScreen = 'hydrogen-reactor';
      else if (cid.includes('chap-5') || cid.includes('ch-5') || cTitle.includes('Metal') || cTitle.includes('s-Block')) targetScreen = 'metal-sorting';
      else if (cid.includes('chap-6') || cid.includes('ch-6') || cTitle.includes('Gas')) targetScreen = 'gas-simulator';
      else if (cid.includes('chap-1') || cid.includes('ch-1') || cTitle.includes('Mole') || cTitle.includes('Basic Concepts')) targetScreen = 'calculation-heist';

      setTimeout(() => {
        navigateTo(targetScreen);
      }, 1000);
    } catch {
      setTimeout(() => {
        navigateTo('calculation-heist');
      }, 1000);
    }
  }, [chapterStatus.isUnlocked, mission, activeChapter, navigateTo]);

  const color = mission.accentColor;
  const glow = mission.glowColor;
  const isLocked = !chapterStatus.isUnlocked;
  const isCompleted = chapterStatus.isCompleted;
  const isInProgress = chapterStatus.status === 'IN_PROGRESS';

  // ── Button Text & State ──────────────────────────────────────────────────────
  const actionButtonText = isLocked
    ? `Chapter Locked (Complete Chapter ${chapterIndex} First)`
    : isCompleted
      ? 'Replay Mission'
      : isInProgress
        ? 'Continue Mission'
        : 'Start Mission';

  return (
    <div className="relative min-h-screen bg-[#020609] text-white overflow-x-hidden flex flex-col pb-16">
      <ScanlineOverlay />

      {/* ── Launch Sequence Overlay ── */}
      <AnimatePresence>
        {launching && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: '#020609' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex flex-col items-center gap-6 text-center px-4"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="text-6xl"
                animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              >
                {mission.badgeIcon || '🚀'}
              </motion.div>
              <div>
                <motion.p
                  className="font-orbitron font-black text-2xl sm:text-3xl text-white mb-2"
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  INITIALIZING GAME ENGINE
                </motion.p>
                <p className="font-space text-sm sm:text-base" style={{ color }}>
                  {mission.missionName}
                </p>
              </div>
              <div className="w-64 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${color}, #10B981)` }}
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ambient Glows ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(0,0,0,0.8) 0%, transparent 70%)' }} />
        <motion.div
          className="absolute top-1/2 right-0 w-[500px] h-[500px] rounded-full -translate-y-1/2"
          style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>
      <div className="fixed inset-0 lab-grid opacity-15 pointer-events-none z-0" />

      {/* ── Top Navigation Bar ── */}
      <div
        className="relative z-20 flex items-center justify-between px-4 sm:px-10 py-5"
        style={{ borderBottom: `1px solid ${color}20` }}
      >
        <button
          type="button"
          onClick={() => navigateTo('chapters')}
          id="brief-back-btn"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white font-space text-xs sm:text-sm transition-colors group bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
          Back to Chapter Map
        </button>

        {/* Standard + Subject Breadcrumbs */}
        <div className="flex items-center gap-2">
          <span
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-space font-semibold"
            style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
          >
            <GraduationCap size={12} />
            {stdDisplayName} › {subjDisplayName}
          </span>
        </div>
      </div>

      {/* ── Main Briefing Layout ── */}
      <div className="relative z-10 flex-1 px-4 sm:px-10 py-6 max-w-6xl mx-auto w-full">

        {/* ── LOCKED STATE BANNER (if locked) ── */}
        {isLocked && (
          <motion.div
            className="mb-6 p-4 rounded-2xl flex items-center gap-3 border"
            style={{ background: 'rgba(245,158,11,0.10)', borderColor: 'rgba(245,158,11,0.30)', color: '#FBBF24' }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Lock size={18} className="flex-shrink-0" />
            <div className="text-xs sm:text-sm font-inter">
              <strong>Mission Locked:</strong> Complete Chapter {chapterIndex} in the learning journey to unlock this mission.
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ════ LEFT COLUMN (3/5) ════ */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* Mission Title Header */}
            <div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  className="px-3 py-1 rounded-lg text-[10px] font-orbitron font-bold tracking-widest uppercase"
                  style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
                >
                  CHAPTER {mission.chapterNumber} · {mission.missionCode}
                </span>

                {isCompleted && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-orbitron font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={11} />
                    COMPLETED
                  </span>
                )}
              </div>

              <h1 className="font-orbitron font-black text-2xl sm:text-4xl text-white leading-tight mb-2">
                <span style={{ color }}>{mission.missionName}</span>
              </h1>
              <p className="text-white/40 font-space text-sm sm:text-base italic">
                "{mission.subtitle}"
              </p>
            </div>

            {/* Intel Report / Story */}
            <div
              className="relative rounded-2xl p-6"
              style={{ background: 'rgba(0,0,0,0.45)', border: `1px solid ${color}20`, backdropFilter: 'blur(12px)' }}
            >
              <HUDCorners color={color} size={12} />
              <div className="flex items-center gap-2 mb-4">
                <Radio size={14} style={{ color }} />
                <span className="font-orbitron text-xs tracking-widest uppercase" style={{ color }}>
                  Mission Briefing & Intel
                </span>
              </div>

              <div className="space-y-3 text-white/70 text-xs sm:text-sm font-inter leading-relaxed">
                {mission.story.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              {mission.tacticalNotes && (
                <div
                  className="mt-4 p-3 rounded-xl flex items-start gap-2.5"
                  style={{ background: `${color}08`, border: `1px solid ${color}25` }}
                >
                  <AlertTriangle size={14} style={{ color, flexShrink: 0, marginTop: 2 }} />
                  <p className="text-xs font-inter leading-relaxed" style={{ color: `${color}ee` }}>
                    <strong>TACTICAL NOTE: </strong> {mission.tacticalNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Topics Covered */}
            {mission.topics && mission.topics.length > 0 && (
              <div
                className="relative rounded-2xl p-6"
                style={{ background: 'rgba(0,0,0,0.45)', border: `1px solid ${color}20`, backdropFilter: 'blur(12px)' }}
              >
                <HUDCorners color={color} size={12} />
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={14} style={{ color }} />
                  <span className="font-orbitron text-xs tracking-widest uppercase" style={{ color }}>
                    Topics Covered
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {mission.topics.map((topic, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl flex items-center gap-2 text-xs font-inter text-white/80"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mission Objectives */}
            <div
              className="relative rounded-2xl p-6"
              style={{ background: 'rgba(0,0,0,0.45)', border: `1px solid ${color}20`, backdropFilter: 'blur(12px)' }}
            >
              <HUDCorners color={color} size={12} />
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Target size={14} style={{ color }} />
                  <span className="font-orbitron text-xs tracking-widest uppercase" style={{ color }}>
                    Mission Objectives
                  </span>
                </div>
                <span className="text-xs font-space text-white/40">{mission.objectives.length} tasks</span>
              </div>

              <div className="space-y-3">
                {mission.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-orbitron font-bold"
                      style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <p className="text-xs sm:text-sm font-inter text-white/70 pt-0.5">{obj.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ════ RIGHT COLUMN (2/5) ════ */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Tactical Radar Display */}
            <RadarDisplay color={color} rooms={mission.rooms} missionCode={mission.missionCode} />

            {/* Mission Parameters */}
            <div
              className="relative rounded-2xl p-5"
              style={{ background: 'rgba(0,0,0,0.45)', border: `1px solid ${color}20`, backdropFilter: 'blur(12px)' }}
            >
              <HUDCorners color={color} size={10} />
              <p className="font-orbitron text-[10px] tracking-widest uppercase mb-4" style={{ color }}>
                MISSION PARAMETERS
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                  <Clock size={14} style={{ color, marginBottom: 4 }} />
                  <p className="font-orbitron font-bold text-sm text-white">{mission.timeEst}</p>
                  <p className="text-[10px] text-white/30 font-space">Duration</p>
                </div>

                <div className="p-3 rounded-xl" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                  <Shield size={14} style={{ color, marginBottom: 4 }} />
                  <p className="font-orbitron font-bold text-sm text-white">{mission.difficultyLabel}</p>
                  <p className="text-[10px] text-white/30 font-space">Difficulty</p>
                </div>

                <div className="p-3 rounded-xl" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                  <Heart size={14} className="text-rose-400 mb-1" />
                  <p className="font-orbitron font-bold text-sm text-white">{lives} / 3</p>
                  <p className="text-[10px] text-white/30 font-space">Lives Remaining</p>
                </div>

                <div className="p-3 rounded-xl" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                  <Map size={14} style={{ color, marginBottom: 4 }} />
                  <p className="font-orbitron font-bold text-sm text-white">{mission.rooms} Stages</p>
                  <p className="text-[10px] text-white/30 font-space">Room Count</p>
                </div>
              </div>
            </div>

            {/* Mission Rewards */}
            <div
              className="relative rounded-2xl p-5"
              style={{ background: 'rgba(0,0,0,0.45)', border: `1px solid ${color}20`, backdropFilter: 'blur(12px)' }}
            >
              <HUDCorners color={color} size={10} />
              <p className="font-orbitron text-[10px] tracking-widest uppercase mb-4" style={{ color }}>
                MISSION REWARDS
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl" style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
                  <Zap size={15} style={{ color }} />
                  <p className="font-orbitron font-black text-lg text-white mt-1">+{mission.xp}</p>
                  <p className="text-[10px] text-white/30 font-space">Experience XP</p>
                </div>

                <div className="p-3 rounded-xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <span className="text-base">🪙</span>
                  <p className="font-orbitron font-black text-lg text-amber-400 mt-1">+{mission.coins}</p>
                  <p className="text-[10px] text-white/30 font-space">Lab Coins</p>
                </div>
              </div>

              {/* Badge Preview */}
              <div
                className="p-3 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="text-2xl">{mission.badgeIcon || '🏅'}</div>
                <div>
                  <p className="font-orbitron font-bold text-xs text-white">{mission.badgeName}</p>
                  <p className="text-[10px] font-space text-white/30">{mission.badgeRarity || 'Common'} Badge</p>
                </div>
              </div>
            </div>

            {/* Launch Action Button */}
            <div>
              <motion.button
                id="start-mission-btn"
                onClick={handleLaunch}
                disabled={isLocked || launching}
                className={`w-full py-4.5 rounded-2xl font-orbitron font-black text-base tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all border-0 ${
                  isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
                style={{
                  background: isLocked
                    ? 'rgba(51,65,85,0.5)'
                    : `linear-gradient(135deg, ${color}, ${color}BB)`,
                  color: isLocked ? '#94A3B8' : '#050807',
                  boxShadow: isLocked ? 'none' : `0 0 30px ${glow}, 0 4px 20px rgba(0,0,0,0.4)`,
                }}
                whileHover={!isLocked ? { scale: 1.02 } : {}}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
              >
                {isLocked ? (
                  <>
                    <Lock size={16} />
                    <span>Mission Locked</span>
                  </>
                ) : isCompleted ? (
                  <>
                    <RotateCcw size={16} />
                    <span>Replay Mission</span>
                    <ChevronRight size={16} />
                  </>
                ) : (
                  <>
                    <Rocket size={16} />
                    <span>{actionButtonText}</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </motion.button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => navigateTo('chapters')}
                  className="text-xs font-space text-white/30 hover:text-white/60 bg-transparent border-0 cursor-pointer"
                >
                  Abort & Return to Chapter Map
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
