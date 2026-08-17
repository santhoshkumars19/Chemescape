const subjectService = require('../services/subjectService');

class SubjectController {
  async getSubjectsByStandard(req, res, next) {
    try {
      const { standardId } = req.params;
      const subjects = await subjectService.getSubjectsByStandard(standardId);
      return res.status(200).json({
        success: true,
        message: 'Subjects retrieved successfully',
        data: { subjects },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubjectController();
