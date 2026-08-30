const subjectService = require('../services/subjectService');
const {
  createSubjectSchema,
  updateSubjectSchema,
  mapStandardSubjectSchema,
  unmapStandardSubjectSchema,
} = require('../validators/subjectValidator');

class SubjectController {
  /**
   * GET /api/standards/:standardId/subjects
   */
  async getSubjectsByStandard(req, res, next) {
    try {
      const { standardId } = req.params;
      const isTeacherOrAdmin = req.user && ['TEACHER', 'ADMIN'].includes(req.user.role);
      const subjects = await subjectService.getSubjectsByStandard(standardId, {
        includeInactive: isTeacherOrAdmin && req.query.includeInactive === 'true',
      });
      return res.status(200).json({
        success: true,
        message: 'Subjects retrieved successfully',
        data: { subjects },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/subjects
   */
  async getAllSubjects(req, res, next) {
    try {
      const isTeacherOrAdmin = req.user && ['TEACHER', 'ADMIN'].includes(req.user.role);
      const subjects = await subjectService.getAllSubjects({
        includeInactive: isTeacherOrAdmin && req.query.includeInactive === 'true',
      });
      return res.status(200).json({
        success: true,
        message: 'Subjects retrieved successfully',
        data: { subjects },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/subjects/:id
   */
  async getSubjectById(req, res, next) {
    try {
      const { id } = req.params;
      const subject = await subjectService.getSubjectById(id);
      return res.status(200).json({
        success: true,
        message: 'Subject retrieved successfully',
        data: { subject },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/subjects (Teacher / Admin only)
   */
  async createSubject(req, res, next) {
    try {
      const validatedData = createSubjectSchema.parse(req.body);
      const subject = await subjectService.createSubject(validatedData);
      return res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: { subject },
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
   * PUT /api/subjects/:id (Teacher / Admin only)
   */
  async updateSubject(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateSubjectSchema.parse(req.body);
      const subject = await subjectService.updateSubject(id, validatedData);
      return res.status(200).json({
        success: true,
        message: 'Subject updated successfully',
        data: { subject },
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
   * DELETE /api/subjects/:id (Admin only)
   */
  async deleteSubject(req, res, next) {
    try {
      const { id } = req.params;
      const result = await subjectService.deleteSubject(id);
      return res.status(200).json({
        success: true,
        message: result.message || 'Subject deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/subjects/map (Teacher / Admin only)
   */
  async mapSubjectToStandard(req, res, next) {
    try {
      const validatedData = mapStandardSubjectSchema.parse(req.body);
      const mapping = await subjectService.mapSubjectToStandard(validatedData);
      return res.status(201).json({
        success: true,
        message: 'Subject mapped to standard successfully',
        data: { mapping },
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
   * DELETE /api/subjects/map (Teacher / Admin only)
   */
  async unmapSubjectFromStandard(req, res, next) {
    try {
      const validatedData = unmapStandardSubjectSchema.parse(req.body);
      const result = await subjectService.unmapSubjectFromStandard(validatedData);
      return res.status(200).json({
        success: true,
        message: result.message || 'Subject unmapped from standard successfully',
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
}

module.exports = new SubjectController();
