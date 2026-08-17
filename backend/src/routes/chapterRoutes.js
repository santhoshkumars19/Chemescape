const express = require('express');
const router = express.Router();
const chapterController = require('../controllers/chapterController');
const topicController = require('../controllers/topicController');
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { createChapterSchema, validate } = require('../validators/contentValidator');

// GET /api/chapters/:chapterId
router.get('/:chapterId', authMiddleware, chapterController.getChapterById);

// GET /api/chapters/:chapterId/topics
router.get('/:chapterId/topics', authMiddleware, topicController.getTopicsByChapter);

// GET /api/chapters/:chapterId/rooms
router.get('/:chapterId/rooms', authMiddleware, roomController.getRoomsByChapter);

// POST /api/chapters (TEACHER, ADMIN only)
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), validate(createChapterSchema), chapterController.createChapter);

// PUT /api/chapters/:id (TEACHER, ADMIN only)
router.put('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), chapterController.updateChapter);

module.exports = router;
