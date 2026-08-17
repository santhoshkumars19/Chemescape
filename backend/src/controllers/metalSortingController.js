const metalSortingService = require('../services/gameEngines/metalSortingService');

class MetalSortingController {
  async startSession(req, res, next) {
    try {
      const { roomId } = req.body || {};
      const sessionData = await metalSortingService.startFactorySession(req.user.id, roomId);
      return res.status(200).json({
        success: true,
        message: 'Element Sorting Factory session initialized',
        data: sessionData,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitStage(req, res, next) {
    try {
      const { stageNumber } = req.params;
      const result = await metalSortingService.submitStageAnswer(req.user.id, stageNumber, req.body);
      return res.status(200).json({
        success: true,
        message: result.correct ? 'Stage cleared! Conveyor production line advanced.' : 'Incorrect metal sorting or flame test response.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitFinal(req, res, next) {
    try {
      const result = await metalSortingService.submitFinalFactoryState(req.user.id, req.body);
      return res.status(200).json({
        success: true,
        message: result.completed ? 'Element Sorting Factory fully restored! Mission Complete.' : 'Production efficiency below target.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MetalSortingController();
