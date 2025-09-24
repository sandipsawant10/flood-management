/**
 * Error handling utilities for client-side error management
 */

import { toast } from "react-toastify";

// Error types
export const ERROR_TYPES = {
  VALIDATION: "validation_error",
  AUTHENTICATION: "auth_error",
  NETWORK: "network_error",
  SERVER: "server_error",
  CLIENT: "client_error",
  UNKNOWN: "unknown_error",
};

/**
 * Custom error class for client-side errors
 */
export class AppError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, details = null) {
    super(message);
    this.name = "AppError";
    this.type = type;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.correlationId = details?.correlationId || null;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      details: this.details,
      timestamp: this.timestamp,
      correlationId: this.correlationId,
    };
  }
}

/**
 * Parse error response from the API
 * @param {Error} error - Error object from axios or other source
 * @returns {AppError} Normalized AppError
 */
export const parseApiError = (error) => {
  // Check if the error is an axios error with a response
  if (error.response) {
    const { data, status } = error.response;
    const correlationId = error.response.headers?.["x-correlation-id"];

    // Handle validation errors (400)
    if (status === 400) {
      return new AppError(
        data.message || "Validation error",
        ERROR_TYPES.VALIDATION,
        {
          status,
          errors: data.errors || {},
          code: data.code || "ERR_VALIDATION",
          correlationId,
        }
      );
    }

    // Handle authentication errors (401)
    if (status === 401) {
      return new AppError(
        data.message || "Authentication failed",
        ERROR_TYPES.AUTHENTICATION,
        {
          status,
          code: data.code || "ERR_AUTHENTICATION",
          correlationId,
        }
      );
    }

    // Handle authorization errors (403)
    if (status === 403) {
      return new AppError(
        data.message || "Authorization failed",
        ERROR_TYPES.AUTHENTICATION,
        {
          status,
          code: data.code || "ERR_AUTHORIZATION",
          correlationId,
        }
      );
    }

    // Handle server errors (500+)
    if (status >= 500) {
      return new AppError(data.message || "Server error", ERROR_TYPES.SERVER, {
        status,
        code: data.code || "ERR_SERVER",
        correlationId,
      });
    }

    // Handle other API errors
    return new AppError(data.message || "API error", ERROR_TYPES.SERVER, {
      status,
      code: data.code,
      correlationId,
    });
  }

  // Handle network errors (no response received)
  if (error.request) {
    return new AppError(
      "Network error: Could not connect to server",
      ERROR_TYPES.NETWORK,
      {
        code: "ERR_NETWORK",
      }
    );
  }

  // Handle other client-side errors
  return new AppError(error.message || "Unknown error", ERROR_TYPES.CLIENT, {
    originalError: error,
  });
};

/**
 * Global error handler for API calls
 * @param {Error} error - Error from API call
 * @param {Object} options - Error handling options
 * @returns {AppError} Parsed error
 */
export const handleApiError = (error, options = {}) => {
  const {
    showToast = true,
    logToConsole = true,
    defaultMessage = "Something went wrong",
    rethrow = false,
  } = options;

  // Parse the error
  const appError = error instanceof AppError ? error : parseApiError(error);

  // Log to console in development
  if (logToConsole) {
    console.error("API Error:", appError);
  }

  // Show toast notification
  if (showToast) {
    const toastMessage = appError.message || defaultMessage;

    // Use different toast types based on error type
    switch (appError.type) {
      case ERROR_TYPES.VALIDATION:
        toast.warn(toastMessage);
        break;
      case ERROR_TYPES.AUTHENTICATION:
        toast.error(toastMessage);
        break;
      case ERROR_TYPES.NETWORK:
        toast.error(toastMessage);
        break;
      default:
        toast.error(toastMessage);
    }
  }

  // Track error in monitoring service if available
  if (window.errorTracker) {
    window.errorTracker.captureError(appError);
  }

  // Rethrow if needed
  if (rethrow) {
    throw appError;
  }

  return appError;
};

/**
 * Handles validation errors specifically
 * @param {Object} errors - Validation errors object
 * @param {Function} setErrors - State setter for form errors
 */
export const handleValidationErrors = (errors, setErrors) => {
  if (errors && typeof errors === "object") {
    setErrors(errors);
  }
};

/**
 * Safe JSON parse with error handling
 * @param {string} json - JSON string to parse
 * @param {*} defaultValue - Default value if parsing fails
 * @returns {*} Parsed object or default value
 */
export const safeJsonParse = (json, defaultValue = {}) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error("JSON Parse Error:", error);
    return defaultValue;
  }
};
