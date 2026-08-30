const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// ── Question Management & Lookup (Authenticated) ───────────────────────────
// GET /api/questions (Teacher / Admin management search & listing)
router.get('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), questionController.getAllQuestions);

// GET /api/questions/:id (Context validation & role-based sanitization)
router.get('/:id', authMiddleware, questionController.getQuestionById);

// ── Question Mutation Endpoints (Teachers & Admins only) ────────────────────
// POST /api/questions
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), questionController.createQuestion);

// PUT /api/questions/:id
router.put('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), questionController.updateQuestion);

// DELETE /api/questions/:id
router.delete('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), questionController.deleteQuestion);

module.exports = router;
