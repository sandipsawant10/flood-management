import axios from "axios";
import { API_URL } from "../config";

const API = `${API_URL}/api/verification`;

const verificationService = {
  /**
   * Trigger AI verification for a specific report
   * @param {string} reportId - The ID of the report to verify
   * @returns {Promise<Object>} - The verification results
   */
  verifyReport: async (reportId) => {
    try {
      const response = await axios.post(
        `${API}/verify/${reportId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
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
      const response = await axios.get(`${API}/status/${reportId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
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
      const response = await axios.post(
        `${API}/bulk-verify`,
        { limit },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
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
      const response = await axios.get(`${API}/statistics`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting verification statistics:", error);
      throw error.response?.data || error.message;
    }
  },
};

export default verificationService;
