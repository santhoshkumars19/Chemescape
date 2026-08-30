const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const topicController = require('../controllers/topicController');
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// ── Chapter Read Endpoints (Students, Teachers, Admins) ──────────────────────
// GET /api/chapters/:chapterId
router.get('/:chapterId', authMiddleware, chapterController.getChapterById);

// GET /api/chapters/:chapterId/topics (Topic navigation)
router.get('/:chapterId/topics', authMiddleware, topicController.getTopicsByChapter);

// GET /api/chapters/:chapterId/rooms (Room navigation)
router.get('/:chapterId/rooms', authMiddleware, roomController.getRoomsByChapter);

// ── Chapter Mutation Endpoints (Teachers & Admins only) ───────────────────────
// POST /api/chapters
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), chapterController.createChapter);

// PUT /api/chapters/:id
router.put('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), chapterController.updateChapter);

// DELETE /api/chapters/:id
router.delete('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), chapterController.deleteChapter);

module.exports = router;
