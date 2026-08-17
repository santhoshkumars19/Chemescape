const gasSimulatorService = require('../services/gameEngines/gasSimulatorService');

class GasSimulatorController {
  async startSession(req, res, next) {
    try {
      const { roomId } = req.body || {};
      const sessionData = await gasSimulatorService.startGasSession(req.user.id, roomId);
      return res.status(200).json({
        success: true,
        message: 'Gas Chamber Simulator session initialized',
        data: sessionData,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitStage(req, res, next) {
    try {
      const { stageNumber } = req.params;
      const result = await gasSimulatorService.submitStageAnswer(req.user.id, stageNumber, req.body);
      return res.status(200).json({
        success: true,
        message: result.correct ? 'Stage cleared! Gas chamber parameters updated.' : 'Gas simulation destabilized! Life lost.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitFinal(req, res, next) {
    try {
      const result = await gasSimulatorService.submitFinalChamber(req.user.id, req.body);
      return res.status(200).json({
        success: true,
        message: result.completed ? 'Gas Chamber fully stabilized! Mission Complete.' : 'Chamber equilibrium failed.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GasSimulatorController();
