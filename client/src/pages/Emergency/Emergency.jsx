import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Wifi, WifiOff, AlertTriangle } from "lucide-react";

import EmergencyContacts from "./EmergencyContacts.jsx";
import NearbyResources from "./NearbyResources.jsx";
import QuickActions from "./QuickActions.jsx";
import { emergencyService } from "../../services/emergencyService.js";
import { useAuthStore } from "../../store/authStore.js";

const Emergency = () => {
  const { user } = useAuthStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // React Query v5 object syntax
  const {
    data: emergencyData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["emergency-data", user?.location?.coordinates],
    queryFn: () =>
      emergencyService.getEmergencyData({
        latitude: user?.location?.coordinates?.[1],
        longitude: user?.location?.coordinates?.[0],
        radius: 10,
      }),
    enabled: !!user?.location?.coordinates,
    refetchInterval: isOnline ? 30000 : false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
        <h3 className="text-red-800 font-medium">
          Failed to load emergency data
        </h3>
        <p className="text-red-600 mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Emergency Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg shadow-lg p-6 text-white flex items-center justify-between">
        <div className="flex items-center mb-2">
          <AlertTriangle className="w-8 h-8 mr-3" />
          <h1 className="text-3xl font-bold">Emergency Center</h1>
        </div>
        <div className="text-right flex items-center">
          {isOnline ? (
            <Wifi className="w-5 h-5 mr-2 text-green-300" />
          ) : (
            <WifiOff className="w-5 h-5 mr-2 text-red-300" />
          )}
          <span className="text-sm">
            {isOnline ? "Connected" : "Offline Mode"}
          </span>
        </div>
      </div>

      {/* Offline Warning */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700 text-sm">
            Offline mode active. Some features may be limited. Emergency calls
            still work.
          </p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        <div>
          <EmergencyContacts />
        </div>
      </div>

      {/* Nearby Resources */}
      <div>
        <NearbyResources resources={emergencyData?.resources} />
      </div>
    </div>
  );
};

export default Emergency;
