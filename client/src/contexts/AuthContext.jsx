import React, { createContext, useState, useEffect, useCallback } from "react";
import axiosInstance from "../services/axiosConfig";
import { handleApiError } from "../utils/errorHandler";
import { setAuthToken, clearAuthToken } from "../utils/tokenUtils";

export const AuthContext = createContext(null);

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

  // Handle logout function declaration (defined before it's used)
  const handleLogout = useCallback(() => {
    // Clear both storage types to be safe
    localStorage.removeItem("sessionData");
    sessionStorage.removeItem("sessionData");

    // Clear auth token from all storage locations
    clearAuthToken();

    // Clear auth header
    delete axiosInstance.defaults.headers.common["Authorization"];

    // Reset states
    setUser(null);
    setTokenExpiry(null);
    setError(null);
  }, []);

  // Function to refresh token before it expires
  const refreshAuthToken = useCallback(async () => {
    try {
      // Check if we have a refresh token
      const sessionData = getStoredSessionData()?.data;
      if (!sessionData?.refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axiosInstance.post("/auth/refresh-token", {
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

      // Set new token expiry
      setTokenExpiry(newSessionData.tokenExpiry);

      return true;
    } catch (err) {
      console.error("Failed to refresh token:", err);
      // If refresh fails, log the user out
      handleLogout();
      return false;
    }
  }, [handleLogout]);

  // Initialize auth state from stored session - run only once
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        if (!isMounted) return;

        setLoading(true);
        setError(null);

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
            try {
              const refreshResponse = await axiosInstance.post(
                "/auth/refresh-token",
                {
                  refreshToken: storedSession.data.refreshToken,
                }
              );
              if (!isMounted) return;

              // Update tokens in storage
              const newSessionData = {
                ...storedSession.data,
                token: refreshResponse.data.token,
                refreshToken: refreshResponse.data.refreshToken || refreshToken,
                tokenExpiry: Date.now() + refreshResponse.data.expiresIn * 1000,
              };

              const storageMethod = storedSession.data.rememberMe
                ? localStorage
                : sessionStorage;
              storageMethod.setItem(
                "sessionData",
                JSON.stringify(newSessionData)
              );

              // Update axios headers
              axiosInstance.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${refreshResponse.data.token}`;

              // Set token expiry
              setTokenExpiry(newSessionData.tokenExpiry);
            } catch (refreshError) {
              console.error("Token refresh failed:", refreshError);
              // Clear invalid session
              localStorage.removeItem("sessionData");
              sessionStorage.removeItem("sessionData");
              delete axiosInstance.defaults.headers.common["Authorization"];
              if (!isMounted) return;
              setUser(null);
              setLoading(false);
              setAuthInitialized(true);
              return;
            }
          } else if (isExpired) {
            // Token expired and no refresh token, clear session
            localStorage.removeItem("sessionData");
            sessionStorage.removeItem("sessionData");
            delete axiosInstance.defaults.headers.common["Authorization"];
            if (!isMounted) return;
            setUser(null);
            setLoading(false);
            setAuthInitialized(true);
            return;
          } else {
            // Token still valid
            setTokenExpiry(tokenExpiry);
          }

          // Load user profile
          try {
            console.log("AuthContext: Loading user profile...");
            const response = await axiosInstance.get("/auth/profile");
            console.log("AuthContext: Profile response:", response.data);
            if (!isMounted) return;
            setUser(response.data.user);
            console.log(
              "AuthContext: User set from profile:",
              response.data.user
            );
          } catch (profileError) {
            console.error("Profile loading failed:", profileError);
            // Clear invalid session
            localStorage.removeItem("sessionData");
            sessionStorage.removeItem("sessionData");
            delete axiosInstance.defaults.headers.common["Authorization"];
            if (!isMounted) return;
            setUser(null);
            console.log("AuthContext: User cleared due to profile error");
          }
        } else {
          // No stored session found
          if (!isMounted) return;
          setUser(null);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
        if (!isMounted) return;
        setError("Failed to initialize authentication");
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
          setAuthInitialized(true);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - run only once on mount

  // Handle login process
  const login = async (email, password, rememberMe = false) => {
    try {
      console.log("AuthContext: Starting login for:", email);
      const response = await axiosInstance.post("/auth/login", {
        login: email,
        password,
      });

      console.log("AuthContext: Login response:", response.data);
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

      // Also store token directly for backward compatibility
      console.log("AuthContext: Setting auth token:", token);
      setAuthToken(token);

      // Set axios auth header
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      // Set user state
      console.log("AuthContext: Setting user:", user);
      setUser(user);
      setTokenExpiry(tokenExpiry);

      console.log("AuthContext: Login successful, returning success");
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
