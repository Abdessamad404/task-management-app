const ResponseUtil = require("../utils/response");
const config = require("../config/env");

class ErrorHandler {
  static handle(error, req, res) {
    console.error("Error:", error);

    // MongoDB duplicate key error
    if (error.code === 11000) {
      const response = ResponseUtil.error("Duplicate entry found", 409);
      res.writeHead(response.statusCode, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify(response));
      return;
    }

    // MongoDB validation error
    if (error.name === "ValidationError") {
      const response = ResponseUtil.validationError(error.errors);
      res.writeHead(response.statusCode, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify(response));
      return;
    }

    // Default error
    const response = ResponseUtil.error(
      config.nodeEnv === "development"
        ? error.message
        : "Internal server error",
      500,
    );
    res.writeHead(response.statusCode, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response));
  }

  // Async wrapper for controllers
  static asyncHandler(fn) {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        ErrorHandler.handle(error, req, res);
      }
    };
  }
}

module.exports = ErrorHandler;
