const prisma = require('../../config/db');
const gridReconstructionEngine = require('./gridReconstructionEngine');
const gameProgressService = require('../gameProgressService');
const progressionValidator = require('./validation/progressionValidator');

class GridReconstructionService {
  async startGridSession(userId, roomId = null) {
    let room;
    if (roomId) {
      room = await prisma.room.findUnique({ where: { id: roomId } });
    }
    if (!room) {
      room = await prisma.room.findFirst({
        where: { gameType: 'GRID_RECONSTRUCTION' },
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

    const sessionState = gridReconstructionEngine.generateSessionConfig();

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

    const sanitizedState = gridReconstructionEngine.sanitizeConfigForClient(sessionState);

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
      const error = new Error('No active Periodic Grid Reconstruction session found');
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

    const validationResult = gridReconstructionEngine.validateStageSubmission(
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

    const sanitizedState = gridReconstructionEngine.sanitizeConfigForClient(sessionState);

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

  async submitFinalGrid(userId, userSubmission) {
    const activeSession = await prisma.gameSession.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' },
    });

    if (!activeSession || !activeSession.sessionState) {
      const error = new Error('No active Periodic Grid Reconstruction session found');
      error.statusCode = 404;
      throw error;
    }

    const sessionState = activeSession.sessionState;
    const { timeSpentSec = 210 } = userSubmission;

    const validationResult = gridReconstructionEngine.validateStageSubmission(
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
        message: 'Periodic Grid configuration invalid.',
      };
    }

    const calculatedStars = gridReconstructionEngine.calculateStars(
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
        gameState: { gridRestored: true },
      }
    );

    return {
      correct: true,
      stageCompleted: true,
      completed: true,
      finalScore: sessionState.score,
      stars: calculatedStars,
      completionRewards: completionResult,
      message: 'Periodic Grid restored! Mission Complete.',
    };
  }
}

module.exports = new GridReconstructionService();
