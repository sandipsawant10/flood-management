import axiosInstance from './axiosConfig';

const emergencyService = {
  getEmergencyData: async () => {
    try {
      const response = await axiosInstance.get('/emergency/data');
      return response.data;
    } catch (error) {
      console.error('Error fetching emergency data:', error);
      throw error;
    }
  },

  getActiveIncidents: async () => {
    try {
      const response = await axiosInstance.get('/emergency/incidents');
      return response.data;
    } catch (error) {
      console.error('Error fetching active incidents:', error);
      throw error;
    }
  },

  getEmergencyContacts: async () => {
    try {
      const response = await axiosInstance.get('/emergency/contacts');
      return response.data;
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      throw error;
    }
  },
};

export default emergencyService;
