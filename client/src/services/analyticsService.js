import axios from "axios";

const API_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api";

export const analyticsService = {
  getAnalyticsData: async (timeRange) => {
    // For development, return mock data
    // In production, uncomment the axios call and remove the mock data

    // const response = await axios.get(`${API_URL}/analytics/dashboard?timeRange=${timeRange}`);
    // return response.data;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          reportsByDay: [
            { date: "Mon", reports: 12, verified: 8 },
            { date: "Tue", reports: 19, verified: 12 },
            { date: "Wed", reports: 15, verified: 10 },
            { date: "Thu", reports: 25, verified: 18 },
            { date: "Fri", reports: 32, verified: 22 },
            { date: "Sat", reports: 18, verified: 14 },
            { date: "Sun", reports: 10, verified: 7 },
          ],
          reportsBySeverity: [
            { name: "Critical", value: 18 },
            { name: "High", value: 25 },
            { name: "Medium", value: 42 },
            { name: "Low", value: 15 },
          ],
          reportsByRegion: [
            { name: "North District", reports: 35 },
            { name: "South District", reports: 28 },
            { name: "East District", reports: 42 },
            { name: "West District", reports: 19 },
            { name: "Central District", reports: 25 },
          ],
          alertTrends: [
            { month: "Jan", alerts: 8 },
            { month: "Feb", alerts: 12 },
            { month: "Mar", alerts: 15 },
            { month: "Apr", alerts: 10 },
            { month: "May", alerts: 18 },
            { month: "Jun", alerts: 25 },
          ],
          stats: {
            totalReports: 245,
            verifiedReports: 178,
            activeAlerts: 12,
            affectedAreas: 8,
            verificationRate: 72.6,
            avgResponseTime: 18, // minutes
          },
        });
      }, 800);
    });
  },

  getPredictions: async (location) => {
    // For development, return mock data
    // In production, uncomment the axios call and remove the mock data

    // const response = await axios.get(`${API_URL}/analytics/predictions`, { params: location });
    // return response.data;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          predictions: [
            {
              location: {
                state: location?.state || "Karnataka",
                district: location?.district || "Bangalore",
              },
              riskLevel: "medium",
              probability: 65,
              timeframe: "48 hours",
              factors: [
                "Heavy rainfall forecast",
                "River water level rising",
                "Monsoon season",
              ],
            },
          ],
        });
      }, 500);
    });
  },

  exportData: async (format, params) => {
    // For development, return mock success
    // In production, uncomment the axios call and remove the mock response

    // const response = await axios.get(`${API_URL}/analytics/export/${format}`, { params });
    // return response.data;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: `Data exported in ${format} format`,
        });
      }, 500);
    });
  },
};
