const prisma = require('../../config/db');
const gasSimulatorEngine = require('./gasSimulatorEngine');
const gameProgressService = require('../gameProgressService');
const progressionValidator = require('./validation/progressionValidator');

class GasSimulatorService {
  async startGasSession(userId, roomId = null) {
    let room;
    if (roomId) {
      room = await prisma.room.findUnique({ where: { id: roomId } });
    }
    if (!room) {
      room = await prisma.room.findFirst({
        where: { gameType: 'GAS_SIMULATOR' },
        orderBy: { createdAt: 'desc' },
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

    let sessionState;

    if (activeSession && activeSession.sessionState) {
      sessionState = activeSession.sessionState;
    } else {
      sessionState = gasSimulatorEngine.generateSessionConfig();

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

    const sanitizedState = gasSimulatorEngine.sanitizeConfigForClient(sessionState);

    return {
      sessionId: activeSession.id,
      roomId: room.id,
      roomName: room.name,
      gameType: 'GAS_SIMULATOR',
      gameState: sanitizedState,
    };
  }

  async submitStageAnswer(userId, stageNumber, userSubmission) {
    const activeSession = await prisma.gameSession.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' },
    });

    if (!activeSession || !activeSession.sessionState) {
      const error = new Error('No active Gas Chamber Simulator session found');
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

    const validationResult = gasSimulatorEngine.validateStageSubmission(
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

    return validationResult;
  }

  async submitFinalChamber(userId, userSubmission) {
    const activeSession = await prisma.gameSession.findFirst({
      where: { userId, status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' },
    });

    if (!activeSession || !activeSession.sessionState) {
      const error = new Error('No active Gas Chamber Simulator session found');
      error.statusCode = 404;
      throw error;
    }

    const sessionState = activeSession.sessionState;
    const { timeSpentSec = 240 } = userSubmission;

    const validationResult = gasSimulatorEngine.validateStageSubmission(
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
      return validationResult;
    }

    const calculatedStars = gasSimulatorEngine.calculateStars(
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
        gameState: { gasChamberStabilized: true },
      }
    );

    return {
      correct: true,
      stageCompleted: true,
      completed: true,
      finalScore: sessionState.score,
      stars: calculatedStars,
      completionRewards: completionResult,
      message: 'Gas Chamber Stabilized! Mission Complete.',
    };
  }
}

module.exports = new GasSimulatorService();
