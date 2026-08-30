const prisma = require('../../config/db');
const calculationHeistEngine = require('./calculationHeistEngine');
const gameProgressService = require('../gameProgressService');
const progressionValidator = require('./validation/progressionValidator');

const fallbackSessions = new Map();

class CalculationHeistService {
  async startHeistSession(userId, roomId = null) {
    let room = null;
    if (roomId) {
      try { room = await prisma.room.findUnique({ where: { id: roomId } }); } catch {}
    }
    if (!room) {
      try {
        room = await prisma.room.findFirst({ where: { gameType: 'CALCULATION_HEIST' } });
      } catch {}
    }
    if (!room) {
      room = { id: 'room-1', name: 'Calculation Heist', gameType: 'CALCULATION_HEIST' };
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
      activeSession = fallbackSessions.get(`${userId}:CALCULATION_HEIST`);
      if (activeSession && activeSession.status !== 'ACTIVE') activeSession = null;
    }

    const sessionState = calculationHeistEngine.generateSessionConfig();

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
        id: `fb-heist-${Date.now()}`,
        userId,
        roomId: room.id,
        status: 'ACTIVE',
        score: 0,
        stars: 0,
        livesRemaining: sessionState.livesRemaining,
        sessionState,
        startedAt: new Date(),
      };
      fallbackSessions.set(`${userId}:CALCULATION_HEIST`, activeSession);
    }

    const sanitizedState = calculationHeistEngine.sanitizeConfigForClient(sessionState);

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
      activeSession = fallbackSessions.get(`${userId}:CALCULATION_HEIST`);
      if (activeSession && activeSession.status !== 'ACTIVE') activeSession = null;
    }

    if (!activeSession || !activeSession.sessionState) {
      const error = new Error('No active Calculation Heist session found');
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

    const validationResult = calculationHeistEngine.validateStageSubmission(
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

    const sanitizedState = calculationHeistEngine.sanitizeConfigForClient(sessionState);

    return {
      correct: validationResult.correct,
      stageCompleted: validationResult.correct,
      codeDigit: validationResult.codeDigit || null,
      nextStage: validationResult.nextStage || sessionState.currentStage,
      score: sessionState.score,
      livesRemaining: sessionState.livesRemaining,
      explanation: validationResult.explanation,
      failed: !!validationResult.failed,
      gameState: sanitizedState,
    };
  }

  async submitFinalVaultCode(userId, { code, timeSpentSec = 180 }) {
    let activeSession = null;
    try {
      activeSession = await prisma.gameSession.findFirst({
        where: { userId, status: 'ACTIVE' },
        orderBy: { startedAt: 'desc' },
      });
    } catch {}

    if (!activeSession) {
      activeSession = fallbackSessions.get(`${userId}:CALCULATION_HEIST`);
      if (activeSession && activeSession.status !== 'ACTIVE') activeSession = null;
    }

    if (!activeSession || !activeSession.sessionState) {
      const error = new Error('No active Calculation Heist session found');
      error.statusCode = 404;
      throw error;
    }

    const sessionState = activeSession.sessionState;

    const validationResult = calculationHeistEngine.validateVaultCode(sessionState, code);

    if (!validationResult.unlocked) {
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
              livesRemaining: sessionState.livesRemaining,
              sessionState,
            },
          });
        }
      } catch {
        activeSession.livesRemaining = sessionState.livesRemaining;
        if (validationResult.failed) {
          activeSession.status = 'FAILED';
          activeSession.completedAt = new Date();
        }
      }

      return {
        correct: false,
        stageCompleted: false,
        unlocked: false,
        livesRemaining: sessionState.livesRemaining,
        failed: !!validationResult.failed,
        message: 'Incorrect Vault Code! Alarm triggered.',
      };
    }

    const calculatedStars = calculationHeistEngine.calculateStars(
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
        gameState: { vaultUnlocked: true },
      }
    );

    return {
      correct: true,
      stageCompleted: true,
      unlocked: true,
      finalScore: sessionState.score,
      stars: calculatedStars,
      completionRewards: completionResult,
      message: 'Vault override successful! Mission Complete.',
    };
  }
}

module.exports = new CalculationHeistService();
