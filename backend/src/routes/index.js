const express = require('express');
const router = express.Router();
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const standardRoutes = require('./standardRoutes');
const chapterRoutes = require('./chapterRoutes');
const topicRoutes = require('./topicRoutes');
const roomRoutes = require('./roomRoutes');
const questionRoutes = require('./questionRoutes');
const gameRoutes = require('./gameRoutes');
const testRoutes = require('./testRoutes');
const aiRoutes = require('./aiRoutes');

// Mount routes under /api
router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/standards', standardRoutes);
router.use('/chapters', chapterRoutes);
router.use('/topics', topicRoutes);
router.use('/rooms', roomRoutes);
router.use('/questions', questionRoutes);
router.use('/game', gameRoutes);
router.use('/test', testRoutes);
router.use('/ai', aiRoutes);

module.exports = router;
