const BaseGameEngine = require('./baseGameEngine');

class CalculationHeistEngine extends BaseGameEngine {
  constructor() {
    super('CALCULATION_HEIST', 4);
  }

  getStageVariants() {
    return {
      stage1: [
        {
          id: 's1_v1',
          title: 'Mole Scanner',
          compound: 'H2O (Water)',
          givenMass: 36,
          molarMass: 18,
          targetUnit: 'mol',
          correctAnswer: 2,
          digit: 7,
          hint: 'Remember: Moles = Mass / Molar Mass',
          explanation: 'Moles (n) = Mass (36g) / Molar Mass (18g/mol) = 2 moles.',
        },
        {
          id: 's1_v2',
          title: 'Mole Scanner',
          compound: 'CO2 (Carbon Dioxide)',
          givenMass: 88,
          molarMass: 44,
          targetUnit: 'mol',
          correctAnswer: 2,
          digit: 4,
          hint: 'Remember: Moles = Mass / Molar Mass',
          explanation: 'Moles (n) = Mass (88g) / Molar Mass (44g/mol) = 2 moles.',
        },
        {
          id: 's1_v3',
          title: 'Mole Scanner',
          compound: 'NaCl (Sodium Chloride)',
          givenMass: 117,
          molarMass: 58.5,
          targetUnit: 'mol',
          correctAnswer: 2,
          digit: 5,
          hint: 'Use n = mass / molar mass to calculate moles of salt.',
          explanation: 'Moles (n) = Mass (117g) / Molar Mass (58.5g/mol) = 2 moles.',
        },
      ],
      stage2: [
        {
          id: 's2_v1',
          title: 'Molar Mass Calculator',
          compound: 'CO2',
          elements: [
            { symbol: 'C', atomicMass: 12, requiredQty: 1 },
            { symbol: 'O', atomicMass: 16, requiredQty: 2 },
          ],
          correctAnswer: 44,
          digit: 3,
          hint: 'Sum the atomic masses: C (12) + 2 × O (16)',
          explanation: 'Molar Mass = 12 + (2 × 16) = 44 g/mol.',
        },
        {
          id: 's2_v2',
          title: 'Molar Mass Calculator',
          compound: 'CaCO3',
          elements: [
            { symbol: 'Ca', atomicMass: 40, requiredQty: 1 },
            { symbol: 'C', atomicMass: 12, requiredQty: 1 },
            { symbol: 'O', atomicMass: 16, requiredQty: 3 },
          ],
          correctAnswer: 100,
          digit: 9,
          hint: 'Sum the atomic masses: Ca (40) + C (12) + 3 × O (16).',
          explanation: 'Molar Mass = 40 + 12 + (3 × 16) = 40 + 12 + 48 = 100 g/mol.',
        },
      ],
      stage3: [
        {
          id: 's3_v1',
          title: 'Particle Decoder',
          givenMoles: 2,
          avogadroConst: '6.022 x 10^23',
          correctAnswer: '1.204',
          expectedExponent: 24,
          correctCoefficient: 1.204,
          digit: 9,
          hint: 'Multiply moles by Avogadro constant: 2 × 6.022 × 10²³',
          explanation: 'Particles = 2 mol × (6.022 × 10²³) = 1.204 × 10²⁴ particles.',
        },
        {
          id: 's3_v2',
          title: 'Particle Decoder',
          givenMoles: 3,
          avogadroConst: '6.022 x 10^23',
          correctAnswer: '1.807',
          expectedExponent: 24,
          correctCoefficient: 1.807,
          digit: 2,
          hint: 'Multiply 3 moles by Avogadro constant: 3 × 6.022 × 10²³ = 1.807 × 10²⁴.',
          explanation: 'Particles = 3 mol × (6.022 × 10²³) = 1.8066 × 10²⁴ particles.',
        },
      ],
      stage4: [
        {
          id: 's4_v1',
          title: 'Empirical Formula Analyzer',
          composition: [
            { element: 'Carbon (C)', percentage: 40 },
            { element: 'Hydrogen (H)', percentage: 6.67 },
            { element: 'Oxygen (O)', percentage: 53.33 },
          ],
          correctFormula: 'CH2O',
          digit: 2,
          hint: 'Convert % to moles (C=3.33, H=6.67, O=3.33). Divide by smallest (3.33) -> Ratio C1 H2 O1.',
          explanation: 'Moles ratio: C (40/12=3.33), H (6.67/1=6.67), O (53.33/16=3.33). Divide by 3.33 yields CH2O.',
        },
      ],
    };
  }

