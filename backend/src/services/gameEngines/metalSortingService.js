const prisma = require('../../config/db');
const metalSortingEngine = require('./metalSortingEngine');
const gameProgressService = require('../gameProgressService');
const progressionValidator = require('./validation/progressionValidator');

const fallbackSessions = new Map();

class MetalSortingService {
  async startFactorySession(userId, roomId = null) {
    let room = null;
    if (roomId) {
      try { room = await prisma.room.findUnique({ where: { id: roomId } }); } catch {}
    }
    if (!room) {
      try {
        room = await prisma.room.findFirst({ where: { gameType: 'METAL_SORTING' } });
      } catch {}
    }
    if (!room) {
      room = { id: 'room-5', name: 'Element Sorting Factory', gameType: 'METAL_SORTING' };
    }

    let activeSession = null;
    try {
      activeSession = await prisma.gameSession.findFirst({
        where: {
          userId,
          roomId: room.id,
          status: 'ACTIVE',
        },
        orderBy: { startedAt: 'desc' },
      });
    } catch {}

    if (!activeSession) {
      activeSession = fallbackSessions.get(`${userId}:METAL_SORTING`);
      if (activeSession && activeSession.status !== 'ACTIVE') activeSession = null;
    }

    const sessionState = metalSortingEngine.generateSessionConfig();

    try {
      if (activeSession && activeSession.id && !activeSession.id.startsWith('fb-')) {
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
    } catch {
      activeSession = {
        id: `fb-metal-${Date.now()}`,
        userId,
        roomId: room.id,
        status: 'ACTIVE',
        score: 0,
        stars: 0,
        livesRemaining: sessionState.livesRemaining,
        sessionState,
        startedAt: new Date(),
      };
      fallbackSessions.set(`${userId}:METAL_SORTING`, activeSession);
    }

    const sanitizedState = metalSortingEngine.sanitizeConfigForClient(sessionState);

    return {
      sessionId: activeSession.id,
      roomId: room.id,
      roomName: room.name,
      gameState: sanitizedState,
    };
  }

  async startMetalSession(userId, roomId = null) {
    return this.startFactorySession(userId, roomId);
  }

  async submitStageAnswer(userId, stageNumber, userSubmission) {
    let activeSession = null;
    try {
      activeSession = await prisma.gameSession.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { startedAt: 'desc' },
      });
    } catch {}

    if (!activeSession) {
      activeSession = fallbackSessions.get(`${userId}:METAL_SORTING`);
      if (activeSession && activeSession.status !== 'ACTIVE') activeSession = null;
    }

    if (!activeSession || !activeSession.sessionState) {
      const error = new Error('No active Metal Sorting session found');
      error.statusCode = 404;
      throw error;
    }

    const sessionState = activeSession.sessionState;
    const targetStage = parseInt(stageNumber, 10);

    const progCheck = progressionValidator.validateStageProgression(sessionState.currentStage, targetStage, 4);
    if (!progCheck.valid) {
      const error = new Error(progCheck.error);
      error.statusCode = 400;
      throw error;
    }

    const validationResult = metalSortingEngine.validateStageSubmission(
      sessionState,
      targetStage,
      userSubmission
    );

    try {
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
    } catch {
      activeSession.score = sessionState.score;
      activeSession.livesRemaining = sessionState.livesRemaining;
      if (validationResult.failed) {
        activeSession.status = 'FAILED';
        activeSession.completedAt = new Date();
      }
    }

    const sanitizedState = metalSortingEngine.sanitizeConfigForClient(sessionState);

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

  async submitFinalFactoryState(userId, { timeSpentSec = 180 } = {}) {
    let activeSession = null;
    try {
      activeSession = await prisma.gameSession.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { startedAt: 'desc' },
      });
    } catch {}

    if (!activeSession) {
      activeSession = fallbackSessions.get(`${userId}:METAL_SORTING`);
      if (activeSession && activeSession.status !== 'ACTIVE') activeSession = null;
    }

    if (!activeSession || !activeSession.sessionState) {
      const error = new Error('No active Metal Sorting session found');
      error.statusCode = 404;
      throw error;
    }

    const sessionState = activeSession.sessionState;

    const calculatedStars = metalSortingEngine.calculateStars(
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
        gameState: { elementSortingAuditPassed: true },
      }
    );

    return {
      correct: true,
      completed: true,
      stageCompleted: true,
      unlocked: true,
      finalScore: sessionState.score,
      stars: calculatedStars,
      completionRewards: completionResult,
      message: 'Element Sorting Factory Audit Passed! Mission Complete.',
    };
  }
}

module.exports = new MetalSortingService();
