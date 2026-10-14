import axiosInstance from "./axiosConfig";

const adminService = {
  // User Management
  getUsers: async (filters = {}) => {
    try {
      const {
        search,
        role,
        status,
        sortField,
        sortOrder,
        page = 1,
        limit = 10,
      } = filters;
      const response = await axiosInstance.get("/admin/users", {
        params: { page, limit, search, role, status, sortField, sortOrder },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await axiosInstance.post("/admin/users", userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateUser: async (userId, updates) => {
    try {
      const response = await axiosInstance.put(
        `/admin/users/${userId}`,
        updates
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Resource Management
  getResources: async (filters = {}) => {
    try {
      const {
        search,
        category,
        location,
        status,
        sortField,
        sortOrder,
        page = 1,
        limit = 10,
      } = filters;
      const response = await axiosInstance.get("/admin/resources", {
        params: {
          page,
          limit,
          search,
          category,
          location,
          status,
          sortField,
          sortOrder,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createResource: async (resourceData) => {
    try {
      const response = await axiosInstance.post(
        "/admin/resources",
        resourceData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateResource: async (resourceId, updates) => {
    try {
      const response = await axiosInstance.put(
        `/admin/resources/${resourceId}`,
        updates
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteResource: async (resourceId) => {
    try {
      const response = await axiosInstance.delete(
        `/admin/resources/${resourceId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Advanced Analytics
  getAdvancedAnalytics: async (timeframe, region) => {
    try {
      const response = await axiosInstance.get(
        "/admin/advanced-analytics",
        {
          params: { timeframe, region },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getPredictiveModelResults: async (params) => {
    try {
      const response = await axiosInstance.get(
        "/admin/analytics/predictions",
        {
          params,
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getOptimizedResourceAllocation: async (params) => {
    try {
      const response = await axiosInstance.get(
        "/admin/analytics/resource-optimization",
        { params }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Report Management
  getReports: async (page = 1, limit = 10, filters = {}) => {
    try {
      const response = await axiosInstance.get("/admin/reports", {
        params: { page, limit, ...filters },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  moderateReport: async (reportId, action, reason) => {
    try {
      const response = await axiosInstance.put(
        `/admin/reports/${reportId}/moderate`,
        {
          action,
          reason,
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Report Verification
  verifyReportAutomatically: async (reportId) => {
    try {
      const response = await axiosInstance.post(
        `/admin/reports/${reportId}/auto-verify`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getVerificationResult: async (reportId) => {
    try {
      const response = await axiosInstance.get(
        `/admin/reports/${reportId}/verification-status`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // System Statistics
  getSystemStats: async () => {
    try {
      const response = await axiosInstance.get("/admin/stats");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // User Activity
  getUserActivity: async (userId) => {
    try {
      const response = await axiosInstance.get(
        `/admin/users/${userId}/activity`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // System Health
  getSystemHealth: async () => {
    try {
      const response = await axiosInstance.get("/admin/system/health");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Audit Logs
  getAuditLogs: async (page = 1, limit = 10, filters = {}) => {
    try {
      const response = await axiosInstance.get("/admin/audit-logs", {
        params: { page, limit, ...filters },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Government System Integration
  syncWithGovernmentSystems: async (systemType) => {
    try {
      const response = await axiosInstance.post(
        "/admin/integrations/government/sync",
        { systemType }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getIntegrationStatus: async (systemType) => {
    try {
      const response = await axiosInstance.get(
        `/admin/integrations/government/status`,
        {
          params: { systemType },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default adminService;
