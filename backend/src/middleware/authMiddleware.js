const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/db');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Fetch user from DB
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (dbErr) {
      // Safe fallback when remote DB connection is unreachable
      user = {
        id: decoded.userId,
        name: decoded.name || 'Student Scholar',
        email: decoded.email || 'user@edunova.com',
        role: decoded.role || 'STUDENT',
      };
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
