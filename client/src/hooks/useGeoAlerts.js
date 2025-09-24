import { useState, useEffect, useCallback, useRef } from "react";
import { alertService } from "../services/alertService";
import { useLocation } from "./useLocation";

/**
 * Custom hook for geolocation-based alerts
 * Provides functionality to monitor for alerts based on user's location
 * Enhanced with proximity warnings, flood risk assessment, and evacuation routing
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoStart - Whether to start monitoring automatically
 * @param {number} options.monitoringInterval - Interval in milliseconds for checking alerts
 * @param {boolean} options.showNotifications - Whether to show browser notifications
 * @param {boolean} options.includeRiskAssessment - Whether to include flood risk assessment
 * @param {boolean} options.trackApproachingZones - Whether to track alerts the user is approaching
 * @returns {Object} Alert monitoring state and control functions including:
 *   - isMonitoring: Whether alert monitoring is active
 *   - alertZones: Array of alert zones the user is currently in
 *   - nearbyAlerts: Array of alerts near the user's location
 *   - approachingAlerts: Array of alerts the user is approaching but not yet in
 *   - floodRisk: Current flood risk assessment for user's location
 *   - evacuationRoutes: Available evacuation routes if in high risk area
 *   - location: User's current location
 *   - loading: Whether data is being loaded
 *   - error: Any error that occurred
 *   - startMonitoring: Function to start alert monitoring
 *   - stopMonitoring: Function to stop alert monitoring
 *   - checkNow: Function to manually check alert zones
 *   - loadNearbyAlerts: Function to load alerts near user's location
 *   - findEvacuationRoutes: Function to find evacuation routes from current location
 *   - getFloodRisk: Function to get current flood risk assessment
 */
