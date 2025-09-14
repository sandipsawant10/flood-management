import axios from "axios";
import axiosInstance from './axiosConfig';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api";

export const alertService = {
  getAlerts: async (params = {}) => {
    const response = await axiosInstance.get(`/alerts`, { params });
    return response.data;
  },

  getAlertById: async (id) => {
    const response = await axiosInstance.get(`/alerts/${id}`);
    return response.data;
  },

  subscribeToAlerts: async (preferences) => {
    const response = await axiosInstance.post(`/alerts/subscribe`, preferences);
    return response.data;
  },

  unsubscribeFromAlerts: async (alertTypeId) => {
    const response = await axiosInstance.post(`/alerts/unsubscribe`, { alertTypeId });
    return response.data;
  },
};
