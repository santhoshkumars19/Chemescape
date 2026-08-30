const prisma = require('../../config/db');
const hydrogenReactorEngine = require('./hydrogenReactorEngine');
const gameProgressService = require('../gameProgressService');
const progressionValidator = require('./validation/progressionValidator');

const fallbackSessions = new Map();

class HydrogenReactorService {
  async startHydrogenSession(userId, roomId = null) {
    let room = null;
    if (roomId) {
      try { room = await prisma.room.findUnique({ where: { id: roomId } }); } catch {}
    }
    if (!room) {
      try {
        room = await prisma.room.findFirst({ where: { gameType: 'HYDROGEN_REACTOR' } });
      } catch {}
    }
    if (!room) {
      room = { id: 'room-4', name: 'Hydrogen Reactor Core', gameType: 'HYDROGEN_REACTOR' };
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
      activeSession = fallbackSessions.get(`${userId}:HYDROGEN_REACTOR`);
      if (activeSession && activeSession.status !== 'ACTIVE') activeSession = null;
    }

    const sessionState = hydrogenReactorEngine.generateSessionConfig();

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
        id: `fb-hydrogen-${Date.now()}`,
        userId,
        roomId: room.id,
        status: 'ACTIVE',
        score: 0,
        stars: 0,
        livesRemaining: sessionState.livesRemaining,
        sessionState,
        startedAt: new Date(),
      };
      fallbackSessions.set(`${userId}:HYDROGEN_REACTOR`, activeSession);
    }

    const sanitizedState = hydrogenReactorEngine.sanitizeConfigForClient(sessionState);

    return {
      sessionId: activeSession.id,
      roomId: room.id,
      roomName: room.name,
      gameState: sanitizedState,
    };
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
      activeSession = fallbackSessions.get(`${userId}:HYDROGEN_REACTOR`);
      if (activeSession && activeSession.status !== 'ACTIVE') activeSession = null;
    }

    if (!activeSession || !activeSession.sessionState) {
      const error = new Error('No active Hydrogen Reactor session found');
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

    const validationResult = hydrogenReactorEngine.validateStageSubmission(
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

    const sanitizedState = hydrogenReactorEngine.sanitizeConfigForClient(sessionState);

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

  async submitFinalReactorState(userId, { timeSpentSec = 180 } = {}) {
    let activeSession = null;
    try {
      activeSession = await prisma.gameSession.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { startedAt: 'desc' },
      });
    } catch {}

    if (!activeSession) {
      activeSession = fallbackSessions.get(`${userId}:HYDROGEN_REACTOR`);
      if (activeSession && activeSession.status !== 'ACTIVE') activeSession = null;
    }

    if (!activeSession || !activeSession.sessionState) {
      const error = new Error('No active Hydrogen Reactor session found');
      error.statusCode = 404;
      throw error;
    }

    const sessionState = activeSession.sessionState;

    const calculatedStars = hydrogenReactorEngine.calculateStars(
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
        gameState: { reactorCoreStabilized: true },
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
      message: 'Hydrogen Reactor Core Stabilized! Mission Complete.',
    };
  }
}

module.exports = new HydrogenReactorService();
