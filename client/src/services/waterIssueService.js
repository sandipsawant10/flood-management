import axios from "axios";
import { API_BASE_URL } from "../config/constants";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const waterIssueService = {
  // Submit a new water issue report
  submitReport: async (formData) => {
    try {
      const response = await api.post("/water-issues", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get all water issues with filtering
  getIssues: async (params = {}) => {
    try {
      const response = await api.get("/water-issues", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get a single water issue by ID
  getIssueById: async (id) => {
    try {
      const response = await api.get(`/water-issues/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update a water issue
  updateIssue: async (id, data) => {
    try {
      const response = await api.put(`/water-issues/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Vote on a water issue
  voteOnIssue: async (id, vote) => {
    try {
      const response = await api.post(`/water-issues/${id}/vote`, { vote });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Verify a water issue (admin/municipal only)
  verifyIssue: async (id, verificationData) => {
    try {
      const response = await api.post(
        `/water-issues/${id}/verify`,
        verificationData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add municipality response (admin/municipal only)
  addMunicipalityResponse: async (id, responseData) => {
    try {
      const response = await api.post(
        `/water-issues/${id}/municipality-response`,
        responseData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get water issue statistics
  getStatistics: async (params = {}) => {
    try {
      const response = await api.get("/water-issues/stats/summary", { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete a water issue (admin only)
  deleteIssue: async (id) => {
    try {
      const response = await api.delete(`/water-issues/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default waterIssueService;
