import axios from "axios";
import { getAuthToken } from "../utils/tokenUtils";

// In development, use Vite proxy. In production, use environment variable or fallback
const API_URL =
  import.meta.env.VITE_REACT_APP_API_URL ||
  (import.meta.env.DEV ? "/api" : "http://localhost:5003/api");

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.metadata = {
      startTime: new Date().getTime(),
    };

    // Removed code that stripped '/api' from the request URL to ensure Vite proxy works correctly.

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    const requestStartTime = response.config.metadata?.startTime;
    if (requestStartTime) {
      const endTime = new Date().getTime();
      const responseTime = endTime - requestStartTime;

      if (responseTime > 5000) {
        console.error(
          `Very slow API response: ${responseTime}ms for ${response.config.url}`
        );
      } else if (responseTime > 3000) {
        console.warn(
          `Slow API response detected: ${responseTime}ms for ${response.config.url}`
        );
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login?session=expired";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
