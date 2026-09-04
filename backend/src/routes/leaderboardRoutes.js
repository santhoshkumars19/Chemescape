'use strict';

const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { verifyToken } = require('../utils/jwt');

function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = {
          id: decoded.userId,
          name: decoded.name || 'Scholar',
          email: decoded.email,
          role: decoded.role || 'STUDENT',
        };
      }
    }
  } catch {}
  next();
}

router.get('/', optionalAuth, (req, res) => leaderboardController.getLeaderboard(req, res));

module.exports = router;
