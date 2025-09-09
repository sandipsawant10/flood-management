import axios from "axios";

const adminService = {
  // User Management
  getUsers: async (page = 1, limit = 10, filters = {}) => {
    try {
      const response = await axios.get("/api/admin/users", {
        params: { page, limit, ...filters },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateUser: async (userId, updates) => {
    try {
      const response = await axios.put(`/api/admin/users/${userId}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Report Management
  getReports: async (page = 1, limit = 10, filters = {}) => {
    try {
      const response = await axios.get("/api/admin/reports", {
        params: { page, limit, ...filters },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  moderateReport: async (reportId, action, reason) => {
    try {
      const response = await axios.put(`/api/admin/reports/${reportId}/moderate`, {
        action,
        reason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // System Statistics
  getSystemStats: async () => {
    try {
      const response = await axios.get("/api/admin/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // User Activity
  getUserActivity: async (userId) => {
    try {
      const response = await axios.get(`/api/admin/users/${userId}/activity`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // System Health
  getSystemHealth: async () => {
    try {
      const response = await axios.get("/api/admin/system/health");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Audit Logs
  getAuditLogs: async (page = 1, limit = 10, filters = {}) => {
    try {
      const response = await axios.get("/api/admin/audit-logs", {
        params: { page, limit, ...filters },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default adminService;