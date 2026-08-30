const gameProgressService = require('../services/gameProgressService');
const chapterUnlockService = require('../services/chapterUnlockService');

class GameController {
  async getUnlockedChapters(req, res, next) {
    try {
      const { standardId, subjectId } = req.query;
      if (!standardId || !subjectId) {
        return res.status(400).json({
          success: false,
          message: 'standardId and subjectId are required query parameters',
        });
      }
      const data = await chapterUnlockService.getUnlockedChapters(req.user.id, standardId, subjectId);
      return res.status(200).json({
        success: true,
        message: 'Unlocked chapters retrieved successfully',
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserProgress(req, res, next) {
    try {
      const progress = await gameProgressService.getUserProgress(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'User game progress retrieved successfully',
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRoomProgress(req, res, next) {
    try {
      const { roomId } = req.params;
      const progress = await gameProgressService.getRoomProgress(req.user.id, roomId);
      return res.status(200).json({
        success: true,
        message: 'Room progress retrieved successfully',
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }

  async startGame(req, res, next) {
    try {
      const { roomId } = req.params;
      const sessionData = await gameProgressService.startGame(req.user.id, roomId);
      return res.status(200).json({
        success: true,
        message: sessionData.message,
        data: sessionData,
      });
    } catch (error) {
      next(error);
    }
  }

  async saveGame(req, res, next) {
    try {
      const { roomId } = req.params;
      const result = await gameProgressService.saveGame(req.user.id, roomId, req.body);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async completeGame(req, res, next) {
    try {
      const { roomId } = req.params;
      const result = await gameProgressService.completeGame(req.user.id, roomId, req.body);
      return res.status(200).json({
        success: true,
        message: result.isFirstCompletion
          ? 'Congratulations! Room completed and rewards unlocked!'
          : 'Room re-cleared successfully!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async failGame(req, res, next) {
    try {
      const { roomId } = req.params;
      const result = await gameProgressService.failGame(req.user.id, roomId, req.body);
      return res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GameController();
