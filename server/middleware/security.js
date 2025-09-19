const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 5 : 50, // 5 for production, 50 for development
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
});

// Speed limiter for repeated requests (FIXED VERSION)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes at full speed
  delayMs: () => 500, // fixed 500ms delay after limit reached
  validate: { delayMs: false }, // disable the warning message
});

// Sanitization middleware
const sanitizeInput = [
  mongoSanitize(), // prevent NoSQL injection
  xss(), // prevent XSS attacks
];

module.exports = {
  apiLimiter,
  authLimiter,
  speedLimiter,
  sanitizeInput,
};
