const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { createRoomSchema, validate } = require('../validators/contentValidator');

// GET /api/rooms/:roomId/questions
router.get('/:roomId/questions', authMiddleware, questionController.getQuestionsByRoom);

// POST /api/rooms (TEACHER, ADMIN only)
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), validate(createRoomSchema), roomController.createRoom);

module.exports = router;
