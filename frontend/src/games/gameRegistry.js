/**
 * gameRegistry.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Game Registry for EduNova.
 * 
 * Maps game types to their respective frontend components and endpoints.
 * Supports registering new unique subject engines without hardcoding subject logic.
 */

import CalculationHeistPage from '../pages/CalculationHeistPage';
import QuantumArchitectPage from '../pages/QuantumArchitectPage';
import GridReconstructionPage from '../pages/GridReconstructionPage';
import HydrogenReactorPage from '../pages/HydrogenReactorPage';
import MetalSortingPage from '../pages/MetalSortingPage';
import GasSimulatorPage from '../pages/GasSimulatorPage';
import InteractiveQuizEngine from '../pages/InteractiveQuizEngine';

export const GAME_REGISTRY = {
  // ── Standard 11 Chemistry Units 1–6 (Specialized Engines) ──
  CALCULATION_HEIST: {
    gameType: 'CALCULATION_HEIST',
    name: 'Chem Calculation Heist',
    component: CalculationHeistPage,
    endpoint: 'calculation-heist',
    standard: 'grade-11',
    subject: 'chemistry',
  },
  QUANTUM_ARCHITECT: {
    gameType: 'QUANTUM_ARCHITECT',
    name: 'Quantum Orbital Architect',
    component: QuantumArchitectPage,
    endpoint: 'quantum-architect',
    standard: 'grade-11',
    subject: 'chemistry',
  },
  GRID_RECONSTRUCTION: {
    gameType: 'GRID_RECONSTRUCTION',
    name: 'Periodic Grid Reconstruction',
    component: GridReconstructionPage,
    endpoint: 'grid-reconstruction',
    standard: 'grade-11',
    subject: 'chemistry',
  },
  HYDROGEN_REACTOR: {
    gameType: 'HYDROGEN_REACTOR',
    name: 'Hydrogen Reactor Terminal',
    component: HydrogenReactorPage,
    endpoint: 'hydrogen-reactor',
    standard: 'grade-11',
    subject: 'chemistry',
  },
  METAL_SORTING: {
    gameType: 'METAL_SORTING',
    name: 'Element Sorting Factory',
    component: MetalSortingPage,
    endpoint: 'metal-sorting',
    standard: 'grade-11',
    subject: 'chemistry',
  },
  GAS_SIMULATOR: {
    gameType: 'GAS_SIMULATOR',
    name: 'Gas Chamber Simulator',
    component: GasSimulatorPage,
    endpoint: 'gas-simulator',
    standard: 'grade-11',
    subject: 'chemistry',
  },

  // ── Generic Interactive Chapter Quiz Engine ──
  GENERIC_QUIZ: {
    gameType: 'GENERIC_QUIZ',
    name: 'Interactive Chapter Quiz',
    component: InteractiveQuizEngine,
    endpoint: 'interactive-quiz',
    standard: null,
    subject: null,
  },
};

/**
 * Register a new game engine in the registry
 * 
 * @param {string} gameType - Unique game identifier (e.g. 'TAMIL_WORD_VAULT')
 * @param {Object} config - { name, component, endpoint, standard, subject }
 */
export function registerGame(gameType, config) {
  if (!gameType || !config) return;
  const key = String(gameType).toUpperCase().replace(/[-\s]/g, '_');
  GAME_REGISTRY[key] = {
    gameType: key,
    name: config.name || key,
    component: config.component,
    endpoint: config.endpoint,
    standard: config.standard || null,
    subject: config.subject || null,
  };
}

/**
 * Checks if a game type is registered in the frontend registry
 */
export function isGameTypeSupported(gameType) {
  if (!gameType) return false;
  const key = String(gameType).toUpperCase().replace(/[-\s]/g, '_');
  return Boolean(GAME_REGISTRY[key]);
}

/**
 * Resolves the game engine matching a game type, standard, and subject
 */
export function resolveGameEngine(gameType, standardId = null, subjectId = null) {
  if (!gameType) return null;
  const key = String(gameType).toUpperCase().replace(/[-\s]/g, '_');
  const matched = GAME_REGISTRY[key];
  if (!matched) return null;

  // If game is constrained to a specific subject, verify it matches
  if (matched.subject && subjectId) {
    const cleanSubj = String(subjectId).toLowerCase().replace(/^subj-/, '').trim();
    const matchedSubj = String(matched.subject).toLowerCase().replace(/^subj-/, '').trim();
    if (cleanSubj !== matchedSubj) {
      return null; // Reject cross-subject mismatch
    }
  }

  // If game is constrained to a specific standard, verify it matches
  if (matched.standard && standardId) {
    const cleanStd = String(standardId).toLowerCase().replace(/[^0-9]/g, '');
    const matchedStd = String(matched.standard).toLowerCase().replace(/[^0-9]/g, '');
    if (cleanStd && matchedStd && cleanStd !== matchedStd) {
      return null; // Reject cross-standard mismatch
    }
  }

  return matched;
}

/**
 * Get game component by gameType
 */
export function getGameComponentByGameType(gameType, standardId = null, subjectId = null) {
  const engine = resolveGameEngine(gameType, standardId, subjectId);
  return engine ? engine.component : null;
}

/**
 * Get game endpoint by gameType
 */
export function getGameEndpointByGameType(gameType, standardId = null, subjectId = null) {
  const engine = resolveGameEngine(gameType, standardId, subjectId);
  return engine ? engine.endpoint : null;
}

export default GAME_REGISTRY;
