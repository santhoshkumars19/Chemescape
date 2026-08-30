const express = require('express');
const router = express.Router();
const standardController = require('../controllers/standardController');
const subjectController = require('../controllers/subjectController');
const chapterController = require('../controllers/chapterController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// ── Standard Read Endpoints (Students, Teachers, Admins) ──────────────────────
// GET /api/standards
router.get('/', authMiddleware, standardController.getAllStandards);

// GET /api/standards/:id
router.get('/:id', authMiddleware, standardController.getStandardById);

// ── Standard Mutation Endpoints (Teachers & Admins only) ───────────────────────
// POST /api/standards
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), standardController.createStandard);

// PUT /api/standards/:id
router.put('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), standardController.updateStandard);

// DELETE /api/standards/:id
router.delete('/:id', authMiddleware, requireRole('ADMIN'), standardController.deleteStandard);

// ── Standard Relations Endpoints (Backward Compatibility) ─────────────────────
// GET /api/standards/:standardId/subjects
router.get('/:standardId/subjects', authMiddleware, subjectController.getSubjectsByStandard);

// GET /api/standards/:standardId/chapters
router.get('/:standardId/chapters', authMiddleware, chapterController.getChaptersByStandard);

module.exports = router;
