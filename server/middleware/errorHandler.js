const winston = require("winston");
require("winston-daily-rotate-file");
const path = require("path");
const os = require("os");
const { v4: uuidv4 } = require("uuid");

// Create logs directory if it doesn't exist
const fs = require("fs");
if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

// Custom format for detailed error logging
const detailedFormat = winston.format.printf(
  ({ level, message, timestamp, ...metadata }) => {
    let metaStr = "";
    if (metadata && Object.keys(metadata).length) {
      metaStr = JSON.stringify(metadata, null, 2);
    }

    return `${timestamp} [${level}]: ${message}${
      metaStr ? "\n" + metaStr : ""
    }`;
  }
);

// Create rotating file transports
const errorRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join("logs", "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m",
  maxFiles: "14d",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    detailedFormat
  ),
});

const combinedRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join("logs", "combined-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  format: winston.format.combine(winston.format.timestamp(), detailedFormat),
});

// Configure Winston logger with enhanced features
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ["timestamp", "level", "message"] }),
    winston.format.json()
  ),
  defaultMeta: {
    service: "Aqua Assists-api",
    hostname: os.hostname(),
    environment: process.env.NODE_ENV || "development",
  },
  transports: [
    // Rotating file transports
    errorRotateTransport,
    combinedRotateTransport,

    // Write access logs
    new winston.transports.File({
      filename: path.join("logs", "access.log"),
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
      ),
    }),
  ],
  // Enable exception handling
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join("logs", "exceptions.log"),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        detailedFormat
      ),
    }),
  ],
  // Enable rejection handling
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join("logs", "rejections.log"),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        detailedFormat
      ),
    }),
  ],
  exitOnError: false,
});

// Add console transport for development
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...rest }) => {
          const timestampFormatted = timestamp.slice(0, 19).replace("T", " ");
          const meta =
            rest && Object.keys(rest).length
              ? `\n${JSON.stringify(rest, null, 2)}`
              : "";
          return `${timestampFormatted} [${level}]: ${message}${meta}`;
        })
      ),
    })
  );
}

// Error tracking and correlation ID generation
const generateCorrelationId = () => {
  return uuidv4();
};

