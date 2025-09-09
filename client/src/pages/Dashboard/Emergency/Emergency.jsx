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

import emergencyService from "../../../services/emergencyService";
import { useAuthStore } from "../../../store/authStore";

// Reusable components
const ResourceCard = ({ resource, type, handleCall }) => (
  <div className="border border-gray-200 rounded-lg p-3">
    <div className="flex items-start justify-between">
      <div>
        <h4 className="font-medium text-gray-900">{resource.name}</h4>
        <div className="flex items-center mt-1 text-sm text-gray-600">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{resource.distance.toFixed(1)} km away</span>
        </div>
        {type === "shelter" && (
          <div className="flex items-center mt-1 text-sm text-green-600">
            <Users className="w-3 h-3 mr-1 text-green-500" />
            <span>
              {resource.capacity - (resource.currentOccupancy || 0)} spaces
              available
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        {resource.phone && (
          <button
            onClick={() => handleCall(resource.phone)}
            className={`px-3 py-1 text-xs rounded text-white ${
              type === "hospital"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Call
          </button>
        )}
        <button
          onClick={() =>
            window.open(
              `https://maps.google.com/?q=${resource.coordinates[1]},${resource.coordinates[0]}`,
              "_blank"
            )
          }
          className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
        >
          Directions
        </button>
      </div>
    </div>
  </div>
);

const QuickActionButton = ({ action, handleAction }) => (
  <button
    onClick={() => handleAction(action)}
    className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
      action.urgent
        ? "border-red-200 bg-red-50 hover:border-red-300"
        : "border-gray-200 hover:border-gray-300"
    }`}
  >
    <div className="flex items-start">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
          action.color === "red"
            ? "bg-red-100"
            : action.color === "orange"
            ? "bg-orange-100"
            : action.color === "blue"
            ? "bg-blue-100"
            : action.color === "green"
            ? "bg-green-100"
            : action.color === "purple"
            ? "bg-purple-100"
            : "bg-gray-100"
        }`}
      >
        <action.icon
          className={`w-6 h-6 ${
            action.color === "red"
              ? "text-red-600"
              : action.color === "orange"
              ? "text-orange-600"
              : action.color === "blue"
              ? "text-blue-600"
              : action.color === "green"
              ? "text-green-600"
              : action.color === "purple"
              ? "text-purple-600"
              : "text-gray-600"
          }`}
        />
      </div>

      <div>
        <h3
          className={`font-medium ${
            action.urgent ? "text-red-900" : "text-gray-900"
          }`}
        >
          {action.title}
          {action.urgent && (
            <span className="ml-2 text-xs bg-red-200 text-red-800 px-2 py-1 rounded-full">
              URGENT
            </span>
          )}
        </h3>
        <p
          className={`text-sm mt-1 ${
            action.urgent ? "text-red-700" : "text-gray-600"
          }`}
        >
          {action.description}
        </p>
      </div>
    </div>
  </button>
);

const Emergency = () => {
  const { user } = useAuthStore();
  const [userLocation, setUserLocation] = useState(null);
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

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => console.error("Location error:", error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []);

  // Emergency data query
  const {
    data: emergencyData,
    isLoading: isEmergencyLoading,
    error: emergencyError,
  } = useQuery({
    queryKey: ["emergency-data", userLocation],
    queryFn: () =>
      emergencyService.getEmergencyData({
        latitude: userLocation?.latitude || user?.location?.coordinates?.[1],
        longitude: userLocation?.longitude || user?.location?.coordinates?.[0],
        radius: 10,
      }),
    enabled: !!userLocation || !!user?.location?.coordinates,
    refetchInterval: isOnline ? 30000 : false,
  });

  // Active incidents query
  const {
    data: activeIncidents,
    isLoading: isIncidentsLoading,
    error: incidentsError,
  } = useQuery({
    queryKey: ["active-incidents", user?.location],
    queryFn: () =>
      emergencyService.getActiveIncidents({
        district: user?.location?.district,
        state: user?.location?.state,
      }),
    enabled: !!user?.location,
    refetchInterval: isOnline ? 60000 : false,
  });

  const emergencyContacts = [
    { name: "Police Emergency", number: "100", icon: Shield, color: "red" },
    { name: "Fire Services", number: "101", icon: Zap, color: "orange" },
    {
      name: "Medical Emergency",
      number: "108",
      icon: Hospital,
      color: "green",
    },
    {
      name: "Disaster Management",
      number: "1070",
      icon: AlertTriangle,
      color: "yellow",
    },
    { name: "Women Helpline", number: "181", icon: Users, color: "purple" },
  ];

  const quickActions = [
    {
      id: "call-help",
      title: "Call for Help",
      description: "Immediate emergency assistance",
      icon: Phone,
      color: "red",
      urgent: true,
      action: () => window.open("tel:108"),
    },
    {
      id: "report-emergency",
      title: "Report Emergency",
      description: "Report flood emergency in your area",
      icon: AlertTriangle,
      color: "orange",
      urgent: true,
      action: () => (window.location.href = "/report-flood"),
    },
    {
      id: "find-shelter",
      title: "Find Shelter",
      description: "Locate nearby evacuation centers",
      icon: Home,
      color: "blue",
    },
    {
      id: "medical-help",
      title: "Medical Help",
      description: "Find nearby hospitals and clinics",
      icon: Hospital,
      color: "green",
    },
    {
      id: "transportation",
      title: "Transportation",
      description: "Emergency transportation services",
      icon: Car,
      color: "purple",
    },
  ];

  const handleEmergencyCall = (number) => {
    if ("vibrate" in navigator) navigator.vibrate([200, 100, 200]);
    window.open(`tel:${number}`);
  };

  const handleQuickAction = (action) => {
    if (action.action) action.action();
  };

  if (isEmergencyLoading || isIncidentsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (emergencyError || incidentsError) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-center">
        <h3 className="text-red-800 font-medium">
          Failed to load emergency data
        </h3>
        <p className="text-red-600 mt-2">
          {emergencyError?.message || incidentsError?.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg shadow-lg p-6 text-white flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <AlertTriangle className="w-8 h-8 mr-3" /> Emergency Center
          </h1>
          <p className="text-red-100 mt-1">
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
          {userLocation && (
            <div className="flex items-center text-sm text-red-100">
              <MapPin className="w-4 h-4 mr-1" />{" "}
              <span>
                Location accuracy: ±{Math.round(userLocation.accuracy)}m
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Active Incidents */}
      {activeIncidents?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-800 mb-2">
            Active Emergency Incidents
          </h3>
          <div className="space-y-1">
            {activeIncidents.slice(0, 3).map((incident, idx) => (
              <p key={idx} className="text-sm text-red-700">
                • {incident.title} - {incident.location}
              </p>
            ))}
            {activeIncidents.length > 3 && (
              <p className="text-sm text-red-600 font-medium">
                +{activeIncidents.length - 3} more incidents
              </p>
            )}
          </div>
        </div>
      )}

      {/* Emergency Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action) => (
                <QuickActionButton
                  key={action.id}
                  action={action}
                  handleAction={handleQuickAction}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Emergency Contacts
          </h2>
          <div className="space-y-2">
            {emergencyContacts.map((contact, idx) => (
              <button
                key={idx}
                onClick={() => handleEmergencyCall(contact.number)}
                className="w-full p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <contact.icon className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="font-medium">{contact.name}</span>
                </div>
                <span className="font-bold text-red-600">{contact.number}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nearby Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hospitals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
            <Hospital className="w-5 h-5 mr-2 text-red-500" /> Nearby Hospitals
          </h2>
          {emergencyData?.hospitals?.length > 0 ? (
            <div className="space-y-3">
              {emergencyData.hospitals.slice(0, 5).map((hospital, idx) => (
                <ResourceCard
                  key={idx}
                  resource={hospital}
                  type="hospital"
                  handleCall={handleEmergencyCall}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No hospitals found nearby. Call 108 for help.
            </p>
          )}
        </div>

        {/* Shelters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
            <Home className="w-5 h-5 mr-2 text-blue-500" /> Evacuation Centers
          </h2>
          {emergencyData?.shelters?.length > 0 ? (
            <div className="space-y-3">
              {emergencyData.shelters.slice(0, 5).map((shelter, idx) => (
                <ResourceCard
                  key={idx}
                  resource={shelter}
                  type="shelter"
                  handleCall={handleEmergencyCall}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No shelters found nearby. Contact local authorities.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Emergency;
