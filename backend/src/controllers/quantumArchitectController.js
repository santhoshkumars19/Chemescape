const quantumArchitectService = require('../services/gameEngines/quantumArchitectService');

class QuantumArchitectController {
  async startSession(req, res, next) {
    try {
      const { roomId } = req.body || {};
      const sessionData = await quantumArchitectService.startQuantumSession(req.user.id, roomId);
      return res.status(200).json({
        success: true,
        message: 'Quantum Orbital Architect session initialized',
        data: sessionData,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitStage(req, res, next) {
    try {
      const { stageNumber } = req.params;
      const result = await quantumArchitectService.submitStageAnswer(req.user.id, stageNumber, req.body);
      return res.status(200).json({
        success: true,
        message: result.correct ? 'Stage cleared! Atomic subshell stabilized.' : 'Incorrect orbital placement.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitFinal(req, res, next) {
    try {
      const result = await quantumArchitectService.submitFinalConfiguration(req.user.id, req.body);
      return res.status(200).json({
        success: true,
        message: result.completed ? 'Atomic Core reconstructed! Mission Complete.' : 'Atomic Core unstable.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuantumArchitectController();
