/**
 * Offline Service
 * Handles offline request queueing and synchronization
 */

import { v4 as uuidv4 } from "uuid";
import {
  initDatabase,
  openDatabase,
  addItem,
  updateItem,
  getAllItems,
  deleteItem,
  STORES_ENUM,
} from "./indexedDBService";
import axiosInstance from "./axiosConfig";

/**
 * Initialize the offline service
 */
export const initOfflineService = () => {
  // Initialize the IndexedDB database
  initDatabase()
    .then(() => {
      console.log("Offline service initialized");

      // Set up event listeners for online/offline status
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Listen for custom events from axiosConfig for storing offline requests
      window.addEventListener("storeOfflineRequest", handleStoreOfflineRequest);
    })
    .catch((error) => {
      console.error("Failed to initialize offline service:", error);
    });
};

/**
 * Handle coming back online
 */
const handleOnline = async () => {
  console.log("Device is online. Starting sync process...");
  try {
    // Trigger sync for different data types
    await syncOfflineRequests();
    await syncFloodReports();

    // Dispatch event for UI components to update
    window.dispatchEvent(new CustomEvent("sync-complete"));
  } catch (error) {
    console.error("Error during sync process:", error);
  }
};

/**
 * Handle going offline
 */
const handleOffline = () => {
  console.log("Device is offline. Requests will be queued.");
};

/**
 * Handle storing offline requests (triggered by axios interceptor)
 * @param {CustomEvent} event - The custom event with request details
 */
const handleStoreOfflineRequest = async (event) => {
  try {
    const offlineRequest = event.detail;

    // Add status and retry information
    const requestToStore = {
      ...offlineRequest,
      status: "pending",
      retries: 0,
      maxRetries: 3,
    };

    await addItem(STORES_ENUM.OFFLINE_REQUESTS, requestToStore);
    console.log("Stored offline request:", requestToStore.id);
  } catch (error) {
    console.error("Failed to store offline request:", error);
  }
};

/**
 * Synchronize offline requests when back online
 */
export const syncOfflineRequests = async () => {
  if (!navigator.onLine) {
    console.log("Still offline. Cannot sync requests.");
    return;
  }

  try {
    // Get all pending offline requests
    const pendingRequests = await getAllItems(STORES_ENUM.OFFLINE_REQUESTS, {
      indexName: "status",
      value: "pending",
    });

    if (pendingRequests.length === 0) {
      console.log("No offline requests to sync");
      return;
    }

    console.log(`Found ${pendingRequests.length} offline requests to sync`);

    // Process each request
    const results = await Promise.allSettled(
      pendingRequests.map(async (request) => {
        try {
          // Update request status to 'syncing'
          await updateItem(STORES_ENUM.OFFLINE_REQUESTS, {
            ...request,
            status: "syncing",
          });

          // Send the request
          const response = await axiosInstance({
            method: request.method,
            url: request.url,
            data: request.data,
            headers: request.headers,
          });

          // Mark as completed
          await updateItem(STORES_ENUM.OFFLINE_REQUESTS, {
            ...request,
            status: "completed",
            response: {
              data: response.data,
              status: response.status,
              headers: response.headers,
            },
            completedAt: new Date().toISOString(),
          });

          console.log(`Successfully synced request: ${request.id}`);
          return { success: true, id: request.id };
        } catch (error) {
          // Handle failure
          const updatedRequest = {
            ...request,
            retries: (request.retries || 0) + 1,
          };

          // Check if we've reached max retries
          if (updatedRequest.retries >= updatedRequest.maxRetries) {
            updatedRequest.status = "failed";
            updatedRequest.error = {
              message: error.message,
              code: error.code,
              response: error.response && {
                status: error.response.status,
                data: error.response.data,
              },
            };
          }

          await updateItem(STORES_ENUM.OFFLINE_REQUESTS, updatedRequest);

          console.error(
            `Failed to sync request ${request.id} (${updatedRequest.retries}/${updatedRequest.maxRetries} retries)`,
            error
          );
          return {
            success: false,
            id: request.id,
            error: error.message,
            retries: updatedRequest.retries,
            maxRetries: updatedRequest.maxRetries,
          };
        }
      })
    );

    // Return summary of sync results
    const summary = {
      total: results.length,
      succeeded: results.filter(
        (r) => r.status === "fulfilled" && r.value.success
      ).length,
      failed: results.filter(
        (r) =>
          r.status === "rejected" ||
          (r.status === "fulfilled" && !r.value.success)
      ).length,
      results,
    };

    console.log("Sync summary:", summary);
    return summary;
  } catch (error) {
    console.error("Error synchronizing offline requests:", error);
    throw error;
  }
};

