import api from "./apiClient";

/**
 * Service for interacting with emergency services API
 */
const emergencyServiceClient = {
  /**
   * Get emergency service contacts
   * @returns {Promise<Array>} Emergency service contacts
   */
  getEmergencyContacts: async () => {
    try {
      const response = await api.get("/emergency-services/contacts");
      return response.data;
    } catch (error) {
      console.error("Error fetching emergency contacts:", error);
      throw error;
    }
  },

  /**
   * Report an emergency to emergency services
   * @param {Object} emergencyData - Emergency details
   * @param {Array} servicesToNotify - Services to notify ['police', 'ambulance', 'fire', 'ndrf']
   * @returns {Promise<Object>} Report result
   */
  reportEmergency: async (emergencyData, servicesToNotify = ["ndrf"]) => {
    try {
      const response = await api.post("/emergency-services/report", {
        ...emergencyData,
        servicesToNotify,
      });
      return response.data;
    } catch (error) {
      console.error("Error reporting emergency:", error);
      throw error;
    }
  },

  /**
   * Get emergency status updates from external services
   * @param {string} emergencyId - Emergency ID
   * @returns {Promise<Object>} Status updates
   */
  getEmergencyStatusUpdates: async (emergencyId) => {
    try {
      const response = await api.get(
        `/emergency-services/status/${emergencyId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching emergency status updates:", error);
      throw error;
    }
  },

  /**
   * Sync emergency status with external services
   * @param {string} emergencyId - Emergency ID
   * @returns {Promise<Object>} Updated emergency status
   */
  syncEmergencyStatus: async (emergencyId) => {
    try {
      const response = await api.put(`/emergency-services/sync/${emergencyId}`);
      return response.data;
    } catch (error) {
      console.error("Error syncing emergency status:", error);
      throw error;
    }
  },

  /**
   * Get nearby emergency resources
   * @param {number} longitude - Location longitude
   * @param {number} latitude - Location latitude
   * @param {number} radius - Search radius in meters (default: 5000)
   * @param {Array} types - Resource types to include ['hospital', 'shelter', 'police', 'fire_station']
   * @returns {Promise<Object>} Nearby emergency resources
   */
  getNearbyEmergencyResources: async (
    longitude,
    latitude,
    radius = 5000,
    types = ["hospital", "shelter"]
  ) => {
    try {
      const response = await api.get("/emergency-services/resources", {
        params: { longitude, latitude, radius, types: types.join(",") },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching nearby emergency resources:", error);
      throw error;
    }
  },
};

export default emergencyServiceClient;
