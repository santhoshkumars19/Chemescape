/**
 * EduNova AI Assistant Routes
 * Mounted at /api/ai
 */

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// In-memory simple rate-limiter per user (max 30 requests / 60 seconds)
const userRequestCounts = new Map();

const aiRateLimiter = (req, res, next) => {
  const userId = req.user.id;
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxLimit = 30;

  let userLog = userRequestCounts.get(userId);
  if (!userLog || now - userLog.startTime > windowMs) {
    userLog = { count: 1, startTime: now };
  } else {
    userLog.count += 1;
  }

  userRequestCounts.set(userId, userLog);

  if (userLog.count > maxLimit) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded for AI Assistant requests. Please wait a minute before asking more questions.'
    });
  }

  next();
};

// All AI endpoints require JWT authentication
router.post('/assistant', authMiddleware, aiRateLimiter, (req, res, next) => aiController.askAssistant(req, res, next));

module.exports = router;
