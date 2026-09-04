const healthService = require('../services/healthService');

class HealthController {
  async getHealth(req, res, next) {
    try {
      const healthDetails = await healthService.getHealthStatus();
      return res.status(200).json({
        success: true,
        message: "EduNova API is running",
        data: healthDetails,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HealthController();
