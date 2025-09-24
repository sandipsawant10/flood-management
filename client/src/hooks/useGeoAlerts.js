import { useState, useEffect, useCallback } from "react";
import { alertService } from "../services/alertService";
import { useLocation } from "./useLocation";

/**
 * Custom hook for geolocation-based alerts
 * Provides functionality to monitor for alerts based on user's location
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoStart - Whether to start monitoring automatically
 * @param {number} options.monitoringInterval - Interval in milliseconds for checking alerts
 * @param {boolean} options.showNotifications - Whether to show browser notifications
 * @returns {Object} Alert monitoring state and control functions
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
    (alerts, location) => {
      console.log("Entered alert zone(s):", alerts);
      setAlertZones((prev) => [...prev, ...alerts]);

      // Show notifications for each new alert
      alerts.forEach((alert) => {
        showAlertNotification(alert);
      });

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
      loadNearbyAlerts();

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
    loadNearbyAlerts,
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
      try {
        setLoading(true);

        const result = await alertService.getNearbyAlerts({
          location,
          includeLocationParams: true,
          ...options,
        });

        setNearbyAlerts(result.alerts);
        return result;
      } catch (err) {
        console.error("Error loading nearby alerts:", err);
        setError(err);
        return { alerts: [], error: err };
      } finally {
        setLoading(false);
      }
    },
    [location]
  );

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

  return {
    // State
    isMonitoring,
    alertZones,
    nearbyAlerts,
    location,
    loading,
    error: error || locationError,

    // Actions
    startMonitoring,
    stopMonitoring,
    checkNow,
    loadNearbyAlerts,
  };
};

export default useGeoAlerts;
