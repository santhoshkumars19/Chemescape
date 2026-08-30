const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// ── Subject Read Endpoints (Students, Teachers, Admins) ──────────────────────
// GET /api/subjects
router.get('/', authMiddleware, subjectController.getAllSubjects);

// GET /api/subjects/:id
router.get('/:id', authMiddleware, subjectController.getSubjectById);

// ── Subject Mutation Endpoints (Teachers & Admins only) ───────────────────────
// POST /api/subjects
router.post('/', authMiddleware, requireRole('TEACHER', 'ADMIN'), subjectController.createSubject);

// PUT /api/subjects/:id
router.put('/:id', authMiddleware, requireRole('TEACHER', 'ADMIN'), subjectController.updateSubject);

// DELETE /api/subjects/:id
router.delete('/:id', authMiddleware, requireRole('ADMIN'), subjectController.deleteSubject);

// ── StandardSubject Mapping Endpoints (Teachers & Admins only) ────────────────
// POST /api/subjects/map
router.post('/map', authMiddleware, requireRole('TEACHER', 'ADMIN'), subjectController.mapSubjectToStandard);

// DELETE /api/subjects/map
router.delete('/map', authMiddleware, requireRole('TEACHER', 'ADMIN'), subjectController.unmapSubjectFromStandard);

module.exports = router;
