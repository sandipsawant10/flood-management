import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, AlertTriangle, RefreshCw } from "lucide-react";
import useOffline from "../hooks/useOffline";

const OfflineStatus = () => {
  const { online, syncStatus, syncData, offlineCapabilities } = useOffline();

  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showSyncBanner, setShowSyncBanner] = useState(false);

  useEffect(() => {
    if (!online) {
      setShowOfflineBanner(true);
      setShowSyncBanner(false);
    } else {
      // When we come back online, show sync banner briefly
      if (showOfflineBanner) {
        setShowSyncBanner(true);
        setShowOfflineBanner(false);

        // Hide sync banner after 3 seconds
        const timer = setTimeout(() => {
          setShowSyncBanner(false);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [online, showOfflineBanner]);

  // Handle manual sync
  const handleManualSync = () => {
    syncData().then(() => {
      // Show feedback briefly
      setShowSyncBanner(true);
      setTimeout(() => setShowSyncBanner(false), 3000);
    });
  };

  if (!showOfflineBanner && !showSyncBanner && !syncStatus.syncing) return null;

  // Show appropriate banner based on state

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {showOfflineBanner && (
        <div className="bg-red-600 text-white px-4 py-3 shadow-lg">
          <div className="flex items-center justify-center">
            <WifiOff className="w-5 h-5 mr-3" />
            <div className="text-center">
              <p className="font-medium">You're offline</p>
              <p className="text-sm text-red-100">
                Some features may be limited. Emergency contacts are still
                available.
              </p>
            </div>
          </div>
        </div>
      )}

      {showSyncBanner && (
        <div className="bg-green-600 text-white px-4 py-2 shadow-lg animate-pulse">
          <div className="flex items-center justify-center">
            <Wifi className="w-4 h-4 mr-2" />
            <p className="text-sm">Back online! Syncing data...</p>
          </div>
        </div>
      )}

      {syncStatus.syncing && !showSyncBanner && (
        <div className="bg-blue-600 text-white px-4 py-2 shadow-lg">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            <p className="text-sm">Synchronizing data...</p>
            <button
              onClick={handleManualSync}
              className="ml-2 text-xs bg-blue-700 px-2 py-1 rounded hover:bg-blue-800"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineStatus;
