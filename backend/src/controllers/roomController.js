const roomService = require('../services/roomService');
const { createRoomSchema, updateRoomSchema } = require('../validators/roomValidator');

class RoomController {
  /**
   * GET /api/chapters/:chapterId/rooms
   */
  async getRoomsByChapter(req, res, next) {
    try {
      const { chapterId } = req.params;
      const { standardId, subjectId, includeInactive } = req.query;
      const isTeacherOrAdmin = req.user && ['TEACHER', 'ADMIN'].includes(req.user.role);

      const rooms = await roomService.getRoomsByChapter(chapterId, {
        standardId,
        subjectId,
        includeInactive: isTeacherOrAdmin && includeInactive === 'true',
      });

      return res.status(200).json({
        success: true,
        message: 'Rooms retrieved successfully',
        data: { rooms },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/rooms/:id
   */
  async getRoomById(req, res, next) {
    try {
      const { id } = req.params;
      const { chapterId } = req.query;
      const isTeacherOrAdmin = req.user && ['TEACHER', 'ADMIN'].includes(req.user.role);

      const room = await roomService.getRoomById(id, {
        chapterId,
        includeInactive: isTeacherOrAdmin,
      });

      return res.status(200).json({
        success: true,
        message: 'Room retrieved successfully',
        data: { room },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/rooms (Teacher / Admin only)
   */
  async createRoom(req, res, next) {
    try {
      const validatedData = createRoomSchema.parse(req.body);
      const room = await roomService.createRoom(validatedData);
      return res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: { room },
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
   * PUT /api/rooms/:id (Teacher / Admin only)
   */
  async updateRoom(req, res, next) {
    try {
      const { id } = req.params;
      const validatedData = updateRoomSchema.parse(req.body);
      const room = await roomService.updateRoom(id, validatedData);
      return res.status(200).json({
        success: true,
        message: 'Room updated successfully',
        data: { room },
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
   * DELETE /api/rooms/:id (Teacher / Admin only)
   */
  async deleteRoom(req, res, next) {
    try {
      const { id } = req.params;
      const result = await roomService.deleteRoom(id);
      return res.status(200).json({
        success: true,
        message: result.message || 'Room archived successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoomController();
