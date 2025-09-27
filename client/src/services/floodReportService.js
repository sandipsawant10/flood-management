import axiosInstance from "./axiosConfig";

export const floodReportService = {
  submitReport: async (formData) => {
    try {
      console.log("Submitting flood report...", formData);
      const response = await axiosInstance.post("/flood-reports", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // Increase timeout to 30 seconds for file uploads
      });
      console.log("Flood report submitted successfully:", response.data);
      return response;
    } catch (error) {
      console.error("Error in submitReport:", error);

      // Provide more specific error messages
      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Request timeout - the server is taking too long to respond. Please check your internet connection and try again."
        );
      } else if (error.response?.status === 413) {
        throw new Error(
          "File too large - please reduce the size of your images and try again."
        );
      } else if (error.response?.status >= 500) {
        throw new Error("Server error - please try again later.");
      } else if (error.response?.status === 401) {
        throw new Error(
          "Authentication required - please log in and try again."
        );
      } else if (!navigator.onLine) {
        throw new Error(
          "No internet connection - please check your connection and try again."
        );
      }

      throw error;
    }
  },

  getReports: async (params = {}) => {
    const response = await axiosInstance.get("/flood-reports", { params });
    return response.data;
  },

  getReportById: async (id) => {
    const response = await axiosInstance.get(`/flood-reports/${id}`);
    return response.data;
  },

  voteOnReport: async (id, vote) => {
    const response = await axiosInstance.post(`/flood-reports/${id}/vote`, {
      vote,
    });
    return response.data;
  },

  submitFloodReport: async (reportData) => {
    try {
      const response = await axiosInstance.post("/flood-reports", reportData);
      return response.data;
    } catch (error) {
      console.error("Error submitting flood report:", error);
      throw error;
    }
  },

  // Get all flood reports for admin
  getAdminFloodReports: async () => {
    try {
      const response = await axiosInstance.get("/admin/flood-reports");
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
      const response = await axiosInstance.get(`/flood-reports?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching flood reports:", error);
      throw error;
    }
  },

  // Get single flood report by ID
  getFloodReportById: async (id) => {
    try {
      const response = await axiosInstance.get(`/flood-reports/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching flood report:", error);
      throw error;
    }
  },

  // Create new flood report
  createFloodReport: async (reportData) => {
    try {
      const response = await axiosInstance.post("/flood-reports", reportData);
      return response.data;
    } catch (error) {
      console.error("Error creating flood report:", error);
      throw error;
    }
  },

  // Update flood report
  updateFloodReport: async (id, reportData) => {
    try {
      const response = await axiosInstance.put(
        `/flood-reports/${id}`,
        reportData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating flood report:", error);
      throw error;
    }
  },

  // Delete flood report
  deleteFloodReport: async (id) => {
    try {
      const response = await axiosInstance.delete(`/flood-reports/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting flood report:", error);
      throw error;
    }
  },

  // Update report status (for admin)
  updateReportStatus: async (id, status) => {
    try {
      const response = await axiosInstance.patch(
        `/admin/flood-reports/${id}/status`,
        {
          status,
        }
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
      const response = await axiosInstance.patch(
        `/admin/flood-reports/${id}/verify`,
        {
          verified,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error verifying report:", error);
      throw error;
    }
  },
};

export default floodReportService;
