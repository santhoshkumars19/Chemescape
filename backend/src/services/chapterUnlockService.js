const fs = require('fs');
const path = require('path');
const prisma = require('../config/db');
const standardService = require('./standardService');
const subjectService = require('./subjectService');
const chapterService = require('./chapterService');
const roomService = require('./roomService');

// ─────────────────────────────────────────────────────────────────────────────
// File-backed fallback progress store
//
// When Prisma/MySQL is unreachable we persist user game progress to a local
// JSON file so that chapter unlock state survives server restarts (critical on
// Render free tier which spins down after inactivity).
//
// File: backend/data/user_game_progress.json
// Structure: Array of progress objects { userId, roomId, chapterId,
//            isCompleted, highScore, starsEarned, bestTimeSec, attempts,
//            updatedAt }
// ─────────────────────────────────────────────────────────────────────────────

const PROGRESS_FILE = path.resolve(__dirname, '../../data/user_game_progress.json');

// In-memory index for fast look-up: key = `${userId}:${roomId}`
const fallbackUserProgress = new Map();

/** Load persisted progress from JSON file into the in-memory map on boot. */
function loadProgressFile() {
  try {
    if (!fs.existsSync(PROGRESS_FILE)) {
      fs.writeFileSync(PROGRESS_FILE, '[]', 'utf8');
    }
    const raw = fs.readFileSync(PROGRESS_FILE, 'utf8');
    const records = JSON.parse(raw);
    if (Array.isArray(records)) {
      records.forEach((r) => {
        if (r.userId && r.roomId) {
          fallbackUserProgress.set(`${r.userId}:${r.roomId}`, r);
        }
      });
    }
    console.log(`[ChapterUnlock] Loaded ${fallbackUserProgress.size} offline progress record(s) from file.`);
  } catch (err) {
    console.warn('[ChapterUnlock] Could not load progress file — starting fresh:', err.message);
  }
}

/** Flush the in-memory map back to the JSON file. Called after every write. */
function saveProgressFile() {
  try {
    const records = Array.from(fallbackUserProgress.values());
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(records, null, 2), 'utf8');
  } catch (err) {
    console.warn('[ChapterUnlock] Could not persist progress file:', err.message);
  }
}

// Boot-time load
loadProgressFile();

class ChapterUnlockService {
  /**
   * Save (upsert) progress in the file-backed fallback store.
   * Called both when Prisma is offline AND after every successful Prisma write
   * so the file acts as a warm cache.
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
    const updated = {
      ...existing,
      ...data,
      userId,
      roomId,
      attempts: (existing.attempts || 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    fallbackUserProgress.set(key, updated);
    saveProgressFile();
  }

  /**
   * Get progress for a specific user and room.
   * Tries Prisma first; falls back to the file-backed map.
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
   * Check if a specific room is completed by a user (score >= 7/10).
   * A room is only considered completed when isCompleted === true,
   * which is only set when the user passes with >= 7/10.
   */
  async isRoomCompleted(userId, roomId) {
    const progress = await this.getRoomProgress(userId, roomId);
    return Boolean(progress && progress.isCompleted);
  }

  /**
   * Check if all required rooms of a chapter are completed by a user.
   * All rooms in the chapter must have isCompleted === true.
   */
  async isChapterCompleted(userId, chapterId) {
    const rooms = await roomService.getRoomsByChapter(chapterId, { includeInactive: false });
    if (!rooms || rooms.length === 0) {
      return false;
    }

    for (const r of rooms) {
      const completed = await this.isRoomCompleted(userId, r.id);
      if (!completed) return false;
    }
    return true;
  }

  /**
   * Get unlock status of all chapters for a given Standard + Subject for a
   * specific User.
   *
   * Unlock rule (enforced here AND in gameProgressService.completeGame):
   *   • Chapter 1 is always unlocked.
   *   • Chapter N unlocks only after Chapter N-1 is COMPLETED.
   *   • A chapter is COMPLETED only when ALL its rooms are completed.
   *   • A room is completed only when the user scored >= 7/10 on its quiz.
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

      // Chapter completed = all rooms completed (each room required score >= 7/10)
      const isCompleted = totalRooms > 0 && completedRooms === totalRooms;
      const isFirstChapter = (i === 0);
      // Next chapter unlocks only if the PREVIOUS chapter is fully completed
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

      // Next chapter unlock condition: this chapter must be fully COMPLETED
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
   * Check if a specific chapter is unlocked for a user.
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
// Expose the map so gameProgressService can reference it (existing contract)
service.fallbackUserProgress = fallbackUserProgress;
module.exports = service;
