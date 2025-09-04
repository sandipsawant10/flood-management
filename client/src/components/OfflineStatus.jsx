import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, AlertTriangle } from "lucide-react";

const OfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineBanner(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineBanner(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showOfflineBanner && isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {!isOnline ? (
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
      ) : (
        <div className="bg-green-600 text-white px-4 py-2 shadow-lg animate-pulse">
          <div className="flex items-center justify-center">
            <Wifi className="w-4 h-4 mr-2" />
            <p className="text-sm">Back online! Syncing data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineStatus;
