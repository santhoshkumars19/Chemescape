const prisma = require('../../config/db');
const quantumArchitectEngine = require('./quantumArchitectEngine');
const gameProgressService = require('../gameProgressService');
const progressionValidator = require('./validation/progressionValidator');

class QuantumArchitectService {
  async startQuantumSession(userId, roomId = null) {
    let room;
    if (roomId) {
      room = await prisma.room.findUnique({ where: { id: roomId } });
    }
    if (!room) {
      room = await prisma.room.findFirst({
        where: { gameType: 'QUANTUM_ARCHITECT' },
      });
    }
    if (!room) {
      room = await prisma.room.findFirst();
    }

    let activeSession = await prisma.gameSession.findFirst({
      where: {
        userId,
        roomId: room.id,
        status: 'ACTIVE',
      },
      orderBy: { startedAt: 'desc' },
    });

    const sessionState = quantumArchitectEngine.generateSessionConfig();

    if (activeSession) {
      activeSession = await prisma.gameSession.update({
        where: { id: activeSession.id },
        data: {
          score: 0,
          stars: 0,
          livesRemaining: sessionState.livesRemaining,
          sessionState,
        },
      });
    } else {
      activeSession = await prisma.gameSession.create({
        data: {
          userId,
          roomId: room.id,
          status: 'ACTIVE',
          score: 0,
          stars: 0,
          livesRemaining: sessionState.livesRemaining,
          sessionState,
        },
      });
    }

    const sanitizedState = quantumArchitectEngine.sanitizeConfigForClient(sessionState);

    return {
      sessionId: activeSession.id,
      roomId: room.id,
      roomName: room.name,
      gameState: sanitizedState,
    };
  }

  async submitStageAnswer(userId, stageNumber, userSubmission) {
    const activeSession = await prisma.gameSession.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' },
    });

    if (!activeSession || !activeSession.sessionState) {
      const error = new Error('No active Quantum Orbital Architect session found');
      error.statusCode = 404;
      throw error;
    }

    const sessionState = activeSession.sessionState;
    const targetStage = parseInt(stageNumber, 10);

    const progCheck = progressionValidator.validateStageProgression(sessionState.currentStage, targetStage, 5);
    if (!progCheck.valid) {
      const error = new Error(progCheck.error);
      error.statusCode = 400;
      throw error;
    }

    const validationResult = quantumArchitectEngine.validateStageSubmission(
      sessionState,
      targetStage,
      userSubmission
    );

    if (validationResult.failed) {
      await prisma.gameSession.update({
        where: { id: activeSession.id },
        data: {
          status: 'FAILED',
          livesRemaining: 0,
          sessionState,
          completedAt: new Date(),
        },
      });
    } else {
      await prisma.gameSession.update({
        where: { id: activeSession.id },
        data: {
          score: sessionState.score,
          livesRemaining: sessionState.livesRemaining,
          sessionState,
        },
      });
    }

    const sanitizedState = quantumArchitectEngine.sanitizeConfigForClient(sessionState);

    return {
      correct: validationResult.correct,
      stageCompleted: validationResult.correct,
      nextStage: validationResult.nextStage || sessionState.currentStage,
      score: sessionState.score,
      livesRemaining: sessionState.livesRemaining,
      explanation: validationResult.explanation,
      failed: !!validationResult.failed,
      gameState: sanitizedState,
    };
  }

  async submitFinalConfiguration(userId, userSubmission) {
    const activeSession = await prisma.gameSession.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' },
    });

    if (!activeSession || !activeSession.sessionState) {
      const error = new Error('No active Quantum Orbital Architect session found');
      error.statusCode = 404;
      throw error;
    }

    const sessionState = activeSession.sessionState;
    const { timeSpentSec = 180 } = userSubmission;

    const validationResult = quantumArchitectEngine.validateStageSubmission(
      sessionState,
      5,
      userSubmission
    );

    if (!validationResult.correct) {
      if (validationResult.failed) {
        await prisma.gameSession.update({
          where: { id: activeSession.id },
          data: {
            status: 'FAILED',
            livesRemaining: 0,
            sessionState,
            completedAt: new Date(),
          },
        });
      }
      return {
        correct: false,
        stageCompleted: false,
        completed: false,
        livesRemaining: sessionState.livesRemaining,
        failed: !!validationResult.failed,
        message: 'Atomic Core configuration invalid.',
      };
    }

    const calculatedStars = quantumArchitectEngine.calculateStars(
      sessionState.score,
      sessionState.livesRemaining,
      timeSpentSec
    );

    const completionResult = await gameProgressService.completeGame(
      userId,
      activeSession.roomId,
      {
        score: sessionState.score,
        stars: calculatedStars,
        timeSpentSec,
        gameState: { coreReconstructed: true },
      }
    );

    return {
      correct: true,
      stageCompleted: true,
      completed: true,
      finalScore: sessionState.score,
      stars: calculatedStars,
      completionRewards: completionResult,
      message: 'Atomic Core reconstructed! Mission Complete.',
    };
  }
}

module.exports = new QuantumArchitectService();
