import React, { createContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosConfig";
import { handleApiError } from "../utils/errorHandler";

const AuthContext = createContext(null);

// Helper to get session data from localStorage or sessionStorage
const getStoredSessionData = () => {
  // Try to get from localStorage first (remember me)
  let sessionData = localStorage.getItem("sessionData");
  let storageType = "local";

  // If not in localStorage, try sessionStorage (session only)
  if (!sessionData) {
    sessionData = sessionStorage.getItem("sessionData");
    storageType = "session";
  }

  if (sessionData) {
    try {
      return {
        data: JSON.parse(sessionData),
        storageType,
      };
    } catch (e) {
      console.error("Failed to parse session data:", e);
      return null;
    }
  }

  return null;
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [refreshTimer, setRefreshTimer] = useState(null);

  // Handle logout function declaration (defined before it's used)
  const handleLogout = useCallback(() => {
    // Clear both storage types to be safe
    localStorage.removeItem("sessionData");
    sessionStorage.removeItem("sessionData");

    // Clear auth header
    delete axiosInstance.defaults.headers.common["Authorization"];

    // Reset states
    setUser(null);
    setTokenExpiry(null);

    // Clear any scheduled refresh
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      setRefreshTimer(null);
    }
  }, [refreshTimer]);

  // Schedule token refresh before expiry
  const scheduleTokenRefresh = useCallback(
    (expiryTime) => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      if (!expiryTime) return;

      const timeUntilExpiry = expiryTime - Date.now();

      // Refresh token when 90% of its lifetime has passed
      const refreshTime = timeUntilExpiry * 0.9;

      // Only schedule if refresh time is positive and reasonable
      if (refreshTime > 0 && refreshTime < 2147483647) {
        // Max setTimeout value
        const timer = setTimeout(() => refreshAuthToken(), refreshTime);
        setRefreshTimer(timer);
      }
    },
    [refreshTimer]
  );

  // Function to refresh token before it expires
  const refreshAuthToken = useCallback(async () => {
    try {
      // Check if we have a refresh token
      const sessionData = getStoredSessionData()?.data;
      if (!sessionData?.refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axiosInstance.post("/api/auth/refresh-token", {
        refreshToken: sessionData.refreshToken,
      });

      // Update tokens in storage
      const storageMethod = sessionData.rememberMe
        ? localStorage
        : sessionStorage;
      const newSessionData = {
        ...sessionData,
        token: response.data.token,
        refreshToken: response.data.refreshToken || sessionData.refreshToken,
        tokenExpiry: Date.now() + response.data.expiresIn * 1000,
      };

      storageMethod.setItem("sessionData", JSON.stringify(newSessionData));

      // Update axios headers
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${response.data.token}`;

      // Set new token expiry and schedule next refresh
      setTokenExpiry(newSessionData.tokenExpiry);
      scheduleTokenRefresh(newSessionData.tokenExpiry);

      return true;
    } catch (err) {
      console.error("Failed to refresh token:", err);
      // If refresh fails, log the user out
      handleLogout();
      return false;
    }
  }, [handleLogout, scheduleTokenRefresh]);

  // Load user data from API using token
  const loadUserProfile = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/api/auth/profile");
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      setError(handleApiError(error, { showToast: false }).message);
      return null;
    }
  }, []);

  // Initialize auth state from stored session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedSession = getStoredSessionData();

        if (storedSession?.data?.token) {
          const { token, tokenExpiry, refreshToken } = storedSession.data;

          // Set axios auth header
          axiosInstance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;

          // Check if token is expired
          const now = Date.now();
          const isExpired = tokenExpiry && tokenExpiry < now;

          if (isExpired && refreshToken) {
            // Token expired, try to refresh
            const refreshed = await refreshAuthToken();
            if (!refreshed) {
              setLoading(false);
              setAuthInitialized(true);
              return;
            }
          } else if (isExpired) {
            // Token expired and no refresh token, log out
            handleLogout();
            setLoading(false);
            setAuthInitialized(true);
            return;
          } else {
            // Token still valid, schedule refresh
            setTokenExpiry(tokenExpiry);
            scheduleTokenRefresh(tokenExpiry);
          }

          // Load user profile
          await loadUserProfile();
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError("Failed to initialize authentication");
      } finally {
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    initAuth();

    // Cleanup refresh timer on unmount
    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [
    loadUserProfile,
    refreshAuthToken,
    refreshTimer,
    scheduleTokenRefresh,
    handleLogout,
  ]);

  // Handle login process
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await axiosInstance.post("/api/auth/login", {
        login: email, // Backend expects 'login' field, not 'email'
        password,
      });

      const { token, refreshToken, user, expiresIn } = response.data;

      // Calculate token expiry time
      const tokenExpiry = Date.now() + expiresIn * 1000; // Convert seconds to milliseconds

      // Create session data object
      const sessionData = {
        token,
        refreshToken,
        tokenExpiry,
        rememberMe,
      };

      // Store in appropriate storage based on remember me
      const storageMethod = rememberMe ? localStorage : sessionStorage;
      storageMethod.setItem("sessionData", JSON.stringify(sessionData));

      // Set axios auth header
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      // Set user state
      setUser(user);
      setTokenExpiry(tokenExpiry);

      // Schedule token refresh
      scheduleTokenRefresh(tokenExpiry);

      return { success: true, user };
    } catch (error) {
      const parsedError = handleApiError(error, { showToast: true });
      return {
        success: false,
        error: parsedError.message,
        errorCode: parsedError.details?.code || "ERR_LOGIN_FAILED",
      };
    }
  };

  // Logout function that can be called by components
  const logout = async () => {
    try {
      // Optional: Call logout endpoint if you have one
      // await axiosInstance.post('/api/auth/logout');
      handleLogout();
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear local state even if server logout fails
      handleLogout();
      return false;
    }
  };

  // Check if session is active and valid
  const isSessionActive = useCallback(() => {
    if (!user) return false;

    // Check if token is expired
    if (tokenExpiry && Date.now() > tokenExpiry) {
      return false;
    }

    return true;
  }, [user, tokenExpiry]);

  // Context value
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    refreshToken: refreshAuthToken,
    isSessionActive,
    authInitialized,
    tokenExpiry,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
