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
import { getMissionAvailability, AVAILABILITY_STATES } from '../config/gameAvailability';
import {
  ArrowLeft, Zap, Clock, Target, Shield, Star,
  ChevronRight, Rocket, AlertTriangle, CheckCircle,
  Crosshair, Radio, Map, Trophy, Sparkles, Play,
  FlaskConical, Lock, Award, SkipForward, RotateCcw,
  Heart, BookOpen, GraduationCap, CheckCircle2, X,
} from 'lucide-react';

// ─── Standard 11 Chemistry Mission Presets ───────────────────────────────────────
const CHEMISTRY_MISSIONS = {
  1: {
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
  2: {
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
  3: {
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
  4: {
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
      'Hydrogen Peroxide (H2O2) & Hydrogen Economy',
    ],
    story: [
      'An emergency at the clean-energy Hydrogen Substation requires manual isotopic calibration before reactor rods melt down.',
      'Balance isotope ratios of Protium and Deuterium, purify heavy water containment vats, and stabilize hydrogen storage tanks.',
    ],
    objectives: [
      { text: 'Separate and balance Hydrogen isotopes by atomic mass', done: false },
      { text: 'Configure ionic and covalent hydride fuel cells', done: false },
      { text: 'Analyze heavy water decomposition kinetics', done: false },
      { text: 'Complete thermal regulation cycle for Hydrogen economy fuel system', done: false },
    ],
    tacticalNotes: 'Deuterium contains one proton and one neutron. Heavy water D2O has higher boiling point.',
    threatLevel: 'High',
    threatColor: '#7c3aed',
  },
  5: {
    missionCode: 'MSN-0055',
    missionName: 'Element Sorting Factory',
    subtitle: 'Alkali and alkaline earth elements in motion',
    accentColor: '#f97316',
    glowColor: 'rgba(249,115,22,0.4)',
    difficultyLabel: 'Advanced',
    difficultyLevel: 3,
    timeEst: '5h',
    xp: 850,
    coins: 220,
    badgeName: 'Master Metallurgist',
    badgeIcon: '🔥',
    badgeRarity: 'Rare',
    rooms: 3,
    classification: 'EPSILON',
    gameType: 'METAL_SORTING',
    gameScreen: 'metal-sorting',
    topics: [
      'Group 1: Alkali Metals (Li, Na, K, Rb, Cs)',
      'Group 2: Alkaline Earth Metals (Be, Mg, Ca, Sr, Ba)',
      'Flame Test Colors & Reactivity with Water',
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
  6: {
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
    selectedRoomId, currentRoom,
    completedRooms, userProgressList, lives,
  } = useNavigation();

  const { isDark } = useTheme();

  // ── 1. Resolve Standard & Subject Context ───────────────────────────────────
  const resolvedStdId = selectedStandardId || 'grade-11';
  const resolvedSubjId = selectedSubjectId || 'chemistry';
  const stdDisplayName = selectedStandard || (resolvedStdId === 'grade-4' ? '4th Standard' : resolvedStdId === 'grade-5' ? '5th Standard' : '11th Standard');
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

  // ── 4. Authoritative Game Availability Check ────────────────────────────────
  const availability = useMemo(() => {
    return getMissionAvailability({
      standardId: resolvedStdId,
      subjectId: resolvedSubjId,
      chapter: activeChapter,
      room: typeof currentRoom === 'object' ? currentRoom : null,
    });
  }, [resolvedStdId, resolvedSubjId, activeChapter, currentRoom]);

  // ── 5. Build Mission Configuration Presentation ─────────────────────────────
  const isChemistry11 = (resolvedStdId === 'grade-11' || resolvedStdId === 'std-11') && (resolvedSubjId === 'chemistry' || resolvedSubjId === 'subj-chem');

  const mission = useMemo(() => {
    const chNum = activeChapter?.chapterNumber || chapterIndex + 1;

    // 1. Check if Standard 11 Chemistry preset exists
    if (isChemistry11 && CHEMISTRY_MISSIONS[chNum]) {
      const chemPreset = CHEMISTRY_MISSIONS[chNum];
      return {
        ...chemPreset,
        chapterTitle: activeChapter?.title || chemPreset.missionName,
        chapterNumber: chNum,
      };
    }

    // 2. Generic dynamic mission generation for all other subjects/chapters
    const subjects = getSubjectsForStandard(resolvedStdId);
    const subjConfig = subjects.find(s => s.id === resolvedSubjId);
    const accent = subjConfig?.color || '#10B981';

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
      gameScreen: availability.endpoint,
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
  }, [activeChapter, chapterIndex, isChemistry11, resolvedSubjId, resolvedStdId, subjDisplayName, stdDisplayName, availability.endpoint]);

  // ── 6. Component State ───────────────────────────────────────────────────────
  const [launching, setLaunching] = useState(false);
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);

  // ── 7. Game Launch Handler ──────────────────────────────────────────────────
  const handleLaunch = useCallback(() => {
    // Block locked chapters
    if (!chapterStatus.isUnlocked) return;

    // Strict Launch Check: Only proceed if game availability is AVAILABLE
    if (!availability.canLaunch || !availability.endpoint) {
      setComingSoonModalOpen(true);
      return;
    }

    setLaunching(true);
      navigateTo(availability.endpoint, {
        chapterId: activeChapter?.id,
        chapter: activeChapter,
      });
  }, [chapterStatus.isUnlocked, availability, navigateTo]);

  const color = mission.accentColor;
  const glow = mission.glowColor;
  const isLocked = !chapterStatus.isUnlocked;
  const isCompleted = chapterStatus.isCompleted;
  const isInProgress = chapterStatus.status === 'IN_PROGRESS';

  // ── 8. Button Text & State ──────────────────────────────────────────────────
  const actionButtonText = isLocked
    ? `Chapter Locked (Complete Chapter ${chapterIndex} First)`
    : !availability.canLaunch
      ? (availability.actionLabel || 'Coming Soon')
      : isCompleted
        ? 'Replay Mission'
        : isInProgress
          ? 'Continue Mission'
          : 'Start Mission';

  return (
    <div className="relative min-h-screen bg-[#020609] text-white overflow-x-hidden flex flex-col pb-16">
      <ScanlineOverlay />

      {/* ── Student-Friendly Coming Soon Modal ── */}
      <AnimatePresence>
        {comingSoonModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 overflow-hidden text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(8,14,24,0.98))',
                border: `1.5px solid ${color}40`,
                boxShadow: `0 0 50px ${color}25`,
              }}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <button
                type="button"
                onClick={() => setComingSoonModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer border-0"
              >
                <X size={18} />
              </button>

              <div
                className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 text-3xl"
                style={{ background: `${color}18`, border: `1px solid ${color}35` }}
              >
                🚀
              </div>

              <span
                className="inline-block px-3 py-1 rounded-full text-[10px] font-orbitron font-bold tracking-widest uppercase mb-3"
                style={{ background: `${color}18`, color }}
              >
                {availability.badgeText || 'COMING SOON'}
              </span>

              <h3 className="font-orbitron font-black text-xl sm:text-2xl text-white mb-2">
                {availability.title || 'Interactive Mission Coming Soon'}
              </h3>

              <p className="text-sm font-inter text-white/70 leading-relaxed mb-6">
                {availability.description || `This chapter content is ready, but its unique game experience for ${stdDisplayName} ${subjDisplayName} is still being prepared.`}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setComingSoonModalOpen(false);
                    navigateTo('chapters');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer border-0 transition-transform active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
                >
                  <ArrowLeft size={14} />
                  <span>Back to Chapters</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setComingSoonModalOpen(false);
                    navigateTo('select-subject');
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-orbitron font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 text-slate-950 cursor-pointer border-0 transition-transform active:scale-95"
                  style={{ background: `linear-gradient(135deg, ${color}, ${color}CC)` }}
                >
                  <Sparkles size={14} />
                  <span>Explore Other Subjects</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Launch Sequence Overlay (Only when launching a real game) ── */}
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
          style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`, filter: 'blur(80px)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── TOP NAV BAR ── */}
      <header className="relative z-20 border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between backdrop-blur-md bg-black/30">
        <button
          type="button"
          onClick={() => navigateTo('chapters')}
          className="flex items-center gap-2 text-xs font-space font-medium text-white/70 hover:text-white bg-transparent border-0 cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Chapter Map</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-orbitron font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
            {stdDisplayName} • {subjDisplayName}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-space">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Heart size={13} className="fill-rose-400" />
            <span>{lives} / 3 Lives</span>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* ════ LEFT COLUMN (3/5) ════ */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* Mission Classification Header */}
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span
                  className="text-[10px] font-orbitron font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-md"
                  style={{ background: `${color}18`, color, border: `1px solid ${color}35` }}
                >
                  CLASSIFICATION: {mission.classification || 'ALPHA'}
                </span>
                <span className="text-[10px] font-space text-white/40 tracking-wider">
                  MISSION CODE: {mission.missionCode}
                </span>
              </div>

              <h1 className="font-orbitron font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight">
                {mission.missionName}
              </h1>

              <p className="font-space text-sm sm:text-base mt-1" style={{ color: `${color}dd` }}>
                "{mission.subtitle}"
              </p>
            </div>

            {/* Student-Friendly Availability Banner */}
            {!availability.canLaunch && (
              <div
                className="rounded-2xl p-5 border flex items-start gap-3.5"
                style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(12,20,17,0.85))',
                  borderColor: 'rgba(251,191,36,0.25)',
                }}
              >
                <Sparkles size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-orbitron font-bold text-xs sm:text-sm text-amber-400 mb-1">
                    {availability.title || 'Interactive Mission Coming Soon'}
                  </h4>
                  <p className="text-xs font-inter text-white/80 leading-relaxed mb-3">
                    {availability.description || `This chapter content is ready, but its unique game experience for ${stdDisplayName} ${subjDisplayName} is still being prepared.`}
                  </p>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => navigateTo('chapters')}
                      className="px-3 py-1.5 rounded-lg text-xs font-space font-semibold bg-white/10 hover:bg-white/20 text-white cursor-pointer border-0 transition-colors"
                    >
                      ← Back to Chapters
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('select-subject')}
                      className="px-3 py-1.5 rounded-lg text-xs font-space font-semibold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 cursor-pointer border border-emerald-500/30 transition-colors"
                    >
                      Explore Other Subjects
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                  <p className="text-[10px] text-white/30 font-space">Coins</p>
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
                disabled={isLocked || launching || !availability.canLaunch}
                className={`w-full py-4.5 rounded-2xl font-orbitron font-black text-base tracking-wider uppercase flex items-center justify-center gap-2.5 transition-all border-0 ${
                  isLocked || !availability.canLaunch ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                }`}
                style={{
                  background: isLocked
                    ? 'rgba(51,65,85,0.5)'
                    : !availability.canLaunch
                      ? 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(217,119,6,0.35))'
                      : `linear-gradient(135deg, ${color}, ${color}BB)`,
                  color: isLocked ? '#94A3B8' : !availability.canLaunch ? '#FBBF24' : '#050807',
                  border: !availability.canLaunch && !isLocked ? '1px solid rgba(245,158,11,0.4)' : 'none',
                  boxShadow: isLocked || !availability.canLaunch ? 'none' : `0 0 30px ${glow}, 0 4px 20px rgba(0,0,0,0.4)`,
                }}
                whileHover={availability.canLaunch && !isLocked ? { scale: 1.02 } : {}}
                whileTap={availability.canLaunch && !isLocked ? { scale: 0.98 } : {}}
              >
                {isLocked ? (
                  <>
                    <Lock size={16} />
                    <span>Mission Locked</span>
                  </>
                ) : !availability.canLaunch ? (
                  <>
                    <Sparkles size={16} className="text-amber-400" />
                    <span>{actionButtonText}</span>
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
