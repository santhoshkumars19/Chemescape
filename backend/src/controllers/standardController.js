const standardService = require('../services/standardService');
const { createStandardSchema, updateStandardSchema } = require('../validators/standardValidator');

class StandardController {
  /**
   * GET /api/standards
   */
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

  /**
   * GET /api/standards/:id
   */
  async getStandardById(req, res, next) {
    try {
      const { id } = req.params;
      const standard = await standardService.getStandardById(id);
      return res.status(200).json({
        success: true,
        message: 'Standard retrieved successfully',
        data: { standard },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/standards (Teacher / Admin only)
   */
  async createStandard(req, res, next) {
    try {
      const validatedData = createStandardSchema.parse(req.body);
      const standard = await standardService.createStandard(validatedData);
      return res.status(201).json({
        success: true,
        message: 'Standard created successfully',
        data: { standard },
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: error.errors[0]?.message || 'Validation error',
          errors: error.errors,
        });
      }
      next(error);
    }
  }

  /**
   * PUT /api/standards/:id (Teacher / Admin only)
   */
  async updateStandard(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateStandardSchema.parse(req.body);
      const standard = await standardService.updateStandard(id, validatedData);
      return res.status(200).json({
        success: true,
        message: 'Standard updated successfully',
        data: { standard },
      });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          message: error.errors[0]?.message || 'Validation error',
          errors: error.errors,
        });
      }
      next(error);
    }
  }

  /**
   * DELETE /api/standards/:id (Admin only)
   */
  async deleteStandard(req, res, next) {
    try {
      const { id } = req.params;
      const result = await standardService.deleteStandard(id);
      return res.status(200).json({
        success: true,
        message: result.message || 'Standard deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StandardController();
