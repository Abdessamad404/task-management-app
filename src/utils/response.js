//*  Factory pattern for standardized API responses
class ResponseUtil {
  // Success response
  static success(data, message = "Success", statusCode = 200) {
    return {
      success: true,
      message,
      data,
      statusCode,
    };
  }

  // Error response
  static error(message, statusCode = 500, errors = null) {
    return {
      success: false,
      message,
      errors,
      statusCode,
    };
  }

  // Validation error
  static validationError(errors) {
    return {
      success: false,
      message: "Validation failed",
      errors,
      statusCode: 400,
    };
  }

  // Unauthorized
  static unauthorized(message = "Unauthorized access") {
    return {
      success: false,
      message,
      statusCode: 401,
    };
  }

  // Not found
  static notFound(message = "Resource not found") {
    return {
      success: false,
      message,
      statusCode: 404,
    };
  }
}

module.exports = ResponseUtil;
