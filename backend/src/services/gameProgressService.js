const prisma = require('../config/db');
const roomService = require('./roomService');
const chapterUnlockService = require('./chapterUnlockService');
const GAME_PROGRESS_CONFIG = require('../config/gameProgressConfig');

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
   *
   * Enforces server-authoritative Pass/Fail threshold:
   * - Generic Chapter Quiz: requires minimum 7/10 score (or configured threshold) to pass
   * - Pass (>= 7/10): marks room completed, unlocks next chapter, awards rewards
   * - Fail (< 7/10): marks attempt failed, next chapter remains locked, requires retry
   * - Replay Safety: if room was already completed previously, a lower replay score
   *   does NOT relock the chapter or undo existing completion status.
   */
  async completeGame(userId, roomId, { score = 0, stars = 0, timeSpentSec = 0, gameState = null }) {
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

    // Determine if this is a generic chapter quiz or a specialized chemistry game engine
    const isGenericQuiz = !room.gameType || room.gameType === 'GENERIC_CHAPTER_QUIZ' || room.gameType === 'GENERIC_QUIZ';

    let evalResult;
    if (isGenericQuiz) {
      const totalQuestions = gameState?.answeredQuestions ?? gameState?.totalQuestions ?? room.questionCount ?? GAME_PROGRESS_CONFIG.DEFAULT_TOTAL_QUESTIONS;
      let correctCount;
      if (gameState?.correctAnswers !== undefined && gameState?.correctAnswers !== null) {
        correctCount = Number(gameState.correctAnswers);
      } else if (score <= totalQuestions) {
        correctCount = Number(score);
      } else {
        correctCount = Math.round(Number(score) / 100);
      }
      evalResult = GAME_PROGRESS_CONFIG.evaluatePass(correctCount, totalQuestions, room.minimumPassScore);
    } else {
      // Specialized Chemistry games (Calculation Heist, Quantum Architect, Periodic Grid, Hydrogen Reactor, Metal Sorting, Gas Simulator)
      evalResult = {
        passed: true,
        score: score,
        totalQuestions: 10,
        minimumPassScore: 7,
        accuracyPercent: 100,
        retryRequired: false,
      };
    }

    const passed = evalResult.passed;

    // SERVER-SIDE REWARD CALCULATION (Never trust client XP/coins)
    const baseXP = room.xpReward || 500;
    const baseCoins = room.coinReward || 100;
    const badgeName = `${room.title || room.name} Master`;
    const badgeDescription = `Completed ${room.title || room.name}`;
    const badgeIcon = '🏆';

    try {
      // Execute ATOMIC PRISMA TRANSACTION for safety
      return await prisma.$transaction(async (tx) => {
        // 1. Get existing progress
        const existingProgress = await tx.userGameProgress.findUnique({
          where: { userId_roomId: { userId, roomId } },
        });

        const wasAlreadyCompleted = Boolean(existingProgress && existingProgress.isCompleted);

        // ── CASE A: Failed Attempt (score < 7/10) ────────────────────────────
        if (!passed) {
          if (wasAlreadyCompleted) {
            // Replay after prior pass: preserve completion status, do not relock!
            const newHighScore = Math.max(existingProgress.highScore, score);
            const updatedProgress = await tx.userGameProgress.update({
              where: { userId_roomId: { userId, roomId } },
              data: {
                highScore: newHighScore,
                attempts: { increment: 1 },
              },
            });
            const userStats = await this.getOrCreateUserStats(userId, tx);

            chapterUnlockService.recordFallbackProgress(userId, roomId, {
              chapterId: room.chapterId,
              isCompleted: true,
              highScore: newHighScore,
            });

            return {
              completed: true,
              passed: false,
              score: evalResult.score,
              totalQuestions: evalResult.totalQuestions,
              minimumPassScore: evalResult.minimumPassScore,
              retryRequired: true,
              nextChapterUnlocked: true,
              isFirstCompletion: false,
              awardedXP: 0,
              awardedCoins: 0,
              badgeUnlocked: null,
              progress: updatedProgress,
              stats: userStats,
              message: `Attempt score (${evalResult.score}/${evalResult.totalQuestions}) did not meet pass threshold (${evalResult.minimumPassScore}/${evalResult.totalQuestions}). Replay required to improve score.`,
            };
          }

          // Fresh attempt failed: do NOT mark complete, next chapter remains locked!
          const updatedProgress = await tx.userGameProgress.upsert({
            where: { userId_roomId: { userId, roomId } },
            update: {
              isCompleted: false,
              highScore: Math.max(existingProgress?.highScore || 0, score),
              starsEarned: Math.max(existingProgress?.starsEarned || 0, stars),
              attempts: { increment: 1 },
              gameState: null,
            },
            create: {
              userId,
              roomId,
              chapterId: room.chapterId,
              isCompleted: false,
              highScore: score,
              starsEarned: stars,
              bestTimeSec: timeSpentSec,
              attempts: 1,
            },
          });

          // Mark active session as FAILED
          const activeSession = await tx.gameSession.findFirst({
            where: { userId, roomId, status: 'ACTIVE' },
            orderBy: { startedAt: 'desc' },
          });

          if (activeSession) {
            await tx.gameSession.update({
              where: { id: activeSession.id },
              data: {
                status: 'FAILED',
                score,
                stars,
                timeSpentSec,
                completedAt: new Date(),
              },
            });
          }

          const userStats = await this.getOrCreateUserStats(userId, tx);

          chapterUnlockService.recordFallbackProgress(userId, roomId, {
            chapterId: room.chapterId,
            isCompleted: false,
            highScore: score,
            starsEarned: stars,
            bestTimeSec: timeSpentSec,
          });

          return {
            completed: false,
            passed: false,
            score: evalResult.score,
            totalQuestions: evalResult.totalQuestions,
            minimumPassScore: evalResult.minimumPassScore,
            retryRequired: true,
            nextChapterUnlocked: false,
            isFirstCompletion: false,
            awardedXP: 0,
            awardedCoins: 0,
            badgeUnlocked: null,
            progress: updatedProgress,
            stats: userStats,
            message: `Mission not passed. Score was ${evalResult.score}/${evalResult.totalQuestions}. Complete at least ${evalResult.minimumPassScore}/${evalResult.totalQuestions} questions to unlock the next chapter.`,
          };
        }

        // ── CASE B: Passed Attempt (score >= 7/10) ───────────────────────────
        const isFirstCompletion = !wasAlreadyCompleted;

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

        // Mark GameSession as COMPLETED
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

        // Update UserStats (XP, Coins, Level)
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

        // Award Badge (First completion only)
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

        chapterUnlockService.recordFallbackProgress(userId, roomId, {
          chapterId: room.chapterId,
          isCompleted: true,
          highScore: newHighScore,
          starsEarned: newStars,
          bestTimeSec: newBestTime,
        });

        return {
          completed: true,
          passed: true,
          score: evalResult.score,
          totalQuestions: evalResult.totalQuestions,
          minimumPassScore: evalResult.minimumPassScore,
          retryRequired: false,
          nextChapterUnlocked: true,
          isFirstCompletion,
          awardedXP,
          awardedCoins,
          badgeUnlocked: unlockedBadge,
          progress: updatedProgress,
          stats: updatedStats,
          message: isFirstCompletion
            ? 'Congratulations! Room completed and rewards unlocked!'
            : 'Room re-cleared successfully!',
        };
      });
    } catch (err) {
      if (err.statusCode) throw err;
      // In offline mode
      const sessionKey = `${userId}:${roomId}`;
      const session = fallbackSessions.get(sessionKey);
      const existingFallback = await chapterUnlockService.getRoomProgress(userId, roomId);
      const wasAlreadyCompleted = Boolean(existingFallback && existingFallback.isCompleted);

      // ── OFFLINE CASE A: Failed Attempt ──
      if (!passed) {
        if (session) {
          session.status = 'FAILED';
          session.score = score;
          session.stars = stars;
          session.timeSpentSec = timeSpentSec;
        }

        const stats = await this.getOrCreateUserStats(userId);

        chapterUnlockService.recordFallbackProgress(userId, roomId, {
          chapterId: room.chapterId,
          isCompleted: wasAlreadyCompleted,
          highScore: Math.max(existingFallback?.highScore || 0, score),
          starsEarned: Math.max(existingFallback?.starsEarned || 0, stars),
          bestTimeSec: timeSpentSec,
        });

        return {
          completed: wasAlreadyCompleted,
          passed: false,
          score: evalResult.score,
          totalQuestions: evalResult.totalQuestions,
          minimumPassScore: evalResult.minimumPassScore,
          retryRequired: true,
          nextChapterUnlocked: wasAlreadyCompleted,
          isFirstCompletion: false,
          awardedXP: 0,
          awardedCoins: 0,
          badgeUnlocked: null,
          progress: {
            userId,
            roomId,
            chapterId: room.chapterId,
            isCompleted: wasAlreadyCompleted,
            highScore: Math.max(existingFallback?.highScore || 0, score),
            starsEarned: Math.max(existingFallback?.starsEarned || 0, stars),
            bestTimeSec: timeSpentSec,
          },
          stats,
          message: `Mission not passed. Score was ${evalResult.score}/${evalResult.totalQuestions}. Complete at least ${evalResult.minimumPassScore}/${evalResult.totalQuestions} questions to unlock the next chapter.`,
        };
      }

      // ── OFFLINE CASE B: Passed Attempt ──
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

      chapterUnlockService.recordFallbackProgress(userId, roomId, {
        chapterId: room.chapterId,
        isCompleted: true,
        highScore: score,
        starsEarned: stars,
        bestTimeSec: timeSpentSec,
      });

      return {
        completed: true,
        passed: true,
        score: evalResult.score,
        totalQuestions: evalResult.totalQuestions,
        minimumPassScore: evalResult.minimumPassScore,
        retryRequired: false,
        nextChapterUnlocked: true,
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
        message: isFirst
          ? 'Congratulations! Room completed and rewards unlocked!'
          : 'Room re-cleared successfully!',
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