/**
 * Store a flood report for offline submission
 * @param {object} report - The flood report data
 */
export const storeFloodReport = async (report) => {
  try {
    // Generate a temporary ID for the report
    const reportWithId = {
      ...report,
      id: report.id || uuidv4(),
      timestamp: new Date().toISOString(),
      synced: false,
    };

    await addItem(STORES_ENUM.FLOOD_REPORTS, reportWithId);
    console.log("Stored flood report for offline sync:", reportWithId.id);

    // Register for background sync if available
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register("flood-report-sync");
    }

    return reportWithId;
  } catch (error) {
    console.error("Failed to store flood report:", error);
    throw error;
  }
};

/**
 * Synchronize flood reports when back online
 */
export const syncFloodReports = async () => {
  if (!navigator.onLine) {
    console.log("Still offline. Cannot sync flood reports.");
    return;
  }

  try {
    // Get all unsynchronized flood reports
    const unsyncedReports = await getAllItems(STORES_ENUM.FLOOD_REPORTS, {
      indexName: "synced",
      value: false,
    });

    if (unsyncedReports.length === 0) {
      console.log("No flood reports to sync");
      return;
    }

    console.log(`Found ${unsyncedReports.length} flood reports to sync`);

    // Process each report
    const results = await Promise.allSettled(
      unsyncedReports.map(async (report) => {
        try {
          // Submit the report to the API
          const response = await axiosInstance.post("/flood-reports", report);

          // Update report with server-generated ID and mark as synced
          await updateItem(STORES_ENUM.FLOOD_REPORTS, {
            ...report,
            id: response.data.id || report.id,
            serverId: response.data.id,
            synced: true,
            syncedAt: new Date().toISOString(),
          });

          console.log(`Successfully synced flood report: ${report.id}`);
          return { success: true, id: report.id };
        } catch (error) {
          console.error(`Failed to sync flood report ${report.id}:`, error);
          return {
            success: false,
            id: report.id,
            error: error.message,
          };
        }
      })
    );

    // Return summary
    const summary = {
      total: results.length,
      succeeded: results.filter(
        (r) => r.status === "fulfilled" && r.value.success
      ).length,
      failed: results.filter(
        (r) =>
          r.status === "rejected" ||
          (r.status === "fulfilled" && !r.value.success)
      ).length,
      results,
    };

    console.log("Flood report sync summary:", summary);
    return summary;
  } catch (error) {
    console.error("Error synchronizing flood reports:", error);
    throw error;
  }
};

/**
 * Store alerts locally for offline access
 * @param {Array} alerts - The alerts to store
 */
