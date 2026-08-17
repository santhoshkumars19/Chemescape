const BaseGameEngine = require('./baseGameEngine');

class HydrogenReactorEngine extends BaseGameEngine {
  constructor() {
    super('HYDROGEN_REACTOR', 5);
  }

  getStageVariants() {
    return {
      stage1: [
        {
          id: 'h1_v1',
          title: 'Isotope Analysis Unit',
          isotopeName: 'Deuterium (2H)',
          symbol: '2H',
          expectedProtons: 1,
          expectedNeutrons: 1,
          expectedSorting: { '1H': 'Protium', '2H': 'Deuterium', '3H': 'Tritium' },
          hint: 'Deuterium (2H) has 1 proton and 1 neutron.',
          explanation: '2H contains 1 proton and 1 neutron.',
        },
        {
          id: 'h1_v2',
          title: 'Isotope Analysis Unit',
          isotopeName: 'Tritium (3H)',
          symbol: '3H',
          expectedProtons: 1,
          expectedNeutrons: 2,
          expectedSorting: { '1H': 'Protium', '2H': 'Deuterium', '3H': 'Tritium' },
          hint: 'Tritium (3H) has 1 proton and 2 neutrons.',
          explanation: '3H contains 1 proton and 2 neutrons.',
        },
      ],
      stage2: [
        {
          id: 'h2_v1',
          title: 'Hydrogen Reaction Pipeline',
          targetReaction: 'Laboratory Preparation: Zn + 2HCl → ZnCl2 + H2',
          expectedReactants: ['Zn', 'HCl'],
          expectedProducts: ['ZnCl2', 'H2'],
          hint: 'Reactants: Zn and HCl. Products: ZnCl2 and H2.',
          explanation: 'Zinc reacts with hydrochloric acid to produce hydrogen gas.',
        },
      ],
      stage3: [
        {
          id: 'h3_v1',
          title: 'Hydrogen Fuel Cell Balancer',
          equationText: '_ H2 + _ O2 → _ H2O',
          expectedCoefficients: { h2: 2, o2: 1, h2o: 2 },
          hint: 'Balance: 2 H2 + 1 O2 → 2 H2O.',
          explanation: 'Balanced ratio: 2:1:2.',
        },
      ],
      stage4: [
        {
          id: 'h4_v1',
          title: 'Reactor Safety Protocols',
          dangerCondition: 'Thermal Overheat (Temp: 180°C, Pressure: 4.2 atm)',
          requiredActions: ['Open Safety Outlet', 'Cool Reactor'],
          hint: 'Open safety outlet and activate cooling fans immediately.',
          explanation: 'Safety sequence disarmed core melt.',
        },
      ],
      stage5: [
        {
          id: 'h5_v1',
          title: 'Reactor Core Master Calibration',
          targetTemp: 75,
          targetPressure: 1.5,
          targetH2Flow: 50,
          targetO2Flow: 25,
          hint: 'Target: Temp=75°C, P=1.5atm, H2=50%, O2=25%.',
          explanation: 'Hydrogen Reactor stabilized!',
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
      const {
        expectedProtons,
        expectedNeutrons,
        expectedSorting,
        expectedReactants,
        expectedProducts,
        expectedCoefficients,
        requiredActions,
        targetTemp,
        targetPressure,
        targetH2Flow,
        targetO2Flow,
        ...publicData
      } = s;
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
      const pOk = this.answerValidator.validateNumeric(userSubmission.protons, stageData.expectedProtons, 0);
      const nOk = this.answerValidator.validateNumeric(userSubmission.neutrons, stageData.expectedNeutrons, 0);
      const sOk = !userSubmission.sorting || this.answerValidator.validateMatching(userSubmission.sorting, stageData.expectedSorting);
      isCorrect = pOk && nOk && sOk;
    } else if (stageNumber === 2) {
      const rOk = this.answerValidator.validateOrdering(userSubmission.reactants, stageData.expectedReactants);
      const pOk = this.answerValidator.validateOrdering(userSubmission.products, stageData.expectedProducts);
      isCorrect = rOk && pOk;
    } else if (stageNumber === 3) {
      const h2Ok = this.answerValidator.validateNumeric(userSubmission.h2, stageData.expectedCoefficients.h2, 0);
      const o2Ok = this.answerValidator.validateNumeric(userSubmission.o2, stageData.expectedCoefficients.o2, 0);
      const h2oOk = this.answerValidator.validateNumeric(userSubmission.h2o, stageData.expectedCoefficients.h2o, 0);
      isCorrect = h2Ok && o2Ok && h2oOk;
    } else if (stageNumber === 4) {
      isCorrect = this.answerValidator.validateOrdering(userSubmission.actions, stageData.requiredActions);
    } else if (stageNumber === 5) {
      const tOk = this.answerValidator.validateSimulationState(userSubmission.temp, stageData.targetTemp, 0.05);
      const pOk = this.answerValidator.validateSimulationState(userSubmission.pressure, stageData.targetPressure, 0.05);
      const h2Ok = this.answerValidator.validateSimulationState(userSubmission.h2Flow, stageData.targetH2Flow, 0.05);
      const o2Ok = this.answerValidator.validateSimulationState(userSubmission.o2Flow, stageData.targetO2Flow, 0.05);
      isCorrect = tOk && pOk && h2Ok && o2Ok;
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
        feedback: stageData.explanation || 'Reactor parameter error! Life lost.',
        sanitizedState: this.sanitizeConfigForClient(sessionState),
      });
    }
  }

  calculateStars(score, livesRemaining, timeSpentSec) {
    return this.rewardValidator.calculateStars(score, livesRemaining, timeSpentSec, 1100);
  }
}

module.exports = new HydrogenReactorEngine();
