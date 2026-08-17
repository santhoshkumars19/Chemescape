class ApiResponse {
  /**
   * Standard Success Response
   * {
   *   "success": true,
   *   "message": "Success message",
   *   "data": {}
   * }
   */
  static success(res, message, data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Standard Error Response
   * {
   *   "success": false,
   *   "message": "Error message"
   * }
   */
  static error(res, message, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

module.exports = ApiResponse;
