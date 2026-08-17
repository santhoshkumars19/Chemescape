const express = require('express');
const router = express.Router();
const standardController = require('../controllers/standardController');
const subjectController = require('../controllers/subjectController');
const chapterController = require('../controllers/chapterController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/standards
router.get('/', authMiddleware, standardController.getAllStandards);

// GET /api/standards/:standardId/subjects
router.get('/:standardId/subjects', authMiddleware, subjectController.getSubjectsByStandard);

// GET /api/standards/:standardId/chapters
router.get('/:standardId/chapters', authMiddleware, chapterController.getChaptersByStandard);

module.exports = router;
