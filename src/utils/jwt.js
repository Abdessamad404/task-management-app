const jwt = require("jsonwebtoken");
const config = require("../config/env");

class JwtUtil {
  // Generate token
  static generateToken(payload) {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expire,
    });
  }

  // Verify token
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      return null;
    }
  }

  // Decode without verification (for debugging)
  static decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = JwtUtil;
