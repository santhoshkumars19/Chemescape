const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// ── Room Read Endpoints (Students, Teachers, Admins) ────────────────────────
// GET /api/rooms/:id
router.get('/:id', authMiddleware, roomController.getRoomById);

// GET /api/rooms/:roomId/questions (Question navigation)
router.get('/:roomId/questions', authMiddleware, questionController.getQuestionsByRoom);

// ── Room Mutation Endpoints (Teachers & Admins only) ─────────────────────────
// POST /api/rooms
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), roomController.createRoom);

// PUT /api/rooms/:id
router.put('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), roomController.updateRoom);

// DELETE /api/rooms/:id
router.delete('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), roomController.deleteRoom);

module.exports = router;
