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
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.post("/api/auth/login", credentials);
          const { token, user } = response.data;

          // Store in localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));

          // Set axios default header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          set({
            user,
            token,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Login failed";
          set({
            isLoading: false,
            error: errorMessage,
          });
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

          set({
            user,
            token,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Registration failed";
          set({
            isLoading: false,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Update profile
      updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.put("/api/auth/profile", profileData);
          const { user } = response.data;

          // Update localStorage
          localStorage.setItem("user", JSON.stringify(user));

          set({
            user,
            isLoading: false,
            error: null,
          });

          return { success: true };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Profile update failed";
          set({
            isLoading: false,
            error: errorMessage,
          });
          return { success: false, error: errorMessage };
        }
      },

      // Logout function
      logout: () => {
        // Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Clear axios default header
        delete axios.defaults.headers.common["Authorization"];

        set({
          user: null,
          token: null,
          isLoading: false,
          error: null,
        });
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: "flood-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export { useAuthStore };
