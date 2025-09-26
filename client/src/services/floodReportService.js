import api from "./axiosConfig";

export const floodReportService = {
  submitReport: async (formData) => {
    const response = await api.post("/flood-reports", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },

  getReports: async (params = {}) => {
    const response = await api.get("/flood-reports", { params });
    return response.data;
  },

  getReportById: async (id) => {
    const response = await api.get(`/flood-reports/${id}`);
    return response.data;
  },

  voteOnReport: async (id, vote) => {
    const response = await api.post(`/flood-reports/${id}/vote`, {
      vote,
    });
    return response.data;
  },

  submitFloodReport: async (reportData) => {
    try {
      const response = await api.post("/flood-reports", reportData);
      return response.data;
    } catch (error) {
      console.error("Error submitting flood report:", error);
      throw error;
    }
  },

  // Get all flood reports for admin
  getAdminFloodReports: async () => {
    try {
      const response = await api.get("/api/admin/flood-reports");
      return response.data;
    } catch (error) {
      console.error("Error fetching admin flood reports:", error);
      throw error;
    }
  },

  // Get flood reports with filters
  getFloodReports: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/api/flood-reports?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching flood reports:", error);
      throw error;
    }
  },

  // Get single flood report by ID
  getFloodReportById: async (id) => {
    try {
      const response = await api.get(`/api/flood-reports/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching flood report:", error);
      throw error;
    }
  },

  // Create new flood report
  createFloodReport: async (reportData) => {
    try {
      const response = await api.post("/api/flood-reports", reportData);
      return response.data;
    } catch (error) {
      console.error("Error creating flood report:", error);
      throw error;
    }
  },

  // Update flood report
  updateFloodReport: async (id, reportData) => {
    try {
      const response = await api.put(`/api/flood-reports/${id}`, reportData);
      return response.data;
    } catch (error) {
      console.error("Error updating flood report:", error);
      throw error;
    }
  },

  // Delete flood report
  deleteFloodReport: async (id) => {
    try {
      const response = await api.delete(`/api/flood-reports/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting flood report:", error);
      throw error;
    }
  },

  // Update report status (for admin)
  updateReportStatus: async (id, status) => {
    try {
      const response = await api.patch(
        `/api/admin/flood-reports/${id}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating report status:", error);
      throw error;
    }
  },

  // Verify report (for admin)
  verifyReport: async (id, verified) => {
    try {
      const response = await api.patch(
        `/api/admin/flood-reports/${id}/verify`,
        { verified }
      );
      return response.data;
    } catch (error) {
      console.error("Error verifying report:", error);
      throw error;
    }
  },
};

export default floodReportService;
