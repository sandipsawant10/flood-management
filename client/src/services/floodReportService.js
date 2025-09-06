import axios from "axios";

const API_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const floodReportService = {
  submitReport: async (formData) => {
    const response = await axios.post(`${API_URL}/flood-reports`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },

  getReports: async (params = {}) => {
    const response = await axios.get(`${API_URL}/flood-reports`, { params });
    return response.data;
  },

  getReportById: async (id) => {
    const response = await axios.get(`${API_URL}/flood-reports/${id}`);
    return response.data;
  },

  voteOnReport: async (id, vote) => {
    const response = await axios.post(`${API_URL}/flood-reports/${id}/vote`, {
      vote,
    });
    return response.data;
  },
};
