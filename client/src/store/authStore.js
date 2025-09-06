// src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Initialize auth from localStorage
      initializeAuth: () => {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (token && user) {
          try {
            set({
              token,
              user: JSON.parse(user),
            });

            // Set axios default header
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          } catch (error) {
            console.error("Error parsing stored user data:", error);
            get().logout();
          }
        }
      },

      // Login function
      login: async ({ email, phone, password }) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.post("/api/auth/login", {
            login: email || phone,
            password,
          });

          const { token, user } = response.data;

          // Store in localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          // Set axios default header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({ user, token, isLoading: false, error: null });

          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Login failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Register function
      register: async (userData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.post("/api/auth/register", userData);
          const { token, user } = response.data;

          // Store in localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          // Set axios default header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({ user, token, isLoading: false, error: null });

          return { success: true };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Registration failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Update profile
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });

        try {
          const user = get().user;
          if (!user) throw new Error("User not logged in");

          // Prepare only changed fields
          const updates = {};

          if (profileData.name && profileData.name !== user.name) {
            updates.name = profileData.name;
          }

          if (profileData.location) {
            updates.location = { ...user.location, ...profileData.location };
          }

          if (profileData.preferences) {
            updates.preferences = {
              ...user.preferences,
              ...profileData.preferences,
            };
          }

          if (profileData.avatar) {
            updates.avatar = profileData.avatar;
          }

          // Only send non-empty updates
          if (Object.keys(updates).length === 0) {
            set({ isLoading: false });
            return { success: true, message: "No changes to update" };
          }

          const response = await axios.put("/api/auth/profile", updates);

          const updatedUser = response.data.user;

          // Update localStorage
          localStorage.setItem("user", JSON.stringify(updatedUser));

          set({ user: updatedUser, isLoading: false, error: null });

          return { success: true };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Profile update failed";
          set({ isLoading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Logout function
      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];

        set({ user: null, token: null, isLoading: false, error: null });
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: "flood-auth-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export { useAuthStore };
