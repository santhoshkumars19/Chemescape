const BaseGameEngine = require('./baseGameEngine');

class QuantumArchitectEngine extends BaseGameEngine {
  constructor() {
    super('QUANTUM_ARCHITECT', 5);
  }

  getStageVariants() {
    return {
      stage1: [
        {
          id: 'q1_v1',
          title: 'Electron Shell Builder',
          element: 'Oxygen',
          symbol: 'O',
          atomicNumber: 8,
          shells: [
            { name: 'K Shell (n=1)', capacity: 2, expected: 2 },
            { name: 'L Shell (n=2)', capacity: 8, expected: 6 },
          ],
          hint: 'Remember that the first shell (K) holds a maximum of 2 electrons, while the second (L) holds up to 8.',
          explanation: 'Oxygen has 8 total electrons: 2 occupy the innermost K shell and 6 occupy the L shell.',
        },
        {
          id: 'q1_v2',
          title: 'Electron Shell Builder',
          element: 'Sodium',
          symbol: 'Na',
          atomicNumber: 11,
          shells: [
            { name: 'K Shell (n=1)', capacity: 2, expected: 2 },
            { name: 'L Shell (n=2)', capacity: 8, expected: 8 },
            { name: 'M Shell (n=3)', capacity: 18, expected: 1 },
          ],
          hint: 'Sodium has 11 electrons: K=2, L=8, M=1.',
          explanation: 'Sodium distributes 11 electrons across K (2), L (8), and M (1) shells.',
        },
        {
          id: 'q1_v3',
          title: 'Electron Shell Builder',
          element: 'Carbon',
          symbol: 'C',
          atomicNumber: 6,
          shells: [
            { name: 'K Shell (n=1)', capacity: 2, expected: 2 },
            { name: 'L Shell (n=2)', capacity: 8, expected: 4 },
          ],
          hint: 'Fill K shell first with 2 electrons, leaving 4 valence electrons in the L shell.',
          explanation: 'Carbon (Z=6) distributes electrons as K=2, L=4.',
        },
      ],
      stage2: [
        {
          id: 'q2_v1',
          title: 'Orbital Filling Lab',
          element: 'Oxygen (Z=8)',
          targetConfig: '1s2 2s2 2p4',
          orbitals: [
            { name: '1s', capacity: 2, expectedElectrons: ['up', 'down'] },
            { name: '2s', capacity: 2, expectedElectrons: ['up', 'down'] },
            { name: '2px', capacity: 2, expectedElectrons: ['up', 'down'] },
            { name: '2py', capacity: 2, expectedElectrons: ['up'] },
            { name: '2pz', capacity: 2, expectedElectrons: ['up'] },
          ],
          hint: 'According to Hund’s Rule, electrons occupy degenerate 2p orbitals singly before pairing up.',
          explanation: 'Oxygen (1s² 2s² 2p⁴) fills 1s and 2s with paired electrons, then 2p receives 3 unpaired parallel electrons plus 1 paired electron.',
        },
        {
          id: 'q2_v2',
          title: 'Orbital Filling Lab',
          element: 'Nitrogen (Z=7)',
          targetConfig: '1s2 2s2 2p3',
          orbitals: [
            { name: '1s', capacity: 2, expectedElectrons: ['up', 'down'] },
            { name: '2s', capacity: 2, expectedElectrons: ['up', 'down'] },
            { name: '2px', capacity: 2, expectedElectrons: ['up'] },
            { name: '2py', capacity: 2, expectedElectrons: ['up'] },
            { name: '2pz', capacity: 2, expectedElectrons: ['up'] },
          ],
          hint: 'All three 2p orbitals (2px, 2py, 2pz) must receive one spin-up electron first before any pairing.',
          explanation: 'Nitrogen has 3 2p electrons, half-filling each 2p orbital with parallel spins (Hund’s rule).',
        },
      ],
      stage3: [
        {
          id: 'q3_v1',
          title: 'Quantum Number Scanner',
          targetDescription: 'Determine the 4 Quantum Numbers for the 8th (last) electron of Oxygen.',
          subshell: '2p',
          options: {
            nOptions: [1, 2, 3, 4],
            lOptions: [0, 1, 2, 3],
            mlOptions: [-1, 0, 1],
            msOptions: [0.5, -0.5],
          },
          correctNumbers: { n: 2, l: 1, ml: -1, ms: -0.5 },
          hint: 'For 2p: Principal n=2, Azimuthal l=1 (since p=1), ml=-1, and ms=-1/2 for the paired spin-down electron.',
          explanation: 'The 8th electron is in the 2p subshell (n=2, l=1). It pairs up in the first 2p box (ml=-1) with opposite spin (ms=-1/2).',
        },
      ],
      stage4: [
        {
          id: 'q4_v1',
          title: 'Atomic Rule Challenge',
          diagramDescription: 'Orbital Diagram: 1s [↑↓] 2s [↑↑] 2p [ ] [ ] [ ]',
          choices: [
            'Aufbau Principle',
            'Pauli Exclusion Principle',
            'Hund’s Rule',
            'No Violation',
          ],
          correctViolation: 'Pauli Exclusion Principle',
          hint: 'Look at the 2s orbital. Two electrons in the same orbital cannot have parallel spins (↑↑).',
          explanation: 'Pauli Exclusion Principle states that no two electrons in the same orbital can have the same spin state.',
        },
      ],
      finalCore: [
        {
          id: 'q5_v1',
          title: 'Atomic Core Reconstruction',
          element: 'Sodium (Na, Z=11)',
          correctConfiguration: '1s2 2s2 2p6 3s1',
          availableSubshells: ['1s2', '2s2', '2p6', '3s1', '3s2', '3p6'],
          hint: 'Sodium has 11 electrons: 1s² (2) + 2s² (2) + 2p⁶ (6) + 3s¹ (1) = 11.',
          explanation: 'Ground-state electron configuration of Sodium (Z=11) is 1s² 2s² 2p⁶ 3s¹.',
        },
        {
          id: 'q5_v2',
          title: 'Atomic Core Reconstruction',
          element: 'Neon (Ne, Z=10)',
          correctConfiguration: '1s2 2s2 2p6',
          availableSubshells: ['1s2', '2s2', '2p4', '2p6', '3s1', '3s2'],
          hint: 'Neon is a noble gas with a complete octet: 1s² 2s² 2p⁶.',
          explanation: 'Ground-state electron configuration of Neon (Z=10) is 1s² 2s² 2p⁶.',
        },
      ],
    };
  }

