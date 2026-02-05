const config = require("../config/env");
const ResponseUtil = require("../utils/response");

class RateLimiter {
  constructor() {
    this.requests = new Map(); // { ip: { count, resetTime } }
  }

  middleware() {
    return (req, res, next) => {
      const ip = req.socket.remoteAddress;
      const now = Date.now();

      // Get or create bucket for this IP
      if (!this.requests.has(ip)) {
        this.requests.set(ip, {
          count: 0,
          resetTime: now + config.rateLimit.windowMs,
        });
      }

      const bucket = this.requests.get(ip);

      // Reset if window expired
      if (now > bucket.resetTime) {
        bucket.count = 0;
        bucket.resetTime = now + config.rateLimit.windowMs;
      }

      // Check limit
      if (bucket.count >= config.rateLimit.maxRequests) {
        const response = ResponseUtil.error(
          "Too many requests. Please try again later.",
          429,
        );
        res.writeHead(response.statusCode, {
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify(response));
        return;
      }

      // Increment counter
      bucket.count++;
      next();
    };
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [ip, bucket] of this.requests.entries()) {
      if (now > bucket.resetTime + config.rateLimit.windowMs) {
        this.requests.delete(ip);
      }
    }
  }
}

module.exports = new RateLimiter();
