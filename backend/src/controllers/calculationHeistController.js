const calculationHeistService = require('../services/gameEngines/calculationHeistService');

class CalculationHeistController {
  async startSession(req, res, next) {
    try {
      const { roomId } = req.body || {};
      const sessionData = await calculationHeistService.startHeistSession(req.user.id, roomId);
      return res.status(200).json({
        success: true,
        message: 'Chem Calculation Heist session initialized',
        data: sessionData,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitStage(req, res, next) {
    try {
      const { stageNumber } = req.params;
      const result = await calculationHeistService.submitStageAnswer(req.user.id, stageNumber, req.body);
      return res.status(200).json({
        success: true,
        message: result.correct ? 'Stage cleared! Vault digit revealed.' : 'Incorrect stage calculation.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitFinalCode(req, res, next) {
    try {
      const { code, timeSpentSec } = req.body;
      const result = await calculationHeistService.submitFinalVaultCode(req.user.id, { code, timeSpentSec });
      return res.status(200).json({
        success: true,
        message: result.unlocked ? 'Vault door opened! Mission complete!' : 'Vault code invalid.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CalculationHeistController();
