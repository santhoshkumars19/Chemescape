/**
 * gameAvailability.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Game Availability and Curriculum Validation System for EduNova.
 * 
 * Strict Single Source of Truth for:
 * 1. Availability states: AVAILABLE, COMING_SOON, NOT_CONFIGURED, UNSUPPORTED, INVALID_CONFIGURATION, ERROR
 * 2. Hierarchy validation: Standard -> Subject -> Chapter -> Room -> GameType
 * 3. Cross-subject anti-leakage guards
 */

import { GAME_REGISTRY, resolveGameEngine } from '../games/gameRegistry';

export const AVAILABILITY_STATES = {
  AVAILABLE: 'AVAILABLE',
  COMING_SOON: 'COMING_SOON',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  UNSUPPORTED: 'UNSUPPORTED',
  INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
  ERROR: 'ERROR',
};

/**
 * Normalize curriculum ID strings for robust comparison
 * e.g. 'grade-11', 'std-11', 11 -> '11'
 */
export function normalizeStandardId(stdId) {
  if (!stdId) return '';
  return String(stdId).toLowerCase().replace(/[^0-9]/g, '');
}

/**
 * Normalize subject ID strings
 * e.g. 'subj-chem', 'chemistry', 'chem' -> 'chemistry'
 */
export function normalizeSubjectId(subjId) {
  if (!subjId) return '';
  const s = String(subjId).toLowerCase().replace(/^subj-/, '').trim();
  if (s === 'chem') return 'chemistry';
  if (s === 'math' || s === 'maths') return 'mathematics';
  if (s === 'soc' || s === 'social') return 'social-science';
  if (s === 'sci') return 'science';
  if (s === 'tam') return 'tamil';
  if (s === 'eng') return 'english';
  if (s === 'phy') return 'physics';
  if (s === 'bio') return 'biology';
  return s;
}

/**
 * Evaluates the full curriculum hierarchy and returns the authoritative availability state
 * 
 * @param {Object} context
 * @param {string} context.standardId - Active selected standard (e.g. 'grade-5', 'grade-11')
 * @param {string} context.subjectId - Active selected subject (e.g. 'tamil', 'chemistry')
 * @param {Object} context.chapter - Active selected chapter object
 * @param {Object} [context.room] - Active room object (optional)
 * 
 * @returns {Object} Availability descriptor
 */
