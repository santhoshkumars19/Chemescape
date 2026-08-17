const BaseGameEngine = require('./baseGameEngine');

class GridReconstructionEngine extends BaseGameEngine {
  constructor() {
    super('GRID_RECONSTRUCTION', 5);
  }

  getStageVariants() {
    return {
      stage1: [
        {
          id: 'g1_v1',
          title: 'Atomic Number Scanner',
          targetElement: 'Sodium',
          symbol: 'Na',
          expectedZ: 11,
          options: [11, 12, 19, 3],
          clue: 'Group 1, Period 3 alkali metal with 11 protons.',
          hint: 'Atomic number Z equals the number of protons (11).',
          explanation: 'Sodium has Z=11.',
        },
        {
          id: 'g1_v2',
          title: 'Atomic Number Scanner',
          targetElement: 'Oxygen',
          symbol: 'O',
          expectedZ: 8,
          options: [8, 6, 16, 7],
          clue: 'Group 16, Period 2 chalcogen with 8 protons.',
          hint: 'Atomic number Z equals 8.',
          explanation: 'Oxygen has Z=8.',
        },
      ],
      stage2: [
        {
          id: 'g2_v1',
          title: 'Periodic Grid Repair',
          missingElements: ['Li', 'C', 'F'],
          availableTiles: ['Li', 'C', 'F'],
          gridTarget: {
            Li: { group: 1, period: 2 },
            C: { group: 14, period: 2 },
            F: { group: 17, period: 2 },
          },
          hint: 'Li is Group 1, C is Group 14, F is Group 17.',
          explanation: 'Tiles placed in correct positions.',
        },
      ],
      stage3: [
        {
          id: 'g3_v1',
          title: 'Group & Period Mapping',
          targetElement: 'Chlorine (Cl)',
          correctMapping: { group: 17, period: 3, block: 'p' },
          hint: 'Chlorine is a Halogen (Group 17, Period 3, p-block).',
          explanation: 'Chlorine is in Group 17, Period 3, p-block.',
        },
      ],
      stage4: [
        {
          id: 'g4_v1',
          title: 'Periodic Trend Challenge',
          trendQuestion: 'Which element has the LARGER atomic radius?',
          pair: ['Sodium (Na)', 'Chlorine (Cl)'],
          correctElement: 'Sodium (Na)',
          hint: 'Atomic radius decreases across a period from left to right.',
          explanation: 'Sodium has a larger radius than Chlorine.',
        },
        {
          id: 'g4_v2',
          title: 'Periodic Trend Challenge',
          trendQuestion: 'Which element has HIGHER electronegativity?',
          pair: ['Fluorine (F)', 'Lithium (Li)'],
          correctElement: 'Fluorine (F)',
          hint: 'Electronegativity increases across a period to Fluorine.',
          explanation: 'Fluorine is the most electronegative element.',
        },
      ],
      stage5: [
        {
          id: 'g5_v1',
          title: 'Master Periodic Table Restoration',
          alkaliElements: ['Li', 'Na', 'K'],
          electroSeries: ['F', 'O', 'N', 'C'],
          hint: 'Group 1 alkali metals: Li, Na, K. Electronegativity order: F > O > N > C.',
          explanation: 'Periodic Grid fully restored!',
        },
      ],
    };
  }

  generateSessionConfig() {
    const variants = this.getStageVariants();
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

    return {
      currentStage: 1,
      totalStages: 5,
      score: 0,
      livesRemaining: 3,
      hintsUsed: 0,
      stages: [
        { stageNumber: 1, ...getRandom(variants.stage1) },
        { stageNumber: 2, ...getRandom(variants.stage2) },
        { stageNumber: 3, ...getRandom(variants.stage3) },
        { stageNumber: 4, ...getRandom(variants.stage4) },
        { stageNumber: 5, ...getRandom(variants.stage5) },
      ],
    };
  }

  sanitizeConfigForClient(sessionState) {
    if (!sessionState) return null;
    const { stages, ...clientState } = sessionState;

    const sanitizedStages = (stages || []).map((s) => {
      const { expectedZ, gridTarget, correctMapping, correctElement, alkaliElements, electroSeries, ...publicData } = s;
      return publicData;
    });

    return {
      ...clientState,
      stages: sanitizedStages,
    };
  }

  validateStageSubmission(sessionState, stageNumber, userSubmission) {
    const targetStageIndex = stageNumber - 1;
    const stageData = sessionState.stages[targetStageIndex];

    if (!stageData) {
      return this.formatRejectionResponse('Invalid stage number', sessionState.livesRemaining);
    }

    let isCorrect = false;

    if (stageNumber === 1) {
      isCorrect = this.answerValidator.validateNumeric(userSubmission.z || userSubmission.answer, stageData.expectedZ, 0);
    } else if (stageNumber === 2) {
      isCorrect = this.answerValidator.validatePlacements(userSubmission.placements || userSubmission, stageData.gridTarget);
    } else if (stageNumber === 3) {
      const map = userSubmission.mapping || userSubmission;
      isCorrect =
        parseInt(map.group, 10) === stageData.correctMapping.group &&
        parseInt(map.period, 10) === stageData.correctMapping.period &&
        this.answerValidator.validateText(map.block, stageData.correctMapping.block);
    } else if (stageNumber === 4) {
      const choice = userSubmission.choice || userSubmission.answer || userSubmission;
      isCorrect = this.answerValidator.validateText(choice, stageData.correctElement);
    } else if (stageNumber === 5) {
      const alkaliOk = this.answerValidator.validateOrdering(userSubmission.alkali, stageData.alkaliElements);
      const electroOk = this.answerValidator.validateOrdering(userSubmission.electronegativity, stageData.electroSeries);
      isCorrect = alkaliOk && electroOk;
    }

    if (isCorrect) {
      sessionState.score += this.rewardValidator.calculateStageScore(250, sessionState.livesRemaining);
      sessionState.currentStage = Math.min(6, stageNumber + 1);

      return this.formatStageResponse({
        correct: true,
        stageCompleted: true,
        nextStage: sessionState.currentStage,
        score: sessionState.score,
        livesRemaining: sessionState.livesRemaining,
        feedback: stageData.explanation,
        sanitizedState: this.sanitizeConfigForClient(sessionState),
      });
    } else {
      sessionState.livesRemaining = Math.max(0, sessionState.livesRemaining - 1);
      const failed = sessionState.livesRemaining <= 0;

      return this.formatStageResponse({
        correct: false,
        stageCompleted: false,
        nextStage: sessionState.currentStage,
        score: sessionState.score,
        lifeLost: true,
        livesRemaining: sessionState.livesRemaining,
        failed,
        feedback: stageData.explanation || 'Incorrect grid placement or trend selection! Life lost.',
        sanitizedState: this.sanitizeConfigForClient(sessionState),
      });
    }
  }

  calculateStars(score, livesRemaining, timeSpentSec) {
    return this.rewardValidator.calculateStars(score, livesRemaining, timeSpentSec, 1100);
  }
}

module.exports = new GridReconstructionEngine();
