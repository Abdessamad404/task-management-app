const JwtUtil = require("../utils/jwt");
const ResponseUtil = require("../utils/response");

class AuthMiddleware {
  static authenticate(req, res, next) {
    // Get token from header
    const authHeader = req.headers["authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7)
        : null;

    if (!token) {
      const response = ResponseUtil.unauthorized("No token provided");
      res.writeHead(response.statusCode, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify(response));
      return;
    }

    // Verify token
    const decoded = JwtUtil.verifyToken(token);

    if (!decoded) {
      const response = ResponseUtil.unauthorized("Invalid or expired token");
      res.writeHead(response.statusCode, {
        "Content-Type": "application/json",
      });
      res.end(JSON.stringify(response));
      return;
    }

    // Attach user info to request
    req.user = decoded;
    next();
  }
}

module.exports = AuthMiddleware;
