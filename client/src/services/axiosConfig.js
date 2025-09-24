import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { handleApiError, ERROR_TYPES } from "../utils/errorHandler";

const API_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api";

// Create Axios instance with enhanced configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Increased timeout for poor network conditions
  headers: {
    "Content-Type": "application/json",
  },
  // Enable cookies for CSRF protection if needed
  withCredentials: true,
});

// Add a request interceptor with correlation ID
axiosInstance.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Generate correlation ID for request tracing
    const correlationId = uuidv4();
    config.headers["X-Correlation-ID"] = correlationId;

    // Add offline request handling capabilities
    if (!navigator.onLine) {
      // Store offline requests in IndexedDB if it's not a GET request
      if (config.method !== "get") {
        const offlineRequest = {
          id: correlationId,
          url: config.url,
          method: config.method,
          data: config.data,
          headers: config.headers,
          timestamp: new Date().toISOString(),
        };

        // Use custom event to trigger offline storage (will be handled by offlineService)
        const event = new CustomEvent("storeOfflineRequest", {
          detail: offlineRequest,
        });
        window.dispatchEvent(event);

        // Return a friendly error response
        return Promise.reject({
          isOffline: true,
          message:
            "You are currently offline. This request has been queued and will be sent when you reconnect.",
        });
      }
    }

    // Add timestamp for debugging
    config.metadata = {
      startTime: new Date().getTime(),
      correlationId,
    };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor with enhanced error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Calculate API response time for monitoring
    const requestStartTime = response.config.metadata?.startTime;
    if (requestStartTime) {
      const endTime = new Date().getTime();
      const responseTime = endTime - requestStartTime;

      // Log API performance for monitoring
      console.debug(
        `API Response Time: ${responseTime}ms for ${response.config.url}`
      );

      // Track slow responses (over 2 seconds)
      if (responseTime > 2000) {
        console.warn(
          `Slow API response detected: ${responseTime}ms for ${response.config.url}`
        );
      }
    }

    // Extract correlation ID from response headers for tracking
    const correlationId = response.headers["x-correlation-id"];
    if (correlationId) {
      response.data.correlationId = correlationId;
    }

    return response;
  },
  (error) => {
    // Skip offline errors (they're handled differently)
    if (error.isOffline) {
      return Promise.reject(error);
    }

    // Handle session expiration
    if (error.response?.status === 401) {
      // Check if this is a token expiration issue
      const isExpiredToken =
        error.response.data?.code === "ERR_TOKEN_EXPIRED" ||
        error.response.data?.message?.includes("expired");

      if (isExpiredToken) {
        // Get refresh token if available
        const refreshToken = localStorage.getItem("refreshToken");

        // If we have a refresh token, try to get a new access token
        if (refreshToken) {
          // Store the failed request to retry after token refresh
          const originalRequest = error.config;

          // Attempt to refresh the token
          return axiosInstance
            .post("/auth/refresh-token", { refreshToken })
            .then((response) => {
              // Update stored tokens
              const { token, refreshToken: newRefreshToken } = response.data;
              localStorage.setItem("token", token);
              localStorage.setItem("refreshToken", newRefreshToken);

              // Update the authorization header
              originalRequest.headers.Authorization = `Bearer ${token}`;

              // Retry the original request
              return axiosInstance(originalRequest);
            })
            .catch((refreshError) => {
              // If refresh token fails, log out the user
              console.error("Token refresh failed:", refreshError);
              localStorage.removeItem("token");
              localStorage.removeItem("refreshToken");
              localStorage.removeItem("user");

              // Redirect to login
              window.location.href = "/login?session=expired";
              return Promise.reject(refreshError);
            });
        } else {
          // No refresh token, clear auth data and redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login?session=expired";
        }
      }
    }

    // Handle server errors with retry logic for network issues
    if (error.code === "ECONNABORTED" || !error.response) {
      const config = error.config;

      // Implement retry logic for network timeouts and server errors
      if (!config || !config._retry) {
        if (config) {
          config._retry = true;
          config.timeout = 30000; // Extended timeout for retry

          // Retry the request after a short delay
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(axiosInstance(config));
            }, 1000);
          });
        }
      }
    }

    // Use our custom error handler for all other errors
    return Promise.reject(error);
  }
);

/**
 * Make API request with automatic error handling
 * @param {string} method - HTTP method
 * @param {string} url - API endpoint
 * @param {object} data - Request data
 * @param {object} options - Request options
 * @returns {Promise} - API response
 */
export const apiRequest = async (method, url, data = null, options = {}) => {
  try {
    const config = {
      method,
      url,
      ...options,
    };

    if (data) {
      if (method.toLowerCase() === "get") {
        config.params = data;
      } else {
        config.data = data;
      }
    }

    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    return handleApiError(error, {
      showToast: options.showToast !== false, // Default to true
      rethrow: options.rethrow === true, // Default to false
    });
  }
};

export default axiosInstance;
