const prisma = require('../config/db');
const roomService = require('./roomService');
const chapterUnlockService = require('./chapterUnlockService');

// Fallback in-memory stores for offline resilience
const fallbackUserStats = new Map(); // userId -> stats
const fallbackSessions = new Map();  // `${userId}:${roomId}` -> session
const fallbackBadges = new Map();    // `${userId}:${badgeName}` -> badge

class GameProgressService {
  /**
   * Every 1000 XP = 1 Level
   * 0-999 XP -> Level 1
   * 1000-1999 XP -> Level 2
   */
  calculateLevel(totalXP) {
    if (!totalXP || totalXP < 0) return 1;
    return Math.floor(totalXP / 1000) + 1;
  }

  /**
   * Get or initialize UserStats singleton for a student
   */
  async getOrCreateUserStats(userId, tx = prisma) {
    try {
      let stats = await tx.userStats.findUnique({
        where: { userId },
      });

      if (!stats) {
        stats = await tx.userStats.create({
          data: {
            userId,
            totalXP: 0,
            totalCoins: 0,
            currentLevel: 1,
            currentStreak: 1,
          },
        });
      }

      return stats;
    } catch {
      let stats = fallbackUserStats.get(userId);
      if (!stats) {
        stats = {
          userId,
          totalXP: 0,
          totalCoins: 0,
          currentLevel: 1,
          currentStreak: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        fallbackUserStats.set(userId, stats);
      }
      return stats;
    }
  }

  /**
   * GET /api/game/progress (Aggregated overall progress)
   */
  async getUserProgress(userId) {
    const stats = await this.getOrCreateUserStats(userId);

    let completedProgress = [];
    let totalRooms = 10;
    let badges = [];

    try {
      completedProgress = await prisma.userGameProgress.findMany({
        where: { userId, isCompleted: true },
        include: {
          room: {
            select: { id: true, name: true, roomNumber: true, gameType: true },
          },
        },
      });

      totalRooms = await prisma.room.count();
      badges = await prisma.userBadge.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' },
      });
    } catch {
      // In offline mode, get user badges
      badges = Array.from(fallbackBadges.values()).filter(b => b.userId === userId);
    }

