const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const { logger } = require("./errorHandler");
const Redis = require("ioredis");
const { ipKeyGenerator } = require("express-rate-limit");
// Provide a safe fallback if express-rate-limit doesn't export ipKeyGenerator
const ipKeyGeneratorFn = (req) => {
  try {
    if (typeof ipKeyGenerator === "function") return ipKeyGenerator(req);
  } catch (e) {
    // ignore and fallback
  }
  // Fallback: normalize IP (replace colon/dot) to produce a safe key
  if (req && req.ip) return String(req.ip).replace(/[:.]/g, "-");
  return "unknown-ip";
};

// Setup Redis client for rate limiting if available
let redisClient;
try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
    logger.info("Redis connected for rate limiting");
  }
} catch (error) {
  logger.error("Redis connection error:", error);
}

// Create store based on available resources
const createStore = () => {
  if (redisClient) {
    // Using Redis store if available
    const RedisStore = require("rate-limit-redis");
    return new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    });
  }
  // Fall back to memory store
  return undefined;
};

// Dynamic rate limiting based on user role and endpoint
const dynamicRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes by default
    max: (req) => {
      // Higher limits for authenticated users
      if (req.user) {
        // Admins get higher limits
        if (req.user.role === "admin") {
          return options.adminMax || 1000;
        }
        // Regular authenticated users
        return options.authMax || 300;
      }
      // Unauthenticated users get lowest limit
      return options.max || 100;
    },
    message: {
      status: 429,
      message: options.message || "Too many requests, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: createStore(),
    keyGenerator: (req) => {
      // Use user ID if available, otherwise IP
      if (req.user) {
        return `user-${req.user._id}`;
      } else {
        // Use the ipKeyGenerator helper function to safely handle IPv6 addresses
        return `ip-${ipKeyGeneratorFn(req)}`;
      }
    },
    // Log rate limit hits
    handler: (req, res, next, options) => {
      logger.warn(
        `Rate limit exceeded: ${req.ip} (${
          req.user ? req.user._id : "anonymous"
        })`
      );
      res.status(options.statusCode).json(options.message);
    },
    skip: options.skip || (() => false),
  });
};

// API rate limiting with improved options
const apiLimiter = dynamicRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // anonymous limit
  authMax: 300, // authenticated user limit
  adminMax: 1000, // admin user limit
  message: "Too many API requests, please try again later.",
});

// Critical endpoints rate limiting (like authentication)
const authLimiter = dynamicRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 5 : 50,
  authMax: process.env.NODE_ENV === "production" ? 20 : 100,
  adminMax: process.env.NODE_ENV === "production" ? 50 : 200,
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
});

// Special rate limiter for emergency routes - more permissive
const emergencyLimiter = dynamicRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // anonymous limit - higher for emergency
  authMax: 100, // authenticated user limit
  adminMax: 300, // admin user limit
  message: "Too many emergency requests, please try again later.",
  // Skip rate limiting for critical emergency SOS
  skip: (req) => req.path.includes("/sos") && req.body.emergency === true,
});

// Speed limiter for repeated requests with progressive delays
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes at full speed
  // Progressive delay based on number of requests
  delayMs: (hits) => {
    if (hits <= 55) return 500; // first 5 over: 500ms delay
    if (hits <= 60) return 1000; // next 5: 1s delay
    if (hits <= 70) return 2000; // next 10: 2s delay
    return 3000; // over 70: 3s delay
  },
  validate: { delayMs: false }, // disable the warning message
  keyGenerator: (req) => {
    if (req.user) {
      return `user-${req.user._id}`;
    } else {
      // Use the ipKeyGenerator helper function to safely handle IPv6 addresses
      return `ip-${ipKeyGeneratorFn(req)}`;
    }
  },
  store: createStore(), // Use Redis if available
});

// Sanitization middleware
const sanitizeInput = [
  mongoSanitize(), // prevent NoSQL injection
  xss(), // prevent XSS attacks
];

// Helper function to handle rate limit errors gracefully
const handleRateLimitError = (req, res, options) => {
  const retryAfter = Math.ceil(options.windowMs / 1000);

  // Set retry headers
  res.set("Retry-After", String(retryAfter));

  // Return friendly JSON response with advice
  return res.status(429).json({
    status: "error",
    error: "Too Many Requests",
    message:
      options.message ||
      "You have exceeded the request limit. Please try again later.",
    retryAfter: retryAfter,
    retryAt: new Date(Date.now() + options.windowMs).toISOString(),
    help: "If this is an emergency situation, please call the emergency services directly.",
  });
};

module.exports = {
  apiLimiter,
  authLimiter,
  emergencyLimiter,
  speedLimiter,
  sanitizeInput,
  handleRateLimitError,
  dynamicRateLimiter,
};
