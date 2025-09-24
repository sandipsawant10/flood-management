import React, { useState, useEffect } from "react";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { getAllItems, STORES_ENUM } from "../../services/indexedDBService";
import useOffline from "../../hooks/useOffline";

/**
 * Displays the current status of offline actions queue
 * Shows pending offline requests and provides sync controls
 */
const OfflineQueue = () => {
  const { online, syncData, syncStatus } = useOffline();
  const [queuedItems, setQueuedItems] = useState({
    offlineRequests: 0,
    floodReports: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [detailedItems, setDetailedItems] = useState({
    offlineRequests: [],
    floodReports: [],
  });

  // Load pending items count
  const loadQueuedItems = async () => {
    try {
      setLoading(true);

      // Get pending offline requests
      const pendingRequests = await getAllItems(STORES_ENUM.OFFLINE_REQUESTS, {
        indexName: "status",
        value: "pending",
      });

      // Get unsynchronized flood reports
      const unsyncedReports = await getAllItems(STORES_ENUM.FLOOD_REPORTS, {
        indexName: "synced",
        value: false,
      });

      // Update counts
      setQueuedItems({
        offlineRequests: pendingRequests.length,
        floodReports: unsyncedReports.length,
        total: pendingRequests.length + unsyncedReports.length,
      });

      // Store detailed items for expanded view
      setDetailedItems({
        offlineRequests: pendingRequests,
        floodReports: unsyncedReports,
      });
    } catch (error) {
      console.error("Error loading queued items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadQueuedItems();

    // Reload when sync status changes
    if (!syncStatus.syncing && syncStatus.lastSyncTime) {
      loadQueuedItems();
    }

    // Set up event listener for sync complete
    const handleSyncComplete = () => {
      loadQueuedItems();
    };

    window.addEventListener("sync-complete", handleSyncComplete);

    return () => {
      window.removeEventListener("sync-complete", handleSyncComplete);
    };
  }, [syncStatus.syncing, syncStatus.lastSyncTime]);

  // Handle manual sync
  const handleSync = async () => {
    try {
      const result = await syncData();
      loadQueuedItems();
      return result;
    } catch (error) {
      console.error("Error during manual sync:", error);
      return { success: false, error };
    }
  };

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return "N/A";

    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Offline Queue</h2>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500 mr-2" />
            <span>Loading queue information...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {online ? (
                  <Cloud className="w-5 h-5 text-green-500 mr-2" />
                ) : (
                  <CloudOff className="w-5 h-5 text-amber-500 mr-2" />
                )}
                <span className="font-medium">
                  {online ? "Online" : "Offline"} Mode
                </span>
              </div>

              <div className="text-sm text-gray-500">
                Last Sync: {formatTime(syncStatus.lastSyncTime) || "Never"}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xl font-bold">{queuedItems.total}</div>
                  <div className="text-sm text-gray-500">Pending Actions</div>
                </div>

                <button
                  onClick={handleSync}
                  disabled={
                    !online || syncStatus.syncing || queuedItems.total === 0
                  }
                  className={`px-4 py-2 rounded-md flex items-center ${
                    !online || queuedItems.total === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : syncStatus.syncing
                      ? "bg-blue-100 text-blue-500"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-1 ${
                      syncStatus.syncing ? "animate-spin" : ""
                    }`}
                  />
                  {syncStatus.syncing ? "Syncing..." : "Sync Now"}
                </button>
              </div>

              {queuedItems.total > 0 && (
                <div className="mt-3 space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>API Requests</span>
                    <span>{queuedItems.offlineRequests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Flood Reports</span>
                    <span>{queuedItems.floodReports}</span>
                  </div>
                </div>
              )}
            </div>

            {queuedItems.total > 0 && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-600 text-sm hover:underline flex items-center"
              >
                {showDetails ? "Hide" : "Show"} Details
                <span className="ml-1">{showDetails ? "▲" : "▼"}</span>
              </button>
            )}

            {showDetails && queuedItems.total > 0 && (
              <div className="mt-3 border-t pt-3">
                <h3 className="font-medium text-sm mb-2">Pending Items</h3>

                {detailedItems.floodReports.length > 0 && (
                  <>
                    <h4 className="text-xs font-semibold text-gray-500 mb-1">
                      Flood Reports
                    </h4>
                    <ul className="space-y-2 mb-4">
                      {detailedItems.floodReports.map((report) => (
                        <li
                          key={report.id}
                          className="text-sm bg-blue-50 p-2 rounded"
                        >
                          <div className="flex justify-between">
                            <span>
                              {report.location?.address?.substring(0, 20) ||
                                "Unknown location"}
                              {report.location?.address?.length > 20
                                ? "..."
                                : ""}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {new Date(report.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Severity: {report.severity || "Unknown"}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {detailedItems.offlineRequests.length > 0 && (
                  <>
                    <h4 className="text-xs font-semibold text-gray-500 mb-1">
                      API Requests
                    </h4>
                    <ul className="space-y-2">
                      {detailedItems.offlineRequests.map((request) => (
                        <li
                          key={request.id}
                          className="text-sm bg-gray-50 p-2 rounded"
                        >
                          <div className="flex justify-between">
                            <span>
                              {request.method.toUpperCase()}{" "}
                              {request.url.substring(0, 25)}
                              {request.url.length > 25 ? "..." : ""}
                            </span>
                            <span className="text-gray-500 text-xs">
                              {new Date(request.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {queuedItems.total === 0 && (
              <div className="text-center py-3 text-gray-500">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p>All data is synchronized</p>
              </div>
            )}

            {syncStatus.error && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
                <div>
                  <p className="font-semibold">Sync Error</p>
                  <p className="text-sm">{syncStatus.error}</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineQueue;
