import axiosInstance from "./axiosConfig";
import {
  checkLocationWithinAlertAreas,
  getCurrentLocation,
  calculateFloodRisk,
  findSafeEvacuationRoutes,
} from "./geolocationService";
import { getLocalAlerts, storeAlerts } from "./offlineService";

const API_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api";

// Toast notification functions
const showToast = (message, type = "info", duration = 3000) => {
  const toast = {
    id: Date.now(),
    message,
    type,
    duration,
  };

  // Dispatch event for toast component to catch
  document.dispatchEvent(new CustomEvent("show-toast", { detail: toast }));
  return toast;
};

export const alertService = {
  // Toast notification methods
  showSuccess: (message, duration) => showToast(message, "success", duration),
  showError: (message, duration) => showToast(message, "error", duration),
  showInfo: (message, duration) => showToast(message, "info", duration),
  showWarning: (message, duration) => showToast(message, "warning", duration),

  /**
   * Get alerts with optional filtering
   * @param {Object} params - Query parameters
   * @returns {Promise} Promise resolving to alerts data
   */
  getAlerts: async (params = {}) => {
    try {
      const response = await axiosInstance.get(`/alerts`, { params });

      // Store alerts for offline access
      if (response.data.alerts && response.data.alerts.length > 0) {
        await storeAlerts(response.data.alerts);
      }

      return response.data;
    } catch (error) {
      // If offline, try to get alerts from local storage
      if (!navigator.onLine) {
        const localAlerts = await getLocalAlerts(params);
        return {
          success: true,
          count: localAlerts.length,
          alerts: localAlerts,
          offline: true,
        };
      }

      throw error;
    }
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
    const response = await axiosInstance.post(`/alerts/unsubscribe`, {
      alertTypeId,
    });
    return response.data;
  },

  /**
   * Get alerts based on user's current location
   * @param {Object} options - Options for location and alerts
   * @returns {Promise} Promise resolving to nearby alerts
   */
  getNearbyAlerts: async (options = {}) => {
    try {
      // Get user's current location
      const location = options.location || (await getCurrentLocation());

      // Fetch alerts
      const params = {
        status: "active",
        ...options.params,
      };

      // Add location parameters if needed
      if (location && options.includeLocationParams) {
        params.lat = location.latitude;
        params.lng = location.longitude;
        params.radius = options.radius || 50; // Default 50km radius
      }

      const response = await axiosInstance.get(`/alerts/nearby`, { params });

      // Store alerts for offline access
      if (response.data.alerts && response.data.alerts.length > 0) {
        await storeAlerts(response.data.alerts);
      }

      return {
        ...response.data,
        location,
      };
    } catch (error) {
      // If API call fails, try to filter locally
      if (!options.skipLocalFiltering) {
        try {
          const location = options.location || (await getCurrentLocation());
          const allAlerts = await alertService.getAlerts({ status: "active" });

          // Filter alerts based on location with enhanced checking
          const { matchingAlerts, nearbyAlerts } =
            checkLocationWithinAlertAreas(location, allAlerts.alerts);

          // Combine direct matches and nearby alerts for better user awareness
          const combinedAlerts = [
            ...matchingAlerts,
            ...nearbyAlerts.filter(
              (nearby) =>
                !matchingAlerts.some((match) => match.id === nearby.id)
            ),
          ];

          return {
            success: true,
            count: combinedAlerts.length,
            alerts: combinedAlerts,
            directMatches: matchingAlerts.length,
            nearbyMatches: nearbyAlerts.length,
            location,
            locallyFiltered: true,
          };
        } catch (localError) {
          console.error("Error filtering alerts locally:", localError);
        }
      }

      throw error;
    }
  },

  /**
   * Check if user is in an alert zone
   * @returns {Promise} Promise resolving to affected alerts
   */
  checkUserInAlertZone: async () => {
    try {
      // Get user's current location
      const location = await getCurrentLocation();

      // Fetch active alerts
      const { alerts } = await alertService.getAlerts({ status: "active" });

      // Check if location is within any alert areas with enhanced checking
      const { matchingAlerts, nearbyAlerts, distanceToAlerts } =
        checkLocationWithinAlertAreas(location, alerts);

      // Calculate flood risk for the current location
      const floodRisk = await calculateFloodRisk(location);

      return {
        inAlertZone: matchingAlerts.length > 0,
        affectedAlerts: matchingAlerts,
        nearbyAlerts,
        distanceToAlerts,
        location,
        floodRisk,
      };
    } catch (error) {
      console.error("Error checking if user is in alert zone:", error);
      throw error;
    }
  },

  /**
   * Start monitoring for geolocation-based alerts
   * @param {Object} options - Monitoring options
   * @param {Function} options.onEnterAlertZone - Callback when entering alert zone
   * @param {Function} options.onLeaveAlertZone - Callback when leaving alert zone
   * @param {Function} options.onError - Callback for errors
   * @returns {Object} Monitoring controller
   */
  startAlertZoneMonitoring: async (options = {}) => {
    const {
      onEnterAlertZone,
      onLeaveAlertZone,
      onError,
      monitoringInterval = 5 * 60 * 1000, // 5 minutes by default
    } = options;

    let intervalId = null;
    let currentAlertZones = new Set();

    // Check alert zones and notify of changes
    const checkAlertZones = async () => {
      try {
        const { inAlertZone, affectedAlerts, location } =
          await alertService.checkUserInAlertZone();

        // Create set of current alert IDs
        const newAlertZones = new Set(affectedAlerts.map((alert) => alert.id));

        // Find alerts user just entered
        const enteredAlerts = affectedAlerts.filter(
          (alert) => !currentAlertZones.has(alert.id)
        );

        // Find alerts user just left
        const leftAlertIds = Array.from(currentAlertZones).filter(
          (id) => !newAlertZones.has(id)
        );

        // Update current alert zones
        currentAlertZones = newAlertZones;

        // Call callbacks for zone changes
        if (enteredAlerts.length > 0 && onEnterAlertZone) {
          onEnterAlertZone(enteredAlerts, location);
        }

        if (leftAlertIds.length > 0 && onLeaveAlertZone) {
          onLeaveAlertZone(leftAlertIds, location);
        }

        return { inAlertZone, affectedAlerts, location };
      } catch (error) {
        console.error("Error monitoring alert zones:", error);
        if (onError) onError(error);
        return { inAlertZone: false, affectedAlerts: [], error };
      }
    };

    // Start monitoring
    const startMonitoring = async () => {
      // Initial check
      await checkAlertZones();

      // Set up periodic checking
      intervalId = setInterval(checkAlertZones, monitoringInterval);

      return {
        isActive: true,
        intervalId,
      };
    };

    // Stop monitoring
    const stopMonitoring = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        return true;
      }
      return false;
    };

    // Start immediately and return controller
    const monitoringStatus = await startMonitoring();

    return {
      ...monitoringStatus,
      stop: stopMonitoring,
      checkNow: checkAlertZones,
    };
  },

  /**
   * Get evacuation routes based on current location and active alerts
   * @param {Object} options - Options for route finding
   * @returns {Promise} Promise resolving to evacuation routes
   */
  getEvacuationRoutes: async (options = {}) => {
    try {
      // Get user's current location
      const location = options.location || (await getCurrentLocation());

      // Get active alert zones
      const { inAlertZone, affectedAlerts } =
        await alertService.checkUserInAlertZone();

      // Calculate routes
      const routesResult = await findSafeEvacuationRoutes(
        location,
        affectedAlerts,
        {
          includeHighGroundRoutes: options.includeHighGroundRoutes || true,
          includeShelterRoutes: options.includeShelterRoutes || true,
        }
      );

      return {
        ...routesResult,
        inAlertZone,
        alertCount: affectedAlerts.length,
      };
    } catch (error) {
      console.error("Error getting evacuation routes:", error);
      throw error;
    }
  },

  /**
   * Get real-time flood risk assessment for a location
   * @param {Object} options - Options for risk assessment
   * @returns {Promise} Promise resolving to flood risk data
   */
  getFloodRiskAssessment: async (options = {}) => {
    try {
      // Get user's current location
      const location = options.location || (await getCurrentLocation());

      // Calculate flood risk
      const riskAssessment = await calculateFloodRisk(location);

      return {
        ...riskAssessment,
        location,
      };
    } catch (error) {
      console.error("Error getting flood risk assessment:", error);
      throw error;
    }
  },
};
