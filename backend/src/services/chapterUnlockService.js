const prisma = require('../config/db');
const standardService = require('./standardService');
const subjectService = require('./subjectService');
const chapterService = require('./chapterService');
const roomService = require('./roomService');

// In-memory fallback user progress store for offline resilience
// Key: `${userId}:${roomId}` -> progress object
const fallbackUserProgress = new Map();

class ChapterUnlockService {
  /**
   * Save progress in fallback store if DB is offline
   */
  recordFallbackProgress(userId, roomId, data) {
    const key = `${userId}:${roomId}`;
    const existing = fallbackUserProgress.get(key) || {
      userId,
      roomId,
      isCompleted: false,
      highScore: 0,
      starsEarned: 0,
      attempts: 0,
    };
    fallbackUserProgress.set(key, {
      ...existing,
      ...data,
      attempts: (existing.attempts || 0) + 1,
      updatedAt: new Date(),
    });
  }

  /**
   * Get progress for a specific user and room
   */
  async getRoomProgress(userId, roomId) {
    try {
      const progress = await prisma.userGameProgress.findUnique({
        where: { userId_roomId: { userId, roomId } },
      });
      if (progress) return progress;
    } catch {
      /* fallback below */
    }
    const key = `${userId}:${roomId}`;
    return fallbackUserProgress.get(key) || null;
  }

  /**
   * Check if a specific room is completed by a user
   */
  async isRoomCompleted(userId, roomId) {
    const progress = await this.getRoomProgress(userId, roomId);
    return Boolean(progress && progress.isCompleted);
  }

  /**
   * Check if all required rooms of a chapter are completed by a user
   */
  async isChapterCompleted(userId, chapterId) {
    const rooms = await roomService.getRoomsByChapter(chapterId, { includeInactive: false });
    if (!rooms || rooms.length === 0) {
      // If a chapter has no rooms yet, treat as not completed unless specifically marked
      return false;
    }

    for (const r of rooms) {
      const completed = await this.isRoomCompleted(userId, r.id);
      if (!completed) return false;
    }
    return true;
  }

  /**
   * Get unlock status of all chapters for a given Standard + Subject for a specific User
   */
  async getUnlockedChapters(userId, standardId, subjectId) {
    // 1. Validate Standard
    let standard;
    try {
      standard = await standardService.getStandardById(standardId);
    } catch (err) {
      if (err.statusCode) throw err;
      const error = new Error('Standard not found');
      error.statusCode = 404;
      throw error;
    }

    // 2. Validate Subject & Mapping to Standard
    let subject;
    try {
      subject = await subjectService.getSubjectById(subjectId);
    } catch (err) {
      if (err.statusCode) throw err;
      const error = new Error('Subject not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify Standard-Subject mapping
    const isMapped = await subjectService.isSubjectMappedToStandard(standard.id, subject.id);
    if (!isMapped) {
      const error = new Error(`Subject '${subject.code || subject.name}' is not offered in Standard ${standard.grade || standard.name}`);
      error.statusCode = 400;
      throw error;
    }

    // 3. Load active chapters ordered by chapterNumber ascending
    let chapters = [];
    try {
      chapters = await chapterService.getChaptersByStandardAndSubject(standard.id, subject.id);
    } catch {
      chapters = [];
    }

    if (!chapters || chapters.length === 0) {
      return {
        chapters: [],
        totalChapters: 0,
        completedChapters: 0,
        progressPercent: 0,
        mastered: false,
      };
    }

    // Deterministic sort by chapterNumber
    chapters.sort((a, b) => (a.chapterNumber || a.orderNumber || 0) - (b.chapterNumber || b.orderNumber || 0));

    // 4. Calculate user-specific unlock & completion status sequentially
    const chapterStatuses = [];
    let completedCount = 0;
    let previousChapterCompleted = true; // First chapter is always unlocked

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      const rooms = await roomService.getRoomsByChapter(ch.id, { includeInactive: false });
      const totalRooms = rooms.length;

      let completedRooms = 0;
      for (const r of rooms) {
        const isDone = await this.isRoomCompleted(userId, r.id);
        if (isDone) completedRooms++;
      }

      const isCompleted = totalRooms > 0 && completedRooms === totalRooms;
      const isFirstChapter = (i === 0);
      const isUnlocked = isFirstChapter || previousChapterCompleted;

      let status = 'LOCKED';
      let progressPercent = 0;

      if (isCompleted) {
        status = 'COMPLETED';
        progressPercent = 100;
        completedCount++;
      } else if (isUnlocked) {
        if (completedRooms > 0 && totalRooms > 0) {
          status = 'IN_PROGRESS';
          progressPercent = Math.round((completedRooms / totalRooms) * 100);
        } else {
          status = 'UNLOCKED';
          progressPercent = 0;
        }
      } else {
        status = 'LOCKED';
        progressPercent = 0;
      }

      chapterStatuses.push({
        chapterId: ch.id,
        chapterNumber: ch.chapterNumber ?? (i + 1),
        title: ch.title,
        description: ch.description,
        status,
        unlocked: isUnlocked,
        isCompleted,
        progress: progressPercent,
        completedRooms,
        totalRooms,
        difficulty: ch.difficulty,
        xpReward: ch.xpReward,
        coinReward: ch.coinReward,
        badgeName: ch.badgeName,
      });

      // Next chapter unlock condition: this chapter must be COMPLETED
      previousChapterCompleted = isCompleted;
    }

    const totalChapters = chapters.length;
    const overallProgressPercent = totalChapters > 0
      ? Math.round((completedCount / totalChapters) * 100)
      : 0;

    const mastered = completedCount === totalChapters && totalChapters > 0;

    return {
      chapters: chapterStatuses,
      totalChapters,
      completedChapters: completedCount,
      progressPercent: overallProgressPercent,
      mastered,
    };
  }

  /**
   * Check if a specific chapter is unlocked for a user
   */
  async isChapterUnlocked(userId, chapterId) {
    const chapter = await chapterService.getChapterById(chapterId);
    if (!chapter) return false;

    const { chapters } = await this.getUnlockedChapters(userId, chapter.standardId, chapter.subjectId);
    const target = chapters.find(c => c.chapterId === chapter.id || c.chapterId === chapterId);
    return Boolean(target && target.unlocked);
  }
}

const service = new ChapterUnlockService();
service.fallbackUserProgress = fallbackUserProgress;
module.exports = service;
