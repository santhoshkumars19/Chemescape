const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// ── Topic Read Endpoints (Students, Teachers, Admins) ──────────────────────
// GET /api/topics/:id
router.get('/:id', authMiddleware, topicController.getTopicById);

// ── Topic Mutation Endpoints (Teachers & Admins only) ───────────────────────
// POST /api/topics
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), topicController.createTopic);

// PUT /api/topics/:id
router.put('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), topicController.updateTopic);

// DELETE /api/topics/:id
router.delete('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), topicController.deleteTopic);

module.exports = router;