  generateSessionConfig() {
    const variants = this.getStageVariants();

    const stage1Choice = variants.stage1[Math.floor(Math.random() * variants.stage1.length)];
    const stage2Choice = variants.stage2[Math.floor(Math.random() * variants.stage2.length)];
    const stage3Choice = variants.stage3[Math.floor(Math.random() * variants.stage3.length)];
    const stage4Choice = variants.stage4[Math.floor(Math.random() * variants.stage4.length)];
    const finalChoice = variants.finalCore[Math.floor(Math.random() * variants.finalCore.length)];

    return {
      currentStage: 1,
      totalStages: 5,
      score: 0,
      livesRemaining: 3,
      hintsUsed: 0,
      stages: [
        { stageNumber: 1, ...stage1Choice },
        { stageNumber: 2, ...stage2Choice },
        { stageNumber: 3, ...stage3Choice },
        { stageNumber: 4, ...stage4Choice },
        { stageNumber: 5, ...finalChoice },
      ],
    };
  }

  sanitizeConfigForClient(sessionState) {
    if (!sessionState) return null;

    const { stages, ...clientState } = sessionState;

    const sanitizedStages = (stages || []).map((s) => {
      const {
        shells,
        orbitals,
        correctNumbers,
        correctViolation,
        correctConfiguration,
        ...publicStageData
      } = s;

      const publicShells = shells
        ? shells.map(({ expected, ...shellRest }) => shellRest)
        : undefined;

      const publicOrbitals = orbitals
        ? orbitals.map(({ expectedElectrons, ...orbRest }) => orbRest)
        : undefined;

      return {
        ...publicStageData,
        shells: publicShells,
        orbitals: publicOrbitals,
      };
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
      const userShells = userSubmission.shells || userSubmission;
      isCorrect = stageData.shells.every(
        (sh) => userShells[sh.name.split(' ')[0]] === sh.expected || userShells[sh.name] === sh.expected
      );
    } else if (stageNumber === 2) {
      const userOrbs = userSubmission.orbitals || userSubmission;
      isCorrect = stageData.orbitals.every((orb) => {
        const userSpins = userOrbs[orb.name] || [];
        return (
          userSpins.length === orb.expectedElectrons.length &&
          userSpins.every((spin, idx) => spin === orb.expectedElectrons[idx])
        );
      });
    } else if (stageNumber === 3) {
      const userNums = userSubmission.numbers || userSubmission;
      isCorrect =
        parseInt(userNums.n, 10) === stageData.correctNumbers.n &&
        parseInt(userNums.l, 10) === stageData.correctNumbers.l &&
        parseInt(userNums.ml, 10) === stageData.correctNumbers.ml &&
        parseFloat(userNums.ms) === stageData.correctNumbers.ms;
    } else if (stageNumber === 4) {
      const userViolation = userSubmission.violation || userSubmission.answer || '';
      isCorrect = this.answerValidator.validateMCQ(userViolation, stageData.correctViolation);
    } else if (stageNumber === 5) {
      const userConfig = userSubmission.configuration || userSubmission.answer || '';
      isCorrect = this.answerValidator.validateFormula(userConfig, stageData.correctConfiguration);
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
        feedback: stageData.explanation || 'Orbital instability detected! Life lost.',
        sanitizedState: this.sanitizeConfigForClient(sessionState),
      });
    }
  }

  calculateStars(score, livesRemaining, timeSpentSec) {
    return this.rewardValidator.calculateStars(score, livesRemaining, timeSpentSec, 1200);
  }
}

module.exports = new QuantumArchitectEngine();