export const useGeoAlerts = (options = {}) => {
  const {
    autoStart = true,
    monitoringInterval = 5 * 60 * 1000, // 5 minutes by default
    showNotifications = true,
  } = options;

  // Get user location from useLocation hook
  const {
    location,
    error: locationError,
    isWatching,
    startWatching,
    stopWatching,
  } = useLocation();

  // State for geolocation alerts
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alertZones, setAlertZones] = useState([]);
  const [nearbyAlerts, setNearbyAlerts] = useState([]);
  const [approachingAlerts, setApproachingAlerts] = useState([]);
  const [floodRisk, setFloodRisk] = useState(null);
  const [evacuationRoutes, setEvacuationRoutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [monitoringController, setMonitoringController] = useState(null);

  /**
   * Show browser notification for alert
   */
  const showAlertNotification = useCallback(
    (alert) => {
      if (!("Notification" in window)) return;

      if (Notification.permission === "granted" && showNotifications) {
        const notification = new Notification(`Flood Alert: ${alert.title}`, {
          body: alert.description,
          icon: "/notification-icon.png",
          tag: `flood-alert-${alert.id}`,
        });

        notification.onclick = () => {
          window.focus();
          window.location.href = `/alerts/${alert.id}`;
        };
      }
    },
    [showNotifications]
  );

  /**
   * Handle entering an alert zone
   */
  const handleEnterAlertZone = useCallback(
    async (alerts, location) => {
      console.log("Entered alert zone(s):", alerts);
      setAlertZones((prev) => [...prev, ...alerts]);

      // Show notifications for each new alert
      alerts.forEach((alert) => {
        showAlertNotification(alert);
      });

      // Get flood risk assessment for current location
      try {
        const riskAssessment = await alertService.getFloodRiskAssessment({
          location,
        });
        setFloodRisk(riskAssessment);

        // If risk is high, also fetch evacuation routes
        if (riskAssessment.riskLevel === "high") {
          const routesResult = await alertService.getEvacuationRoutes({
            location,
          });
          setEvacuationRoutes(routesResult);
        }
      } catch (err) {
        console.error("Error getting risk assessment:", err);
      }

      // Dispatch custom event that components can listen for
      window.dispatchEvent(
        new CustomEvent("geo-alert-enter", {
          detail: { alerts, location },
        })
      );
    },
    [showAlertNotification]
  );

  /**
   * Handle leaving an alert zone
   */
  const handleLeaveAlertZone = useCallback((alertIds, location) => {
    console.log("Left alert zone(s):", alertIds);

    // Remove alerts from state
    setAlertZones((prev) =>
      prev.filter((alert) => !alertIds.includes(alert.id))
    );

    // Dispatch custom event that components can listen for
    window.dispatchEvent(
      new CustomEvent("geo-alert-leave", {
        detail: { alertIds, location },
      })
    );
  }, []);

  /**
   * Handle monitoring errors
   */
  const handleMonitoringError = useCallback((error) => {
    console.error("Error in geo-alert monitoring:", error);
    setError(error);
  }, []);

  // Forward declaration for loadNearbyAlerts to avoid circular reference
  const loadNearbyAlertsImpl = async (options = {}) => {
    try {
      setLoading(true);

      const result = await alertService.getNearbyAlerts({
        location,
        includeLocationParams: true,
        ...options,
      });

      // Handle different result formats based on where data comes from
      if (result.nearbyMatches) {
        // Local filtering result format
        setNearbyAlerts(result.alerts);
        if (result.approachingAlerts) {
          setApproachingAlerts(result.approachingAlerts);
        }
      } else {
        // Standard API result format
        setNearbyAlerts(result.alerts);
      }

      // Update flood risk if available
      if (options.includeRiskAssessment) {
        try {
          const riskAssessment = await alertService.getFloodRiskAssessment({
            location,
          });
          setFloodRisk(riskAssessment);
        } catch (riskErr) {
          console.error("Error getting risk assessment:", riskErr);
        }
      }

      return result;
    } catch (err) {
      console.error("Error loading nearby alerts:", err);
      setError(err);
      return { alerts: [], error: err };
    } finally {
      setLoading(false);
    }
  };

  // Store implementation in ref to avoid dependency cycles
  loadNearbyAlertsRef.current = loadNearbyAlertsImpl;

  /**
   * Start alert monitoring
   */
  const startMonitoring = useCallback(async () => {
    if (isMonitoring) return;

    try {
      setLoading(true);
      setError(null);

      // Start watching location if not already
      if (!isWatching) {
        startWatching();
      }

      // Initialize alert zone monitoring
      const controller = await alertService.startAlertZoneMonitoring({
        onEnterAlertZone: handleEnterAlertZone,
        onLeaveAlertZone: handleLeaveAlertZone,
        onError: handleMonitoringError,
        monitoringInterval,
      });

      setMonitoringController(controller);
      setIsMonitoring(true);

      console.log("Started geo-alert monitoring");

      // Load nearby alerts initially
      if (loadNearbyAlertsRef.current) {
        loadNearbyAlertsRef.current();
      }

      return controller;
    } catch (err) {
      console.error("Failed to start geo-alert monitoring:", err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [
    isMonitoring,
    isWatching,
    startWatching,
    monitoringInterval,
    handleEnterAlertZone,
    handleLeaveAlertZone,
    handleMonitoringError,
  ]);

  /**
   * Stop alert monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring || !monitoringController) return false;

    try {
      // Stop the monitoring controller
      monitoringController.stop();
      setMonitoringController(null);
      setIsMonitoring(false);

      // Stop watching location if we started it
      if (isWatching) {
        stopWatching();
      }

      console.log("Stopped geo-alert monitoring");
      return true;
    } catch (err) {
      console.error("Error stopping geo-alert monitoring:", err);
      setError(err);
      return false;
    }
  }, [isMonitoring, monitoringController, isWatching, stopWatching]);

  /**
   * Check alert zones manually
   */
  const checkNow = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let result;

      if (monitoringController) {
        // Use the controller's check function if monitoring is active
        result = await monitoringController.checkNow();
      } else {
        // Otherwise check directly
        result = await alertService.checkUserInAlertZone();
      }

      if (result.inAlertZone) {
        setAlertZones(result.affectedAlerts);
      }

      return result;
    } catch (err) {
      console.error("Error checking alert zones:", err);
      setError(err);
      return { inAlertZone: false, affectedAlerts: [], error: err };
    } finally {
      setLoading(false);
    }
  }, [monitoringController]);

  /**
   * Load nearby alerts
   */
  const loadNearbyAlerts = useCallback(
    async (options = {}) => {
      // Use the implementation stored in the ref to avoid circular references
      if (loadNearbyAlertsRef.current) {
        return loadNearbyAlertsRef.current(options);
      }
      return { alerts: [], error: new Error("Alert loader not initialized") };
    },
    [loadNearbyAlertsRef]
  );

  // Fix for React hooks rules - loadNearbyAlerts reference needed before definition
  const loadNearbyAlertsRef = useRef(null);

  // Auto-start monitoring if configured
  useEffect(() => {
    if (autoStart && !isMonitoring && !loading) {
      startMonitoring();
    }

    // Clean up when component unmounts
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [autoStart, isMonitoring, loading, startMonitoring, stopMonitoring]);

  /**
   * Find evacuation routes from current location
   */
  const findEvacuationRoutes = useCallback(
    async (options = {}) => {
      try {
        setLoading(true);

        const routesResult = await alertService.getEvacuationRoutes({
          location,
          ...options,
        });

        setEvacuationRoutes(routesResult);
        return routesResult;
      } catch (err) {
        console.error("Error finding evacuation routes:", err);
        setError(err);
        return { routes: [], error: err };
      } finally {
        setLoading(false);
      }
    },
    [location]
  );

  /**
   * Get current flood risk assessment
   */
  const getFloodRisk = useCallback(async () => {
    try {
      setLoading(true);

      const riskAssessment = await alertService.getFloodRiskAssessment({
        location,
      });

      setFloodRisk(riskAssessment);
      return riskAssessment;
    } catch (err) {
      console.error("Error getting flood risk assessment:", err);
      setError(err);
      return { riskLevel: "unknown", error: err };
    } finally {
      setLoading(false);
    }
  }, [location]);

  return {
    // State
    isMonitoring,
    alertZones,
    nearbyAlerts,
    approachingAlerts,
    floodRisk,
    evacuationRoutes,
    location,
    loading,
    error: error || locationError,

    // Actions
    startMonitoring,
    stopMonitoring,
    checkNow,
    loadNearbyAlerts,
    findEvacuationRoutes,
    getFloodRisk,
  };
};

export default useGeoAlerts;
