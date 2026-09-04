'use strict';

const leaderboardService = require('../services/leaderboardService');

class LeaderboardController {
  async getLeaderboard(req, res) {
    try {
      const { timeframe, standardId, subjectId, search } = req.query;
      const currentUser = req.user ? {
        id: req.user.id || req.user.userId,
        name: req.user.name,
        avatar: req.user.avatar,
        standardId: req.user.standardId,
        subjectId: req.user.subjectId,
      } : null;

      const data = await leaderboardService.getLeaderboard({
        timeframe: timeframe || 'weekly',
        standardId: standardId || null,
        subjectId: subjectId || null,
        search: search || '',
        currentUser,
      });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      console.error('[Leaderboard Controller Error]:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard data',
        error: err.message,
      });
    }
  }
}

module.exports = new LeaderboardController();
