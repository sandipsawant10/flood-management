import axiosInstance from "./axiosConfig";

// Simple adapter for older service modules expecting `api` default export
const api = axiosInstance;

export default api;