    return {
      completedRooms: completedProgress.length,
      totalRooms,
      totalXP: stats.totalXP,
      totalCoins: stats.totalCoins,
      currentLevel: this.calculateLevel(stats.totalXP),
      currentStreak: stats.currentStreak,
      badgesCount: badges.length,
      badges,
      completedList: completedProgress,
    };
  }

  /**
   * GET /api/game/progress/:roomId (Specific room progress)
   */
  async getRoomProgress(userId, roomId) {
    let room;
    try {
      room = await roomService.getRoomById(roomId);
    } catch (err) {
      if (err.statusCode) throw err;
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    let progress = null;
    let activeSession = null;

    try {
      progress = await prisma.userGameProgress.findUnique({
        where: {
          userId_roomId: { userId, roomId },
        },
      });

      activeSession = await prisma.gameSession.findFirst({
        where: {
          userId,
          roomId,
          status: 'ACTIVE',
        },
        orderBy: { startedAt: 'desc' },
      });
    } catch {
      progress = await chapterUnlockService.getRoomProgress(userId, roomId);
      const sessionKey = `${userId}:${roomId}`;
      const session = fallbackSessions.get(sessionKey);
      if (session && session.status === 'ACTIVE') {
        activeSession = session;
      }
    }

    return {
      room,
      progress: progress || {
        isCompleted: false,
        highScore: 0,
        starsEarned: 0,
        attempts: 0,
        bestTimeSec: null,
      },
      activeSession: activeSession || null,
    };
  }

  /**
   * POST /api/game/progress/:roomId/start (Start or Resume active session)
   */
  async startGame(userId, roomId) {
    let room;
    try {
      room = await roomService.getRoomById(roomId);
    } catch (err) {
      if (err.statusCode) throw err;
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    try {
      // Check if an ACTIVE session already exists
      let activeSession = await prisma.gameSession.findFirst({
        where: {
          userId,
          roomId,
          status: 'ACTIVE',
        },
        orderBy: { startedAt: 'desc' },
      });

      if (activeSession) {
        return {
          session: activeSession,
          isResumed: true,
          message: 'Resumed existing active game session',
        };
      }

      // Create a new active GameSession
      activeSession = await prisma.gameSession.create({
        data: {
          userId,
          roomId,
          status: 'ACTIVE',
          score: 0,
          stars: 0,
          livesRemaining: 3,
        },
      });

      return {
        session: activeSession,
        isResumed: false,
        message: 'Started new game session',
      };
    } catch {
      // Fallback
      const sessionKey = `${userId}:${roomId}`;
      let activeSession = fallbackSessions.get(sessionKey);
      if (activeSession && activeSession.status === 'ACTIVE') {
        return {
          session: activeSession,
          isResumed: true,
          message: 'Resumed existing active game session',
        };
      }

      activeSession = {
        id: `sess-${Date.now()}`,
        userId,
        roomId,
        status: 'ACTIVE',
        score: 0,
        stars: 0,
        livesRemaining: 3,
        startedAt: new Date(),
      };
      fallbackSessions.set(sessionKey, activeSession);

      return {
        session: activeSession,
        isResumed: false,
        message: 'Started new game session',
      };
    }
  }

  /**
   * POST /api/game/progress/:roomId/save (Save mid-game state)
   */
  async saveGame(userId, roomId, { score = 0, livesRemaining = 3, gameState = null }) {
    let room;
    try {
      room = await roomService.getRoomById(roomId);
    } catch (err) {
      if (err.statusCode) throw err;
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    try {
      // Update active GameSession
      const activeSession = await prisma.gameSession.findFirst({
        where: { userId, roomId, status: 'ACTIVE' },
        orderBy: { startedAt: 'desc' },
      });

      if (activeSession) {
        await prisma.gameSession.update({
          where: { id: activeSession.id },
          data: {
            score,
            livesRemaining,
            sessionState: gameState,
          },
        });
      }

      // Save gameState to UserGameProgress
      const progress = await prisma.userGameProgress.upsert({
        where: {
          userId_roomId: { userId, roomId },
        },
        update: {
          gameState,
        },
        create: {
          userId,
          roomId,
          chapterId: room.chapterId,
          gameState,
        },
      });

      return {
        progress,
        message: 'Game state saved successfully',
      };
    } catch {
      const sessionKey = `${userId}:${roomId}`;
      const activeSession = fallbackSessions.get(sessionKey);
      if (activeSession) {
        activeSession.score = score;
        activeSession.livesRemaining = livesRemaining;
        activeSession.sessionState = gameState;
      }

      chapterUnlockService.recordFallbackProgress(userId, roomId, {
        chapterId: room.chapterId,
        gameState,
      });

      return {
        progress: { userId, roomId, gameState },
        message: 'Game state saved successfully',
      };
    }
  }

  /**
   * POST /api/game/progress/:roomId/complete (Atomically complete room with Prisma Transaction)
   */
  async completeGame(userId, roomId, { score, stars, timeSpentSec = 0, gameState = null }) {
    let room;
    try {
      room = await roomService.getRoomById(roomId);
    } catch (err) {
      if (err.statusCode) throw err;
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    if (stars < 0 || stars > 3) {
      const error = new Error('Stars must be between 0 and 3');
      error.statusCode = 400;
      throw error;
    }

    // SERVER-SIDE REWARD CALCULATION (Never trust client XP/coins)
    const baseXP = room.xpReward || 500;
    const baseCoins = room.coinReward || 100;
    const badgeName = `${room.title || room.name} Master`;
    const badgeDescription = `Completed ${room.title || room.name}`;
    const badgeIcon = '🏆';

    // Record fallback progress directly
    chapterUnlockService.recordFallbackProgress(userId, roomId, {
      chapterId: room.chapterId,
      isCompleted: true,
      highScore: score,
      starsEarned: stars,
      bestTimeSec: timeSpentSec,
    });

    try {
      // Execute ATOMIC PRISMA TRANSACTION for safety
      return await prisma.$transaction(async (tx) => {
        // 1. Get or create progress
        const existingProgress = await tx.userGameProgress.findUnique({
          where: { userId_roomId: { userId, roomId } },
        });

        const isFirstCompletion = !existingProgress || !existingProgress.isCompleted;

        // First completion -> 100% XP & Coins. Repeat completion -> 10% bonus XP, 0 coins, no duplicate badge.
        const awardedXP = isFirstCompletion ? baseXP : Math.floor(baseXP * 0.1);
        const awardedCoins = isFirstCompletion ? baseCoins : 0;

        const newHighScore = existingProgress
          ? Math.max(existingProgress.highScore, score)
          : score;

        const newStars = existingProgress
          ? Math.max(existingProgress.starsEarned, stars)
          : stars;

        const newBestTime = existingProgress?.bestTimeSec
          ? Math.min(existingProgress.bestTimeSec, timeSpentSec || existingProgress.bestTimeSec)
          : timeSpentSec;

        const updatedProgress = await tx.userGameProgress.upsert({
          where: { userId_roomId: { userId, roomId } },
          update: {
            isCompleted: true,
            highScore: newHighScore,
            starsEarned: newStars,
            bestTimeSec: newBestTime,
            attempts: { increment: 1 },
            gameState: null,
          },
          create: {
            userId,
            roomId,
            chapterId: room.chapterId,
            isCompleted: true,
            highScore: score,
            starsEarned: stars,
            bestTimeSec: timeSpentSec,
            attempts: 1,
          },
        });

        // 2. Mark GameSession as COMPLETED
        const activeSession = await tx.gameSession.findFirst({
          where: { userId, roomId, status: 'ACTIVE' },
          orderBy: { startedAt: 'desc' },
        });

        if (activeSession) {
          await tx.gameSession.update({
            where: { id: activeSession.id },
            data: {
              status: 'COMPLETED',
              score,
              stars,
              timeSpentSec,
              completedAt: new Date(),
            },
          });
        }

        // 3. Update UserStats (XP, Coins, Level)
        const userStats = await this.getOrCreateUserStats(userId, tx);
        const newTotalXP = userStats.totalXP + awardedXP;
        const newTotalCoins = userStats.totalCoins + awardedCoins;
        const newLevel = this.calculateLevel(newTotalXP);

        const updatedStats = await tx.userStats.update({
          where: { userId },
          data: {
            totalXP: newTotalXP,
            totalCoins: newTotalCoins,
            currentLevel: newLevel,
          },
        });

        // 4. Award Badge (First completion only)
        let unlockedBadge = null;
        if (isFirstCompletion && badgeName) {
          unlockedBadge = await tx.userBadge.upsert({
            where: { userId_badgeName: { userId, badgeName } },
            update: {},
            create: {
              userId,
              badgeName,
              badgeDescription,
              badgeIcon,
            },
          });
        }

        return {
          isFirstCompletion,
          awardedXP,
          awardedCoins,
          badgeUnlocked: unlockedBadge,
          progress: updatedProgress,
          stats: updatedStats,
        };
      });
    } catch {
      // In offline mode
      const sessionKey = `${userId}:${roomId}`;
      const session = fallbackSessions.get(sessionKey);
      if (session) {
        session.status = 'COMPLETED';
        session.score = score;
        session.stars = stars;
        session.timeSpentSec = timeSpentSec;
      }

      const stats = await this.getOrCreateUserStats(userId);
      const isFirst = !fallbackBadges.has(`${userId}:${badgeName}`);
      const awardedXP = isFirst ? baseXP : Math.floor(baseXP * 0.1);
      const awardedCoins = isFirst ? baseCoins : 0;

      stats.totalXP += awardedXP;
      stats.totalCoins += awardedCoins;
      stats.currentLevel = this.calculateLevel(stats.totalXP);

      let badge = null;
      if (isFirst) {
        badge = { userId, badgeName, badgeDescription, badgeIcon, unlockedAt: new Date() };
        fallbackBadges.set(`${userId}:${badgeName}`, badge);
      }

      return {
        isFirstCompletion: isFirst,
        awardedXP,
        awardedCoins,
        badgeUnlocked: badge,
        progress: {
          userId,
          roomId,
          chapterId: room.chapterId,
          isCompleted: true,
          highScore: score,
          starsEarned: stars,
          bestTimeSec: timeSpentSec,
        },
        stats,
      };
    }
  }

  /**
   * POST /api/game/progress/:roomId/fail (Mark session failed)
   */
  async failGame(userId, roomId, { score = 0, timeSpentSec = 0, gameState = null }) {
    let room;
    try {
      room = await roomService.getRoomById(roomId);
    } catch (err) {
      if (err.statusCode) throw err;
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    if (!room) {
      const error = new Error('Room not found');
      error.statusCode = 404;
      throw error;
    }

    try {
      const activeSession = await prisma.gameSession.findFirst({
        where: { userId, roomId, status: 'ACTIVE' },
        orderBy: { startedAt: 'desc' },
      });

      if (activeSession) {
        await prisma.gameSession.update({
          where: { id: activeSession.id },
          data: {
            status: 'FAILED',
            score,
            timeSpentSec,
            completedAt: new Date(),
          },
        });
      }

      const progress = await prisma.userGameProgress.upsert({
        where: { userId_roomId: { userId, roomId } },
        update: {
          attempts: { increment: 1 },
          gameState: null,
        },
        create: {
          userId,
          roomId,
          chapterId: room.chapterId,
          isCompleted: false,
          attempts: 1,
        },
      });

      return {
        status: 'FAILED',
        progress,
        message: 'Game session marked as failed. You can retry anytime.',
      };
    } catch {
      const sessionKey = `${userId}:${roomId}`;
      const session = fallbackSessions.get(sessionKey);
      if (session) {
        session.status = 'FAILED';
        session.score = score;
        session.timeSpentSec = timeSpentSec;
      }

      chapterUnlockService.recordFallbackProgress(userId, roomId, {
        chapterId: room.chapterId,
        isCompleted: false,
      });

      return {
        status: 'FAILED',
        progress: { userId, roomId, isCompleted: false, attempts: 1 },
        message: 'Game session marked as failed. You can retry anytime.',
      };
    }
  }
}

module.exports = new GameProgressService();
