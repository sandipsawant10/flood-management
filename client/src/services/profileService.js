import axiosInstance from "./axiosConfig";

export const profileService = {
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get("/auth/profile");
      return response.data.user;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await axiosInstance.put("/auth/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  updateNotificationPreferences: async (preferences) => {
    try {
      const response = await axiosInstance.put(
        "/auth/profile/notifications",
        preferences
      );
      return response.data;
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await axiosInstance.put(
        "/auth/change-password",
        passwordData
      );
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },
};
