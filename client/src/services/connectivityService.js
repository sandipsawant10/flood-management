import axiosInstance from "./axiosConfig";

/**
 * Service for testing server connectivity and health
 */
export const connectivityService = {
  /**
   * Test if the server is reachable
   */
  testConnection: async () => {
    try {
      console.log("Testing server connection...");
      const response = await axiosInstance.get("/health", {
        timeout: 5000, // Short timeout for connectivity test
      });
      console.log("Server connection successful:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Server connection failed:", error);

      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          error: "Connection timeout - server is not responding",
          code: "TIMEOUT",
        };
      } else if (
        error.code === "ECONNREFUSED" ||
        error.message.includes("ECONNREFUSED")
      ) {
        return {
          success: false,
          error: "Connection refused - server may not be running on port 5003",
          code: "CONNECTION_REFUSED",
        };
      } else if (error.code === "ENETUNREACH") {
        return {
          success: false,
          error: "Network unreachable - check your internet connection",
          code: "NETWORK_ERROR",
        };
      }

      return {
        success: false,
        error: error.message || "Unknown connection error",
        code: "UNKNOWN_ERROR",
      };
    }
  },

  /**
   * Test authentication endpoint
   */
  testAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/me", {
        timeout: 5000,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
      };
    }
  },

  /**
   * Test flood reports endpoint
   */
  testFloodReports: async () => {
    try {
      const response = await axiosInstance.get("/flood-reports?limit=1", {
        timeout: 5000,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        status: error.response?.status,
      };
    }
  },
};

export default connectivityService;
