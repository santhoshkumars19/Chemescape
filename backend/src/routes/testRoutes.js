const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// GET /api/test/student (Only STUDENT can access)
router.get('/student', authMiddleware, requireRole('STUDENT'), (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome Student! Access granted to Student test endpoint.',
    data: { user: req.user },
  });
});

// GET /api/test/teacher (Only TEACHER can access)
router.get('/teacher', authMiddleware, requireRole('TEACHER'), (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome Teacher! Access granted to Teacher test endpoint.',
    data: { user: req.user },
  });
});

// GET /api/test/admin (Only ADMIN can access)
router.get('/admin', authMiddleware, requireRole('ADMIN'), (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome Admin! Access granted to Admin test endpoint.',
    data: { user: req.user },
  });
});

module.exports = router;
