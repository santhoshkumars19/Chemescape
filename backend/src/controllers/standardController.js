const standardService = require('../services/standardService');

class StandardController {
  async getAllStandards(req, res, next) {
    try {
      const standards = await standardService.getAllStandards();
      return res.status(200).json({
        success: true,
        message: 'Standards retrieved successfully',
        data: { standards },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StandardController();
