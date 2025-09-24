/**
 * useOffline Hook
 * Custom React hook for handling offline functionality
 */

import { useState, useEffect, useCallback } from "react";
import {
  syncOfflineRequests,
  syncFloodReports,
  getLocalAlerts,
  markAlertAsRead,
  storeFloodReport,
} from "../services/offlineService";
import {
  isOnline,
  isServiceWorkerRegistered,
} from "../services/serviceWorkerRegistration";

/**
 * Hook for offline functionality
 */
export const useOffline = () => {
  const [online, setOnline] = useState(isOnline());
  const [offlineReady, setOfflineReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState({
    syncing: false,
    lastSyncTime: null,
    error: null,
  });
  const [offlineCapabilities, setOfflineCapabilities] = useState({
    serviceWorkerSupported: "serviceWorker" in navigator,
    serviceWorkerRegistered: false,
    pushNotificationsSupported: "PushManager" in window,
    indexedDBSupported: "indexedDB" in window,
    backgroundSyncSupported: "SyncManager" in window,
  });

  // Check for service worker registration
  useEffect(() => {
    const checkServiceWorker = async () => {
      const registered = await isServiceWorkerRegistered();

      setOfflineCapabilities((prev) => ({
        ...prev,
        serviceWorkerRegistered: registered,
      }));

      setOfflineReady(registered && "indexedDB" in window);
    };

    checkServiceWorker();
  }, []);

  // Set up online/offline listeners
  useEffect(() => {
    const handleOnline = () => {
      console.log("Device is now online");
      setOnline(true);
      syncData();
    };

    const handleOffline = () => {
      console.log("Device is now offline");
      setOnline(false);
    };

    const handleSyncComplete = () => {
      setSyncStatus((prev) => ({
        ...prev,
        syncing: false,
        lastSyncTime: new Date(),
      }));
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("sync-complete", handleSyncComplete);

    // Initial check
    setOnline(navigator.onLine);

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("sync-complete", handleSyncComplete);
    };
  }, []);

  /**
   * Manually trigger data synchronization
   */
  const syncData = useCallback(async () => {
    if (!navigator.onLine) {
      console.log("Cannot sync while offline");
      return {
        success: false,
        error: "Device is offline",
      };
    }

    try {
      setSyncStatus((prev) => ({
        ...prev,
        syncing: true,
        error: null,
      }));

      // Sync all offline data types
      const requestsSync = await syncOfflineRequests();
      const reportsSync = await syncFloodReports();

      setSyncStatus((prev) => ({
        ...prev,
        syncing: false,
        lastSyncTime: new Date(),
      }));

      return {
        success: true,
        requestsSync,
        reportsSync,
      };
    } catch (error) {
      console.error("Error during manual sync:", error);

      setSyncStatus((prev) => ({
        ...prev,
        syncing: false,
        error: error.message,
      }));

      return {
        success: false,
        error: error.message,
      };
    }
  }, []);

  /**
   * Get alerts from local storage
   */
  const getOfflineAlerts = useCallback(async (options = {}) => {
    try {
      return await getLocalAlerts(options);
    } catch (error) {
      console.error("Error getting offline alerts:", error);
      throw error;
    }
  }, []);

  /**
   * Mark an alert as read in local storage
   */
  const markOfflineAlertAsRead = useCallback(async (alertId) => {
    try {
      await markAlertAsRead(alertId);
      return true;
    } catch (error) {
      console.error("Error marking alert as read:", error);
      return false;
    }
  }, []);

  /**
   * Submit a flood report (works offline)
   */
  const submitOfflineFloodReport = useCallback(
    async (report) => {
      try {
        const storedReport = await storeFloodReport(report);

        // If online, trigger sync immediately
        if (navigator.onLine) {
          syncData();
        }

        return {
          success: true,
          report: storedReport,
          offline: !navigator.onLine,
        };
      } catch (error) {
        console.error("Error submitting offline report:", error);
        return {
          success: false,
          error: error.message,
        };
      }
    },
    [syncData]
  );

  return {
    online,
    offlineReady,
    syncStatus,
    offlineCapabilities,
    syncData,
    getOfflineAlerts,
    markOfflineAlertAsRead,
    submitOfflineFloodReport,
  };
};

export default useOffline;