export function getMissionAvailability({ standardId, subjectId, chapter, room = null }) {
  const normStd = normalizeStandardId(standardId);
  const normSubj = normalizeSubjectId(subjectId);

  // 1. Validate Basic Context
  if (!standardId || !subjectId || !chapter) {
    return {
      status: AVAILABILITY_STATES.NOT_CONFIGURED,
      isPlayable: false,
      canLaunch: false,
      gameType: null,
      endpoint: null,
      component: null,
      title: 'Mission configuration is incomplete.',
      description: 'Select a standard, subject, and chapter to view the mission brief.',
      actionLabel: 'Select Chapter',
      badgeText: 'INCOMPLETE CONFIG',
    };
  }

  // 2. Validate Hierarchy Relationships
  if (chapter.standardId) {
    const chNormStd = normalizeStandardId(chapter.standardId);
    if (chNormStd && normStd && chNormStd !== normStd) {
      return {
        status: AVAILABILITY_STATES.INVALID_CONFIGURATION,
        isPlayable: false,
        canLaunch: false,
        gameType: null,
        endpoint: null,
        component: null,
        title: 'Curriculum Hierarchy Mismatch',
        description: 'Selected chapter does not match the active standard selection.',
        actionLabel: 'Configuration Mismatch',
        badgeText: 'INVALID CONTEXT',
      };
    }
  }

  if (chapter.subjectId) {
    const chNormSubj = normalizeSubjectId(chapter.subjectId);
    if (chNormSubj && normSubj && chNormSubj !== normSubj) {
      return {
        status: AVAILABILITY_STATES.INVALID_CONFIGURATION,
        isPlayable: false,
        canLaunch: false,
        gameType: null,
        endpoint: null,
        component: null,
        title: 'Subject Hierarchy Mismatch',
        description: 'Selected chapter does not belong to the active subject.',
        actionLabel: 'Configuration Mismatch',
        badgeText: 'INVALID CONTEXT',
      };
    }
  }

  if (room && room.chapterId && chapter.id) {
    if (room.chapterId !== chapter.id) {
      return {
        status: AVAILABILITY_STATES.INVALID_CONFIGURATION,
        isPlayable: false,
        canLaunch: false,
        gameType: null,
        endpoint: null,
        component: null,
        title: 'Room Hierarchy Mismatch',
        description: 'Selected room does not belong to the active chapter.',
        actionLabel: 'Configuration Mismatch',
        badgeText: 'INVALID CONTEXT',
      };
    }
  }

  // 3. Authoritative Standard 11 Chemistry Units 1–6 (Specialized Engines)
  const isChemistry11 = normStd === '11' && normSubj === 'chemistry';

  if (isChemistry11) {
    const chNum = Number(chapter.chapterNumber) || 1;
    const CHEM_GAMES = {
      1: { type: 'CALCULATION_HEIST', endpoint: 'calculation-heist', name: 'Chem Calculation Heist' },
      2: { type: 'QUANTUM_ARCHITECT', endpoint: 'quantum-architect', name: 'Quantum Orbital Architect' },
      3: { type: 'GRID_RECONSTRUCTION', endpoint: 'grid-reconstruction', name: 'Periodic Grid Reconstruction' },
      4: { type: 'HYDROGEN_REACTOR', endpoint: 'hydrogen-reactor', name: 'Hydrogen Reactor Terminal' },
      5: { type: 'METAL_SORTING', endpoint: 'metal-sorting', name: 'Element Sorting Factory' },
      6: { type: 'GAS_SIMULATOR', endpoint: 'gas-simulator', name: 'Gas Chamber Simulator' },
    };

    const chemGame = CHEM_GAMES[chNum];
    if (chemGame) {
      return {
        status: AVAILABILITY_STATES.AVAILABLE,
        isPlayable: true,
        canLaunch: true,
        gameType: chemGame.type,
        endpoint: chemGame.endpoint,
        component: GAME_REGISTRY[chemGame.type]?.component || null,
        title: 'Mission Ready',
        description: `Launch ${chemGame.name} for Chapter ${chNum}.`,
        actionLabel: 'Start Mission',
        badgeText: 'MISSION READY',
      };
    }
  }

  // 4. Inspect Declared Specialized Game Type from Room or Chapter
  const declaredGameType = room?.gameType || chapter?.gameType;
  if (declaredGameType) {
    const resolved = resolveGameEngine(declaredGameType, standardId, subjectId);
    if (resolved && resolved.endpoint && resolved.component) {
      return {
        status: AVAILABILITY_STATES.AVAILABLE,
        isPlayable: true,
        canLaunch: true,
        gameType: resolved.gameType,
        endpoint: resolved.endpoint,
        component: resolved.component,
        title: 'Mission Ready',
        description: `Launch ${resolved.name || 'interactive mission'}.`,
        actionLabel: 'Start Mission',
        badgeText: 'MISSION READY',
      };
    }
  }

  // 5. Generic Interactive Chapter Quiz Engine for All Other Chapters & Subjects
  const quizEngine = GAME_REGISTRY.GENERIC_QUIZ;
  return {
    status: AVAILABILITY_STATES.AVAILABLE,
    isPlayable: true,
    canLaunch: true,
    gameType: 'GENERIC_QUIZ',
    endpoint: quizEngine?.endpoint || 'interactive-quiz',
    component: quizEngine?.component || null,
    title: 'Mission Ready',
    description: 'Launch the interactive 10-question chapter quiz.',
    actionLabel: 'Start Mission',
    badgeText: 'MISSION READY',
  };
}

export default {
  AVAILABILITY_STATES,
  getMissionAvailability,
  normalizeStandardId,
  normalizeSubjectId,
};