  generateSessionConfig() {
    const variants = this.getStageVariants();
    const getRandomVariant = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const s1 = getRandomVariant(variants.stage1);
    const s2 = getRandomVariant(variants.stage2);
    const s3 = getRandomVariant(variants.stage3);
    const s4 = getRandomVariant(variants.stage4);

    const vaultCode = `${s1.digit}${s2.digit}${s3.digit}${s4.digit}`;

    return {
      currentStage: 1,
      totalStages: 4,
      score: 0,
      livesRemaining: 3,
      hintsUsed: 0,
      vaultCode,
      collectedDigits: [null, null, null, null],
      stages: [
        { stageNumber: 1, ...s1 },
        { stageNumber: 2, ...s2 },
        { stageNumber: 3, ...s3 },
        { stageNumber: 4, ...s4 },
      ],
    };
  }

  sanitizeConfigForClient(sessionState) {
    if (!sessionState) return null;
    const { vaultCode, stages, ...clientState } = sessionState;

    const sanitizedStages = (stages || []).map((s) => {
      const { correctAnswer, correctFormula, digit, ...publicStageData } = s;
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

    if (!stageData) {
      return this.formatRejectionResponse('Invalid stage number', sessionState.livesRemaining);
    }

    let isCorrect = false;

    if (stageNumber === 1) {
      isCorrect = this.answerValidator.validateNumeric(userSubmission.answer, stageData.correctAnswer, 0.05);
    } else if (stageNumber === 2) {
      isCorrect = this.answerValidator.validateNumeric(userSubmission.answer, stageData.correctAnswer, 0.5);
    } else if (stageNumber === 3) {
      isCorrect = this.answerValidator.validateText(userSubmission.answer, stageData.correctAnswer) ||
                  this.answerValidator.validateNumeric(userSubmission.answer, stageData.correctAnswer, 0.05);
    } else if (stageNumber === 4) {
      isCorrect = this.answerValidator.validateFormula(userSubmission.answer || userSubmission.formula, stageData.correctFormula);
    }

    if (isCorrect) {
      sessionState.collectedDigits[targetStageIndex] = stageData.digit;
      sessionState.score += this.rewardValidator.calculateStageScore(250, sessionState.livesRemaining);
      sessionState.currentStage = Math.min(5, stageNumber + 1);

      return this.formatStageResponse({
        correct: true,
        stageCompleted: true,
        nextStage: sessionState.currentStage,
        score: sessionState.score,
        livesRemaining: sessionState.livesRemaining,
        feedback: stageData.explanation,
        sanitizedState: this.sanitizeConfigForClient(sessionState),
        extraData: { codeDigit: stageData.digit },
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
        feedback: stageData.explanation || 'Incorrect calculation! Life lost.',
        sanitizedState: this.sanitizeConfigForClient(sessionState),
        extraData: { codeDigit: null },
      });
    }
  }

  validateVaultCode(sessionState, submittedCode) {
    const isCorrect = this.answerValidator.validateText(submittedCode, sessionState.vaultCode);

    if (isCorrect) {
      sessionState.score += 500;
      return {
        correct: true,
        stageCompleted: true,
        unlocked: true,
        finalScore: sessionState.score,
        message: 'Vault override successful!',
      };
    } else {
      sessionState.livesRemaining = Math.max(0, sessionState.livesRemaining - 1);
      return {
        correct: false,
        stageCompleted: false,
        unlocked: false,
        lifeLost: true,
        livesRemaining: sessionState.livesRemaining,
        failed: sessionState.livesRemaining <= 0,
        message: 'Incorrect Vault Code!',
      };
    }
  }

  calculateStars(score, livesRemaining, timeSpentSec) {
    return this.rewardValidator.calculateStars(score, livesRemaining, timeSpentSec, 1000);
  }
}

module.exports = new CalculationHeistEngine();
