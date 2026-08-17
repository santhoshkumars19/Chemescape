const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const { createQuestionSchema, validate } = require('../validators/contentValidator');

// GET /api/questions (All authenticated users / teachers)
router.get('/', authMiddleware, questionController.getAllQuestions);

// GET /api/questions/:id
router.get('/:id', authMiddleware, questionController.getQuestionById);

// POST /api/questions (TEACHER, ADMIN only)
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), validate(createQuestionSchema), questionController.createQuestion);

// PUT /api/questions/:id (TEACHER, ADMIN only)
router.put('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), questionController.updateQuestion);

// DELETE /api/questions/:id (TEACHER, ADMIN only)
router.delete('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), questionController.deleteQuestion);

module.exports = router;
