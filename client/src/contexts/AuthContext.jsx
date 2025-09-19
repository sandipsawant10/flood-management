import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Loading user with token:", token ? "exists" : "none"); // Debug log
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const response = await axios.get("/api/auth/profile"); // Changed from /me to /profile
          console.log("Profile response:", response.data); // Debug log
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        console.error("Profile error response:", error.response?.data); // Debug log
        localStorage.removeItem("token");
        delete axios.defaults.headers.common["Authorization"];
      } finally {
        setLoading(false);
        setAuthInitialized(true);
        console.log("Auth initialization complete"); // Debug log
      }
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    console.log("Attempting login with:", { email }); // Debug log
    try {
      const response = await axios.post("/api/auth/login", {
        login: email, // Backend expects 'login' field, not 'email'
        password,
      });
      console.log("Login response:", response.data); // Debug log
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      console.log("User set:", user); // Debug log
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      console.error("Error response:", error.response?.data); // Debug log
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    authInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthContext };
