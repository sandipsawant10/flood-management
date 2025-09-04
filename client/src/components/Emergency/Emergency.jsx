import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Phone,
  MapPin,
  Clock,
  AlertTriangle,
  Users,
  Hospital,
  Shield,
  Zap,
  Car,
  Home,
  Wifi,
  WifiOff,
} from "lucide-react";

import EmergencyContacts from "./EmergencyContacts.jsx";
import NearbyResources from "./NearbyResources.jsx";
import QuickActions from "./QuickActions.jsx";
import { emergencyService } from "../../services/emergencyService.js";
import { useAuthStore } from "../../store/authStore.jsx";

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

  // Fetch emergency data
  const { data: emergencyData, isLoading } = useQuery(
    ["emergency-data"],
    () =>
      emergencyService.getEmergencyData({
        latitude: user?.location?.coordinates?.[1],
        longitude: user?.location?.coordinates?.[0],
        radius: 10,
      }),
    {
      enabled: !!user?.location?.coordinates,
      refetchInterval: isOnline ? 30000 : false,
    }
  );

  return (
    <div className="space-y-6">
      {/* Emergency Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-8 h-8 mr-3" />
              <h1 className="text-3xl font-bold">Emergency Center</h1>
            </div>
            <p className="text-red-100 text-lg">
              Get immediate help during flood emergencies
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-center mb-2">
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
        </div>
      </div>

      {/* Connection Status Alert */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <WifiOff className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <h3 className="font-medium text-yellow-800">
                Offline Mode Active
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Some features may be limited. Emergency calls will still work.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Takes 2/3 width */}
        <div className="lg:col-span-2">
          <QuickActions />
        </div>

        {/* Emergency Contacts - Takes 1/3 width */}
        <div>
          <EmergencyContacts />
        </div>
      </div>

      {/* Nearby Resources - Full width */}
      <div>
        <NearbyResources resources={emergencyData?.resources} />
      </div>
    </div>
  );
};

export default Emergency;