export const storeAlerts = async (alerts) => {
  try {
    // Process each alert
    await Promise.all(
      alerts.map(async (alert) => {
        // Use _id if it exists (MongoDB), otherwise use id
        const alertId = alert._id || alert.id;

        if (!alertId) {
          console.warn("Alert missing both _id and id fields:", alert);
          return; // Skip this alert
        }

        // Check if alert already exists
        try {
          const existingAlert = await openDatabase().then((db) => {
            return new Promise((resolve, reject) => {
              const transaction = db.transaction(
                STORES_ENUM.ALERTS,
                "readonly"
              );
              const store = transaction.objectStore(STORES_ENUM.ALERTS);
              const request = store.get(alertId);

              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);

              transaction.oncomplete = () => db.close();
            });
          });

          // Normalize alert data - ensure it has an 'id' field for IndexedDB
          const normalizedAlert = {
            ...alert,
            id: alertId, // Ensure id field exists
            _id: alert._id || alertId, // Preserve _id if it exists
          };

          // If alert exists, update it
          if (existingAlert) {
            await updateItem(STORES_ENUM.ALERTS, {
              ...existingAlert,
              ...normalizedAlert,
              updatedAt: new Date().toISOString(),
            });
          } else {
            // Otherwise, add it
            await addItem(STORES_ENUM.ALERTS, {
              ...normalizedAlert,
              timestamp: new Date().toISOString(),
              read: false,
            });
          }
        } catch (error) {
          console.error(`Error processing alert ${alertId}:`, error);
          throw error;
        }
      })
    );

    console.log(`Stored ${alerts.length} alerts for offline access`);
  } catch (error) {
    console.error("Failed to store alerts:", error);
    throw error;
  }
};

/**
 * Get all locally stored alerts
 * @param {object} options - Query options
 * @param {boolean} options.unreadOnly - Get only unread alerts
 * @param {string} options.severity - Filter by severity
 */
export const getLocalAlerts = async (options = {}) => {
  try {
    let alerts;

    if (options.unreadOnly) {
      alerts = await getAllItems(STORES_ENUM.ALERTS, {
        indexName: "read",
        value: false,
      });
    } else if (options.severity) {
      alerts = await getAllItems(STORES_ENUM.ALERTS, {
        indexName: "severity",
        value: options.severity,
      });
    } else {
      alerts = await getAllItems(STORES_ENUM.ALERTS);
    }

    // Sort by timestamp, most recent first
    return alerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error("Failed to get local alerts:", error);
    throw error;
  }
};

/**
 * Mark alert as read
 * @param {string} alertId - The ID of the alert to mark as read
 */
export const markAlertAsRead = async (alertId) => {
  try {
    const alert = await openDatabase().then((db) => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES_ENUM.ALERTS, "readonly");
        const store = transaction.objectStore(STORES_ENUM.ALERTS);
        const request = store.get(alertId);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);

        transaction.oncomplete = () => db.close();
      });
    });

    if (alert) {
      await updateItem(STORES_ENUM.ALERTS, {
        ...alert,
        read: true,
        readAt: new Date().toISOString(),
      });

      console.log(`Marked alert ${alertId} as read`);
    }
  } catch (error) {
    console.error(`Failed to mark alert ${alertId} as read:`, error);
    throw error;
  }
};

/**
 * Store emergency contacts locally for offline access
 * @param {Array} contacts - The emergency contacts to store
 */
export const storeEmergencyContacts = async (contacts) => {
  try {
    // Store each contact
    await Promise.all(
      contacts.map(async (contact) => {
        await updateItem(STORES_ENUM.EMERGENCY_CONTACTS, {
          ...contact,
          updatedAt: new Date().toISOString(),
        });
      })
    );

    console.log(
      `Stored ${contacts.length} emergency contacts for offline access`
    );
  } catch (error) {
    console.error("Failed to store emergency contacts:", error);
    throw error;
  }
};

/**
 * Get all emergency contacts
 * @param {string} type - Optional filter by contact type
 */
export const getEmergencyContacts = async (type = null) => {
  try {
    let contacts;

    if (type) {
      contacts = await getAllItems(STORES_ENUM.EMERGENCY_CONTACTS, {
        indexName: "type",
        value: type,
      });
    } else {
      contacts = await getAllItems(STORES_ENUM.EMERGENCY_CONTACTS);
    }

    return contacts;
  } catch (error) {
    console.error("Failed to get emergency contacts:", error);
    throw error;
  }
};

// Export named constants
export const STORES = STORES_ENUM;
