const gridReconstructionService = require('../services/gameEngines/gridReconstructionService');

class GridReconstructionController {
  async startSession(req, res, next) {
    try {
      const { roomId } = req.body || {};
      const sessionData = await gridReconstructionService.startGridSession(req.user.id, roomId);
      return res.status(200).json({
        success: true,
        message: 'Periodic Grid Reconstruction session initialized',
        data: sessionData,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitStage(req, res, next) {
    try {
      const { stageNumber } = req.params;
      const result = await gridReconstructionService.submitStageAnswer(req.user.id, stageNumber, req.body);
      return res.status(200).json({
        success: true,
        message: result.correct ? 'Stage cleared! Grid matrix restored.' : 'Incorrect placement or trend response.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitFinal(req, res, next) {
    try {
      const result = await gridReconstructionService.submitFinalGrid(req.user.id, req.body);
      return res.status(200).json({
        success: true,
        message: result.completed ? 'Master Periodic Table restored! Mission Complete.' : 'Master table incomplete.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GridReconstructionController();
