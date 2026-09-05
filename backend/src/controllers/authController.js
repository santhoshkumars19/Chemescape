const authService = require('../services/authService');

class AuthController {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      const user = result.user || result;
      const token = result.token;
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { user, token } = await authService.login(req.body);
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   */
  async getCurrentUser(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/users
   * Returns registered users with optional role filter
   */
  async getAllUsers(req, res, next) {
    try {
      const { role } = req.query;
      const users = await authService.getAllUsers(role);
      return res.status(200).json({
        success: true,
        data: {
          users,
          total: users.length,
        },
        users,
        total: users.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
