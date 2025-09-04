import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const dashboardService = {
  getDashboardData: async (timeRange = "7d") => {
    const response = await axios.get(
      `${API_URL}/dashboard/stats?timeRange=${timeRange}`
    );
    return response.data;
  },

  getRecentReports: async (limit = 5) => {
    const response = await axios.get(
      `${API_URL}/flood-reports?limit=${limit}&sort=-createdAt`
    );
    return response.data.reports;
  },

  getActiveAlerts: async () => {
    const response = await axios.get(`${API_URL}/alerts?status=active`);
    return response.data.alerts;
  },
};