// Custom application error class
class AppError extends Error {
  constructor(message, statusCode, errorCode, context = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || `ERR_${statusCode}`;
    this.context = context;
    this.isOperational = true; // Indicates known operational error vs programming error

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific domain error types
class ValidationError extends AppError {
  constructor(message, context = {}) {
    super(message, 400, "ERR_VALIDATION", context);
    this.name = "ValidationError";
  }
}

class AuthenticationError extends AppError {
  constructor(message, context = {}) {
    super(message, 401, "ERR_AUTHENTICATION", context);
    this.name = "AuthenticationError";
  }
}

class AuthorizationError extends AppError {
  constructor(message, context = {}) {
    super(message, 403, "ERR_AUTHORIZATION", context);
    this.name = "AuthorizationError";
  }
}

class ResourceNotFoundError extends AppError {
  constructor(resource, id, context = {}) {
    super(
      `${resource} not found${id ? ` with ID: ${id}` : ""}`,
      404,
      "ERR_NOT_FOUND",
      context
    );
    this.name = "ResourceNotFoundError";
  }
}

class RateLimitError extends AppError {
  constructor(message, context = {}) {
    super(message || "Rate limit exceeded", 429, "ERR_RATE_LIMIT", context);
    this.name = "RateLimitError";
  }
}

// Enhanced async handler with improved error handling
const asyncHandler = (fn) => (req, res, next) => {
  // Assign a correlation ID to the request if not present
  if (!req.correlationId) {
    req.correlationId = generateCorrelationId();
    // Add correlation ID to response headers
    res.set("X-Correlation-ID", req.correlationId);
  }

  Promise.resolve(fn(req, res, next)).catch((error) => {
    // Enhance the error with request context
    error.requestInfo = {
      correlationId: req.correlationId,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?._id || "anonymous",
    };

    next(error);
  });
};

// Global error handler with enhanced capabilities
const errorHandler = (err, req, res, next) => {
  // Ensure correlationId exists
  const correlationId = req.correlationId || generateCorrelationId();

  // Create error context for logging and response
  const errorContext = {
    correlationId,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.user?._id || "anonymous",
    timestamp: new Date().toISOString(),
    requestBody:
      req.method !== "GET" ? sanitizeRequestBody(req.body) : undefined,
    requestQuery: Object.keys(req.query).length > 0 ? req.query : undefined,
  };

  // Log error with complete context
  logger.error(`${err.message || "Server Error"} [${correlationId}]`, {
    ...errorContext,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      code: err.code,
      errorCode: err.errorCode,
    },
  });

  // Initialize error object with default values
  let error = {
    statusCode: err.statusCode || 500,
    message: err.message || "Server Error",
    errorCode: err.errorCode || `ERR_${err.statusCode || 500}`,
    isOperational: err.isOperational || false,
  };

  // Handle specific error types

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    error = {
      statusCode: 404,
      message: `Resource not found with ${err.path}: ${err.value}`,
      errorCode: "ERR_NOT_FOUND",
      isOperational: true,
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = {
      statusCode: 400,
      message: `${field} already exists`,
      errorCode: "ERR_DUPLICATE",
      isOperational: true,
    };
  }

  // Mongoose validation error
  if (err.name === "ValidationError" && !err.isOperational) {
    // Check if not our custom ValidationError
    const validationErrors = {};

    // Extract field-specific errors
    Object.keys(err.errors).forEach((field) => {
      validationErrors[field] = err.errors[field].message;
    });

    error = {
      statusCode: 400,
      message: "Validation failed",
      errorCode: "ERR_VALIDATION",
      isOperational: true,
      errors: validationErrors,
    };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = {
      statusCode: 401,
      message: "Authentication failed: Invalid token",
      errorCode: "ERR_INVALID_TOKEN",
      isOperational: true,
    };
  }

  if (err.name === "TokenExpiredError") {
    error = {
      statusCode: 401,
      message: "Authentication failed: Token expired",
      errorCode: "ERR_TOKEN_EXPIRED",
      isOperational: true,
    };
  }

  // Network/connectivity errors
  if (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT") {
    error = {
      statusCode: 503,
      message: "Service temporarily unavailable",
      errorCode: "ERR_SERVICE_UNAVAILABLE",
      isOperational: true,
    };
  }

  // Build the response object
  const responseBody = {
    status: "error",
    message: error.message,
    code: error.errorCode,
    correlationId,
    timestamp: new Date().toISOString(),
    ...(error.errors && { errors: error.errors }), // Include validation errors if any
  };

  // Include stack trace in development mode for non-operational errors
  if (process.env.NODE_ENV === "development" && !error.isOperational) {
    responseBody.stack = err.stack;
  }

  // Send the response
  res.status(error.statusCode).json(responseBody);
};

// Helper function to sanitize request body for logging (remove sensitive data)
const sanitizeRequestBody = (body) => {
  if (!body) return undefined;

  const sanitized = { ...body };
  const sensitiveFields = [
    "password",
    "passwordConfirm",
    "token",
    "accessToken",
    "refreshToken",
    "credit_card",
    "ssn",
  ];

  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = "[REDACTED]";
    }
  });

  return sanitized;
};

// 404 handler with improved messages
const notFoundHandler = (req, res, next) => {
  const correlationId = req.correlationId || generateCorrelationId();
  const error = new ResourceNotFoundError("Route", req.originalUrl, {
    correlationId,
    method: req.method,
    headers: req.headers,
  });
  next(error);
};

// Correlation ID middleware
const correlationIdMiddleware = (req, res, next) => {
  // Check if correlation ID exists in headers (client provided)
  const clientCorrelationId = req.headers["x-correlation-id"];

  // Use client-provided ID or generate a new one
  req.correlationId = clientCorrelationId || generateCorrelationId();

  // Add correlation ID to response headers
  res.set("X-Correlation-ID", req.correlationId);

  next();
};

// Process-level error handlers
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥", {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    timestamp: new Date().toISOString(),
  });

  console.error("UNCAUGHT EXCEPTION! Shutting down...");

  // Perform graceful shutdown
  setTimeout(() => {
    process.exit(1);
  }, 3000);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("UNHANDLED REJECTION! 💥", {
    promise: promise.toString(),
    reason:
      reason instanceof Error
        ? {
            name: reason.name,
            message: reason.message,
            stack: reason.stack,
          }
        : reason,
    timestamp: new Date().toISOString(),
  });

  console.error("UNHANDLED REJECTION! Shutting down...");

  // Perform graceful shutdown
  setTimeout(() => {
    process.exit(1);
  }, 3000);
});

// Graceful shutdown for SIGTERM signal
process.on("SIGTERM", () => {
  logger.info("👋 SIGTERM RECEIVED. Shutting down gracefully");
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");

  // Let the server close itself in server.js
});

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  correlationIdMiddleware,
  logger,
  // Export error classes for use throughout the application
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ResourceNotFoundError,
  RateLimitError,
};
