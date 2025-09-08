import axios from "axios";

const API_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const profileService = {
  getUserProfile: async () => {
    // For development, return mock data
    // In production, uncomment the axios call and remove the mock data

    // const response = await axios.get(`${API_URL}/auth/profile`);
    // return response.data.user;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: "user123",
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+91 9876543210",
          avatar: "https://i.pravatar.cc/300",
          trustScore: 95,
          reportsSubmitted: 12,
          verifiedReports: 8,
          location: {
            district: "Bangalore Urban",
            state: "Karnataka",
            address: "123 Main Street, Koramangala",
            coordinates: [77.6301, 12.9279],
          },
          preferences: {
            notifications: {
              emailAlerts: true,
              smsAlerts: false,
              pushNotifications: true,
              communityUpdates: true,
              weatherAlerts: true,
            },
            language: "en",
          },
          isVerified: true,
          createdAt: "2023-06-15T10:30:00.000Z",
          lastActive: new Date().toISOString(),
        });
      }, 800);
    });
  },

  updateProfile: async (profileData) => {
    // For development, return mock success
    // In production, uncomment the axios call and remove the mock response

    // const response = await axios.put(`${API_URL}/auth/profile`, profileData);
    // return response.data;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "Profile updated successfully" });
      }, 800);
    });
  },

  updateNotificationPreferences: async (preferences) => {
    // For development, return mock success
    // In production, uncomment the axios call and remove the mock response

    // const response = await axios.put(`${API_URL}/auth/profile/notifications`, preferences);
    // return response.data;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: "Notification preferences updated successfully",
        });
      }, 500);
    });
  },

  changePassword: async (passwordData) => {
    // For development, return mock success
    // In production, uncomment the axios call and remove the mock response

    // const response = await axios.put(`${API_URL}/auth/change-password`, passwordData);
    // return response.data;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "Password changed successfully" });
      }, 800);
    });
  },
};
