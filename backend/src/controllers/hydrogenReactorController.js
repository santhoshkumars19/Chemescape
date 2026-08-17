const hydrogenReactorService = require('../services/gameEngines/hydrogenReactorService');

class HydrogenReactorController {
  async startSession(req, res, next) {
    try {
      const { roomId } = req.body || {};
      const sessionData = await hydrogenReactorService.startHydrogenSession(req.user.id, roomId);
      return res.status(200).json({
        success: true,
        message: 'Hydrogen Reactor session initialized',
        data: sessionData,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitStage(req, res, next) {
    try {
      const { stageNumber } = req.params;
      const result = await hydrogenReactorService.submitStageAnswer(req.user.id, stageNumber, req.body);
      return res.status(200).json({
        success: true,
        message: result.correct ? 'Stage cleared! Reactor sub-system online.' : 'Incorrect reaction or safety input.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitFinal(req, res, next) {
    try {
      const result = await hydrogenReactorService.submitFinalReactorState(req.user.id, req.body);
      return res.status(200).json({
        success: true,
        message: result.completed ? 'Hydrogen Reactor fully stabilized! Mission Complete.' : 'Reactor state unstable.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HydrogenReactorController();
