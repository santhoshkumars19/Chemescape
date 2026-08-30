const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const calculationHeistController = require('../controllers/calculationHeistController');
const quantumArchitectController = require('../controllers/quantumArchitectController');
const gridReconstructionController = require('../controllers/gridReconstructionController');
const hydrogenReactorController = require('../controllers/hydrogenReactorController');
const metalSortingController = require('../controllers/metalSortingController');
const gasSimulatorController = require('../controllers/gasSimulatorController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  saveGameSchema,
  completeGameSchema,
  failGameSchema,
  validate,
} = require('../validators/gameValidator');

// All game engine routes require student authentication
router.use(authMiddleware);

// --- 1. Generic Game Progress & Chapter Unlock APIs ---
router.get('/unlocked', gameController.getUnlockedChapters);
router.get('/progress', gameController.getUserProgress);
router.get('/progress/:roomId', gameController.getRoomProgress);
router.post('/progress/:roomId/start', gameController.startGame);
router.post('/progress/:roomId/save', validate(saveGameSchema), gameController.saveGame);
router.post('/progress/:roomId/complete', validate(completeGameSchema), gameController.completeGame);
router.post('/progress/:roomId/fail', validate(failGameSchema), gameController.failGame);

// --- 1b. Per-Question Answer Validation (Generic Quiz Engine) ---
// POST /api/game/questions/:questionId/answer
// Body: { answer: string, roomId: string }
// Returns: { success, data: { correct: boolean, points: number, feedback: string } }
router.post('/questions/:questionId/answer', gameController.submitAnswer);

// --- 2. Unit 1: Calculation Heist Game Engine APIs ---
router.post('/calculation-heist/start', calculationHeistController.startSession);
router.post('/calculation-heist/stage/:stageNumber/submit', calculationHeistController.submitStage);
router.post('/calculation-heist/final-code', calculationHeistController.submitFinalCode);

// --- 3. Unit 2: Quantum Orbital Architect Game Engine APIs ---
router.post('/quantum-architect/start', quantumArchitectController.startSession);
router.post('/quantum-architect/stage/:stageNumber/submit', quantumArchitectController.submitStage);
router.post('/quantum-architect/final-submit', quantumArchitectController.submitFinal);

// --- 4. Unit 3: Periodic Grid Reconstruction Game Engine APIs ---
router.post('/grid-reconstruction/start', gridReconstructionController.startSession);
router.post('/grid-reconstruction/stage/:stageNumber/submit', gridReconstructionController.submitStage);
router.post('/grid-reconstruction/final-submit', gridReconstructionController.submitFinal);

// --- 5. Unit 4: Hydrogen Reactor Game Engine APIs ---
router.post('/hydrogen-reactor/start', hydrogenReactorController.startSession);
router.post('/hydrogen-reactor/stage/:stageNumber/submit', hydrogenReactorController.submitStage);
router.post('/hydrogen-reactor/final-submit', hydrogenReactorController.submitFinal);

// --- 6. Unit 5: Element Sorting Factory Game Engine APIs ---
router.post('/metal-sorting/start', metalSortingController.startSession);
router.post('/metal-sorting/stage/:stageNumber/submit', metalSortingController.submitStage);
router.post('/metal-sorting/final-submit', metalSortingController.submitFinal);

// --- 7. Unit 6: Gas Chamber Simulator Game Engine APIs ---
router.post('/gas-simulator/start', gasSimulatorController.startSession);
router.post('/gas-simulator/stage/:stageNumber/submit', gasSimulatorController.submitStage);
router.post('/gas-simulator/final-submit', gasSimulatorController.submitFinal);

module.exports = router;
