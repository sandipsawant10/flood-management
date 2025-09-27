import axiosInstance from "./axiosConfig";

const API = "/verification";

const verificationService = {
  /**
   * Trigger AI verification for a specific report
   * @param {string} reportId - The ID of the report to verify
   * @returns {Promise<Object>} - The verification results
   */
  verifyReport: async (reportId) => {
    try {
      const response = await axiosInstance.post(
        `${API}/verify/${reportId}`,
        {}
      );
      return response.data;
    } catch (error) {
      console.error("Error triggering AI verification:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get verification status for a report
   * @param {string} reportId - The ID of the report
   * @returns {Promise<Object>} - The verification status
   */
  getVerificationStatus: async (reportId) => {
    try {
      const response = await axiosInstance.get(`${API}/status/${reportId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting verification status:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Trigger bulk verification of pending reports
   * @param {number} limit - Maximum number of reports to verify
   * @returns {Promise<Object>} - The bulk verification results
   */
  bulkVerifyReports: async (limit = 20) => {
    try {
      const response = await axiosInstance.post(`${API}/bulk-verify`, {
        limit,
      });
      return response.data;
    } catch (error) {
      console.error("Error triggering bulk verification:", error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get verification statistics
   * @returns {Promise<Object>} - The verification statistics
   */
  getVerificationStatistics: async () => {
    try {
      const response = await axiosInstance.get(`${API}/statistics`);
      return response.data;
    } catch (error) {
      console.error("Error getting verification statistics:", error);
      throw error.response?.data || error.message;
    }
  },
};

export default verificationService;
