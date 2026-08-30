const chapterService = require('../services/chapterService');
const { createChapterSchema, updateChapterSchema } = require('../validators/chapterValidator');

class ChapterController {
  /**
   * GET /api/standards/:standardId/chapters?subjectId=:subjectId
   */
  async getChaptersByStandard(req, res, next) {
    try {
      const { standardId } = req.params;
      const { subjectId, includeInactive } = req.query;
      const isTeacherOrAdmin = req.user && ['TEACHER', 'ADMIN'].includes(req.user.role);

      const chapters = await chapterService.getChaptersByStandard(standardId, {
        subjectId,
        includeInactive: isTeacherOrAdmin && includeInactive === 'true',
      });

      return res.status(200).json({
        success: true,
        message: 'Chapters retrieved successfully',
        data: { chapters },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/chapters/:chapterId
   */
  async getChapterById(req, res, next) {
    try {
      const { chapterId } = req.params;
      const { standardId, subjectId } = req.query;

      const chapter = await chapterService.getChapterById(chapterId, {
        standardId,
        subjectId,
      });

      return res.status(200).json({
        success: true,
        message: 'Chapter details retrieved successfully',
        data: { chapter },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/chapters (Teacher / Admin only)
   */
  async createChapter(req, res, next) {
    try {
      const validatedData = createChapterSchema.parse(req.body);
      const chapter = await chapterService.createChapter(validatedData);
      return res.status(201).json({
        success: true,
        message: 'Chapter created successfully',
        data: { chapter },
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
   * PUT /api/chapters/:id (Teacher / Admin only)
   */
  async updateChapter(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateChapterSchema.parse(req.body);
      const chapter = await chapterService.updateChapter(id, validatedData);
      return res.status(200).json({
        success: true,
        message: 'Chapter updated successfully',
        data: { chapter },
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
   * DELETE /api/chapters/:id (Teacher / Admin only)
   */
  async deleteChapter(req, res, next) {
    try {
      const { id } = req.params;
      const result = await chapterService.deleteChapter(id);
      return res.status(200).json({
        success: true,
        message: result.message || 'Chapter archived successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChapterController();
