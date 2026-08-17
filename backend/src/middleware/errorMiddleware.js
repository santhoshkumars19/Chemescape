const ApiResponse = require('../utils/apiResponse');

/**
 * Global Error Handling Middleware
 * Consistent error response structure:
 * {
 *   "success": false,
 *   "message": "Error message"
 * }
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const message = (isProduction && statusCode === 500)
    ? 'Something went wrong'
    : (err.message || 'Internal Server Error');

  return ApiResponse.error(res, message, statusCode);
}

/**
 * 404 Not Found Middleware
 */
function notFoundHandler(req, res, next) {
  return ApiResponse.error(res, `Route ${req.originalUrl} not found`, 404);
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
