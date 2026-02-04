require("dotenv").config();

const config = {
  port: process.env.PORT,
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expire: process.env.JWT_EXPIRE,
  },
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000, // convert to ms
    maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS,
  },
  nodeEnv: process.env.NODE_ENV,
};

// Validate critical configs
if (!config.jwt.secret) {
  throw new Error("JWT_SECRET is required in environment variables");
}

module.exports = config;
