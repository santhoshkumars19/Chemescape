const BaseGameEngine = require('./baseGameEngine');

class MetalSortingEngine extends BaseGameEngine {
  constructor() {
    super('METAL_SORTING', 5);
  }

  getStageVariants() {
    return {
      stage1: [
        {
          id: 'm1_v1',
          title: 'Unknown Metal Identification',
          clues: { group: 1, period: 3, flameTest: 'Yellow', reactivity: 'Vigorous with water' },
          expectedSymbol: 'Na',
          hint: 'Group 1, Period 3 alkali metal that burns yellow is Sodium (Na).',
          explanation: 'Sodium (Na) identified.',
        },
        {
          id: 'm1_v2',
          title: 'Unknown Metal Identification',
          clues: { group: 2, period: 4, flameTest: 'Brick Red', reactivity: 'Moderate with water' },
          expectedSymbol: 'Ca',
          hint: 'Group 2, Period 4 alkaline earth metal that burns brick red is Calcium (Ca).',
          explanation: 'Calcium (Ca) identified.',
        },
      ],
      stage2: [
        {
          id: 'm2_v1',
          title: 'Group Classification Line',
          samples: ['Li', 'Na', 'Mg', 'Ca'],
          expectedLine: { Li: 1, Na: 1, Mg: 2, Ca: 2 },
          hint: 'Group 1: Li, Na. Group 2: Mg, Ca.',
          explanation: 'Metals routed to correct conveyor belts.',
        },
      ],
      stage3: [
        {
          id: 'm3_v1',
          title: 'Flame Test Analyzer',
          flameColors: { Li: 'Crimson Red', Na: 'Yellow', K: 'Lilac', Ca: 'Brick Red', Ba: 'Apple Green' },
          hint: 'Li=Crimson, Na=Yellow, K=Lilac, Ca=Brick Red, Ba=Apple Green.',
          explanation: 'Spectra verified!',
        },
      ],
      stage4: [
        {
          id: 'm4_v1',
          title: 'Reactivity Sorting Conveyor',
          metals: ['Na', 'K', 'Mg'],
          expectedReactivity: { K: 'Very High', Na: 'High', Mg: 'Low' },
          hint: 'Reactivity increases down Group 1. K > Na > Mg.',
          explanation: 'Reactivity ordering verified.',
        },
      ],
      stage5: [
        {
          id: 'm5_v1',
          title: 'Master Metal Sorting Dispatch',
          targetAllocations: { Na: 'GROUP_1', Ca: 'GROUP_2', K: 'GROUP_1', Ba: 'GROUP_2' },
          hint: 'Dispatch alkali metals to Line 1 and alkaline earth metals to Line 2.',
          explanation: 'Element Sorting Factory fully restored!',
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
      const { expectedSymbol, expectedLine, flameColors, expectedReactivity, targetAllocations, ...publicData } = s;
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
      const sym = userSubmission.symbol || userSubmission.answer || userSubmission;
      isCorrect = this.answerValidator.validateFormula(sym, stageData.expectedSymbol);
    } else if (stageNumber === 2) {
      const grpMap = userSubmission.groupSorting || userSubmission;
      isCorrect = this.answerValidator.validateMatching(grpMap, stageData.expectedLine);
    } else if (stageNumber === 3) {
      const flameMap = userSubmission.flameMatches || userSubmission;
      isCorrect = this.answerValidator.validateMatching(flameMap, stageData.flameColors);
    } else if (stageNumber === 4) {
      const reactMap = userSubmission.reactivityMap || userSubmission;
      isCorrect = this.answerValidator.validateMatching(reactMap, stageData.expectedReactivity);
    } else if (stageNumber === 5) {
      if (Array.isArray(userSubmission.allocations)) {
        isCorrect = stageData.targetAllocations && userSubmission.allocations.every((item) => {
          return stageData.targetAllocations[item.sample] === item.targetLine;
        });
      } else {
        isCorrect = this.answerValidator.validateMatching(userSubmission.allocations || userSubmission, stageData.targetAllocations);
      }
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
        feedback: stageData.explanation || 'Factory sorting error! Life lost.',
        sanitizedState: this.sanitizeConfigForClient(sessionState),
      });
    }
  }

  calculateStars(score, livesRemaining, timeSpentSec) {
    return this.rewardValidator.calculateStars(score, livesRemaining, timeSpentSec, 1100);
  }
}

module.exports = new MetalSortingEngine();
