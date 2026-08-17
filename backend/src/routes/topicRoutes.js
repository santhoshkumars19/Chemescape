const express = require('express');
const router = express.Router();
const topicController = require('../controllers/topicController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { createTopicSchema, validate } = require('../validators/contentValidator');

// POST /api/topics (TEACHER, ADMIN only)
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), validate(createTopicSchema), topicController.createTopic);

module.exports = router;
