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

import EmergencyContacts from "../../components/Emergency/EmergencyContacts";
import NearbyResources from "../../components/Emergency/NearbyResources";
import QuickActions from "../../components/Emergency/QuickActions";
import { emergencyService } from "../../services/emergencyService";
import { useAuthStore } from "../../store/authStore";

const Emergency = () => {
  const { user } = useAuthStore();
  const [userLocation, setUserLocation] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [emergencyMode, setEmergencyMode] = useState(false);

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
        (error) => {
          console.error("Location error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    }
  }, []);

  // Fetch emergency data
  const { data: emergencyData, isLoading } = useQuery(
    ["emergency-data", userLocation],
    () =>
      emergencyService.getEmergencyData({
        latitude: userLocation?.latitude || user?.location?.coordinates?.[1],
        longitude: userLocation?.longitude || user?.location?.coordinates?.[0],
        radius: 10, // 10km radius
      }),
    {
      enabled: !!userLocation || !!user?.location?.coordinates,
      refetchInterval: isOnline ? 30000 : false, // Refetch every 30 seconds if online
    }
  );

  const { data: activeIncidents } = useQuery(
    "active-incidents",
    () =>
      emergencyService.getActiveIncidents({
        district: user?.location?.district,
        state: user?.location?.state,
      }),
    {
      enabled: !!user?.location,
      refetchInterval: isOnline ? 60000 : false,
    }
  );

  const emergencyContacts = [
    {
      name: "Police Emergency",
      number: "100",
      type: "police",
      icon: Shield,
      available24x7: true,
    },
    {
      name: "Fire Services",
      number: "101",
      type: "fire",
      icon: Zap,
      available24x7: true,
    },
    {
      name: "Medical Emergency",
      number: "108",
      type: "medical",
      icon: Hospital,
      available24x7: true,
    },
    {
      name: "Disaster Management",
      number: "1070",
      type: "disaster",
      icon: AlertTriangle,
      available24x7: true,
    },
    {
      name: "Women Helpline",
      number: "181",
      type: "women",
      icon: Users,
      available24x7: true,
    },
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
      urgent: false,
    },
    {
      id: "medical-help",
      title: "Medical Help",
      description: "Find nearby hospitals and clinics",
      icon: Hospital,
      color: "green",
      urgent: false,
    },
    {
      id: "transportation",
      title: "Transportation",
      description: "Emergency transportation services",
      icon: Car,
      color: "purple",
      urgent: false,
    },
  ];

  const handleEmergencyCall = (number) => {
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    window.open(`tel:${number}`);
  };

  const handleQuickAction = (action) => {
    if (action.action) {
      action.action();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

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

            {userLocation && (
              <div className="flex items-center text-sm text-red-100">
                <MapPin className="w-4 h-4 mr-1" />
                <span>
                  Location accuracy: ±{Math.round(userLocation.accuracy)}m
                </span>
              </div>
            )}
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

      {/* Active Incidents Alert */}
      {activeIncidents && activeIncidents.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">
                Active Emergency Incidents
              </h3>
              <div className="mt-2 space-y-1">
                {activeIncidents.slice(0, 3).map((incident, index) => (
                  <p key={index} className="text-sm text-red-700">
                    • {incident.title} - {incident.location}
                  </p>
                ))}
                {activeIncidents.length > 3 && (
                  <p className="text-sm text-red-600 font-medium">
                    +{activeIncidents.length - 3} more incidents in your area
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Emergency Actions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Quick Actions
              </h2>
              <p className="text-sm text-gray-600">
                Immediate emergency assistance
              </p>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
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
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Emergency Contacts
            </h2>
            <p className="text-sm text-gray-600">24/7 helpline numbers</p>
          </div>

          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {emergencyContacts.map((contact, index) => (
              <button
                key={index}
                onClick={() => handleEmergencyCall(contact.number)}
                className="w-full p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all text-left group"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200">
                    <contact.icon className="w-5 h-5 text-red-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 group-hover:text-red-900">
                        {contact.name}
                      </h4>
                      <span className="text-lg font-bold text-red-600">
                        {contact.number}
                      </span>
                    </div>

                    <div className="flex items-center mt-1">
                      <Clock className="w-3 h-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">
                        24/7 Available
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Personal Emergency Contacts */}
          {user?.preferences?.emergencyContacts &&
            user.preferences.emergencyContacts.length > 0 && (
              <>
                <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700">
                    Personal Contacts
                  </h3>
                </div>
                <div className="p-4 space-y-2">
                  {user.preferences.emergencyContacts.map((contact, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmergencyCall(contact.phone)}
                      className="w-full p-2 border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50 transition-all text-left text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{contact.name}</span>
                          <span className="text-gray-500 ml-2">
                            ({contact.relationship})
                          </span>
                        </div>
                        <span className="font-medium text-blue-600">
                          {contact.phone}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
        </div>
      </div>

      {/* Nearby Emergency Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hospitals and Medical Centers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Hospital className="w-5 h-5 text-red-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">
                Nearby Hospitals
              </h2>
            </div>
          </div>

          <div className="p-4">
            {emergencyData?.hospitals && emergencyData.hospitals.length > 0 ? (
              <div className="space-y-3">
                {emergencyData.hospitals.slice(0, 5).map((hospital, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {hospital.name}
                        </h4>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{hospital.distance.toFixed(1)} km away</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {hospital.address}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1">
                        {hospital.phone && (
                          <button
                            onClick={() => handleEmergencyCall(hospital.phone)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Call
                          </button>
                        )}
                        <button
                          onClick={() =>
                            window.open(
                              `https://maps.google.com/?q=${hospital.coordinates[1]},${hospital.coordinates[0]}`,
                              "_blank"
                            )
                          }
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Directions
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Hospital className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hospitals found nearby</p>
                <p className="text-sm">Call 108 for medical emergency</p>
              </div>
            )}
          </div>
        </div>

        {/* Evacuation Centers and Shelters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              <Home className="w-5 h-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">
                Evacuation Centers
              </h2>
            </div>
          </div>

          <div className="p-4">
            {emergencyData?.shelters && emergencyData.shelters.length > 0 ? (
              <div className="space-y-3">
                {emergencyData.shelters.slice(0, 5).map((shelter, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {shelter.name}
                        </h4>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{shelter.distance.toFixed(1)} km away</span>
                        </div>
                        <div className="flex items-center mt-1 text-sm">
                          <Users className="w-3 h-3 mr-1 text-green-500" />
                          <span className="text-green-600">
                            {shelter.capacity - (shelter.currentOccupancy || 0)}{" "}
                            spaces available
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        {shelter.phone && (
                          <button
                            onClick={() => handleEmergencyCall(shelter.phone)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Call
                          </button>
                        )}
                        <button
                          onClick={() =>
                            window.open(
                              `https://maps.google.com/?q=${shelter.coordinates[1]},${shelter.coordinates[0]}`,
                              "_blank"
                            )
                          }
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Directions
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No evacuation centers found nearby</p>
                <p className="text-sm">
                  Contact local authorities for shelter information
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Preparedness Tips */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Emergency Preparedness
          </h2>
          <p className="text-sm text-gray-600">
            Essential tips during flood emergencies
          </p>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 border border-gray-200 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Stay Informed</h4>
              <p className="text-xs text-gray-600">
                Monitor weather alerts and evacuation orders
              </p>
            </div>

            <div className="text-center p-3 border border-gray-200 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Home className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">
                Move to Higher Ground
              </h4>
              <p className="text-xs text-gray-600">
                Get to the highest floor or elevated area
              </p>
            </div>

            <div className="text-center p-3 border border-gray-200 rounded-lg">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Phone className="w-5 h-5 text-yellow-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Call for Help</h4>
              <p className="text-xs text-gray-600">
                Don't hesitate to call emergency services
              </p>
            </div>

            <div className="text-center p-3 border border-gray-200 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-1">Stay Together</h4>
              <p className="text-xs text-gray-600">
                Keep family members together and accounted for
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
