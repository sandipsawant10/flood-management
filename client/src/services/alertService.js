import axios from "axios";

const API_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const alertService = {
  getAlerts: async (params = {}) => {
    // For development, return mock data
    // In production, uncomment the axios call and remove the mock data

    // const response = await axios.get(`${API_URL}/alerts`, { params });
    // return response.data;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          alerts: [
            {
              id: "alert-001",
              title: "Critical Flood Warning",
              description:
                "Heavy rainfall has caused severe flooding in downtown area. Evacuate immediately.",
              severity: "critical",
              type: "flood",
              location: {
                district: "Central District",
                state: "Karnataka",
                coordinates: [77.5946, 12.9716],
              },
              status: "active",
              createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
              updatedAt: new Date().toISOString(),
              source: "government",
            },
            {
              id: "alert-002",
              title: "Flash Flood Alert",
              description:
                "Flash floods expected in low-lying areas near River Valley. Take precautions.",
              severity: "high",
              type: "flood",
              location: {
                district: "River District",
                state: "Karnataka",
                coordinates: [77.6046, 12.9816],
              },
              status: "active",
              createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
              updatedAt: new Date().toISOString(),
              source: "meteorological",
            },
            {
              id: "alert-003",
              title: "Heavy Rainfall Warning",
              description:
                "Continuous heavy rainfall expected for next 24 hours. Prepare for possible flooding.",
              severity: "medium",
              type: "weather",
              location: {
                district: "North District",
                state: "Karnataka",
                coordinates: [77.5846, 13.0016],
              },
              status: "active",
              createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
              updatedAt: new Date().toISOString(),
              source: "meteorological",
            },
            {
              id: "alert-004",
              title: "Road Closure Alert",
              description:
                "Main Highway 7 closed due to flooding. Use alternate routes.",
              severity: "medium",
              type: "infrastructure",
              location: {
                district: "East District",
                state: "Karnataka",
                coordinates: [77.6246, 12.9516],
              },
              status: "active",
              createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
              updatedAt: new Date().toISOString(),
              source: "transportation",
            },
            {
              id: "alert-005",
              title: "Dam Water Release Notice",
              description:
                "Controlled water release from Central Dam scheduled at 3 PM today. Areas downstream advised to be cautious.",
              severity: "low",
              type: "infrastructure",
              location: {
                district: "West District",
                state: "Karnataka",
                coordinates: [77.5646, 12.9616],
              },
              status: "active",
              createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4 hours ago
              updatedAt: new Date().toISOString(),
              source: "government",
            },
          ],
        });
      }, 800);
    });
  },

  getAlertById: async (id) => {
    // For development, return mock data
    // In production, uncomment the axios call and remove the mock data

    // const response = await axios.get(`${API_URL}/alerts/${id}`);
    // return response.data;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: id,
          title: "Critical Flood Warning",
          description:
            "Heavy rainfall has caused severe flooding in downtown area. Evacuate immediately.",
          severity: "critical",
          type: "flood",
          location: {
            district: "Central District",
            state: "Karnataka",
            coordinates: [77.5946, 12.9716],
          },
          status: "active",
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          updatedAt: new Date().toISOString(),
          source: "government",
          details: {
            affectedAreas: ["Downtown", "Riverside", "Market Square"],
            evacuationRoutes: ["Route 7", "Eastern Highway"],
            shelterLocations: ["Central School", "Community Hall"],
          },
        });
      }, 500);
    });
  },

  subscribeToAlerts: async (preferences) => {
    // For development, return mock success
    // In production, uncomment the axios call and remove the mock response

    // const response = await axios.post(`${API_URL}/alerts/subscribe`, preferences);
    // return response.data;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Successfully subscribed to alerts",
        });
      }, 500);
    });
  },

  unsubscribeFromAlerts: async (alertTypeId) => {
    // For development, return mock success
    // In production, uncomment the axios call and remove the mock response

    // const response = await axios.post(`${API_URL}/alerts/unsubscribe`, { alertTypeId });
    // return response.data;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Successfully unsubscribed from alerts",
        });
      }, 500);
    });
  },
};
