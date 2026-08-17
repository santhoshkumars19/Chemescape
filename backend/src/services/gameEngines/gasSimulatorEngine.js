const BaseGameEngine = require('./baseGameEngine');

class GasSimulatorEngine extends BaseGameEngine {
  constructor() {
    super('GAS_SIMULATOR', 5);
  }

  getStageVariants() {
    return {
      stage1: [
        {
          id: 'gas_s1_v1',
          title: 'Particle Kinetic Scanner',
          law: 'Kinetic Molecular Theory',
          targetProperty: 'Temperature',
          given: { volume: '10 L', pressure: '1.0 atm', moles: '0.5 mol' },
          expectedValue: 244,
          tolerancePct: 0.05,
          hint: 'Using Ideal Gas Law T = (P * V) / (n * R) where R = 0.0821 L*atm/(mol*K).',
          explanation: 'T = (1.0 * 10) / (0.5 * 0.0821) = 243.6 K (~244 K).',
        },
      ],
      stage2: [
        {
          id: 'gas_s2_v1',
          title: "Boyle's Law Pressure Chamber",
          law: "Boyle's Law (P1V1 = P2V2)",
          initialP: 1.0,
          initialV: 20.0,
          targetV: 5.0,
          expectedP: 4.0,
          tolerancePct: 0.05,
          hint: 'Compressing volume from 20L to 5L (4x decrease) increases pressure 4x.',
          explanation: 'P2 = (P1 * V1) / V2 = (1.0 * 20) / 5 = 4.0 atm.',
        },
      ],
      stage3: [
        {
          id: 'gas_s3_v1',
          title: "Charles's Law Thermal Expansion",
          law: "Charles's Law (V1/T1 = V2/T2)",
          initialV: 4.0,
          initialT: 300,
          targetT: 450,
          expectedV: 6.0,
          tolerancePct: 0.05,
          hint: 'Heating gas from 300K to 450K (1.5x increase) expands volume 1.5x.',
          explanation: 'V2 = (V1 * T2) / T1 = (4.0 * 450) / 300 = 6.0 L.',
        },
      ],
      stage4: [
        {
          id: 'gas_s4_v1',
          title: 'Combined Gas Law Reactor',
          law: 'Combined Gas Law (P1V1/T1 = P2V2/T2)',
          p1: 1.0,
          v1: 10.0,
          t1: 300,
          p2: 2.0,
          t2: 600,
          expectedV: 10.0,
          tolerancePct: 0.05,
          hint: 'V2 = (P1 * V1 * T2) / (P2 * T1) = (1 * 10 * 600) / (2 * 300) = 10 L.',
          explanation: 'V2 = (1.0 * 10 * 600) / (2.0 * 300) = 10.0 L.',
        },
      ],
      stage5: [
        {
          id: 'gas_s5_v1',
          title: 'Ideal Gas Master Stabilization',
          targetState: { pressure: 2.0, volume: 10.0, temp: 300 },
          hint: 'Adjust P to 2.0 atm, V to 10.0 L, and T to 300 K for complete chamber equilibrium.',
          explanation: 'Chamber stabilized under ideal gas equilibrium state!',
        },
      ],
    };
  }

  generateSessionConfig() {
    const variants = this.getStageVariants();
    return {
      currentStage: 1,
      totalStages: 5,
      score: 0,
      livesRemaining: 3,
      hintsUsed: 0,
      stages: [
        { stageNumber: 1, ...variants.stage1[0] },
        { stageNumber: 2, ...variants.stage2[0] },
        { stageNumber: 3, ...variants.stage3[0] },
        { stageNumber: 4, ...variants.stage4[0] },
        { stageNumber: 5, ...variants.stage5[0] },
      ],
    };
  }

  sanitizeConfigForClient(sessionState) {
    if (!sessionState) return null;
    const { stages, ...clientState } = sessionState;

    const sanitizedStages = (stages || []).map((s) => {
      const { expectedValue, expectedP, expectedV, ...publicStageData } = s;
      return publicStageData;
    });

    return {
      ...clientState,
      stages: sanitizedStages,
    };
  }

  validateStageSubmission(sessionState, stageNumber, userSubmission) {
    const targetStageIndex = stageNumber - 1;
    const stageData = sessionState.stages[targetStageIndex];
    if (!stageData) return this.formatRejectionResponse('Invalid stage number', sessionState.livesRemaining);

    let isCorrect = false;

    if (stageNumber === 1) {
      isCorrect = this.answerValidator.validateSimulationState(userSubmission.value || userSubmission.answer, stageData.expectedValue, stageData.tolerancePct);
    } else if (stageNumber === 2) {
      isCorrect = this.answerValidator.validateSimulationState(userSubmission.p || userSubmission.pressure || userSubmission.answer, stageData.expectedP, stageData.tolerancePct);
    } else if (stageNumber === 3) {
      isCorrect = this.answerValidator.validateSimulationState(userSubmission.v || userSubmission.volume || userSubmission.answer, stageData.expectedV, stageData.tolerancePct);
    } else if (stageNumber === 4) {
      isCorrect = this.answerValidator.validateSimulationState(userSubmission.v || userSubmission.volume || userSubmission.answer, stageData.expectedV, stageData.tolerancePct);
    } else if (stageNumber === 5) {
      const pOk = this.answerValidator.validateSimulationState(userSubmission.pressure, stageData.targetState.pressure, 0.05);
      const vOk = this.answerValidator.validateSimulationState(userSubmission.volume, stageData.targetState.volume, 0.05);
      const tOk = this.answerValidator.validateSimulationState(userSubmission.temp, stageData.targetState.temp, 0.05);
      isCorrect = pOk && vOk && tOk;
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
      sessionState.livesRemaining -= 1;
      const failed = sessionState.livesRemaining <= 0;

      return this.formatStageResponse({
        correct: false,
        stageCompleted: false,
        nextStage: sessionState.currentStage,
        score: sessionState.score,
        lifeLost: true,
        livesRemaining: sessionState.livesRemaining,
        failed,
        feedback: stageData.explanation || 'Gas simulation destabilized! Life lost.',
        sanitizedState: this.sanitizeConfigForClient(sessionState),
      });
    }
  }

  calculateStars(score, livesRemaining, timeSpentSec) {
    return this.rewardValidator.calculateStars(score, livesRemaining, timeSpentSec, 1000);
  }
}

module.exports = new GasSimulatorEngine();
