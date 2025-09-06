import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  Clock,
  MapPin,
  Users,
  Shield,
  Info,
  ExternalLink,
  RefreshCw,
  Calendar,
  Phone,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const AlertsPage = () => {
  const { user } = useAuthStore();
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // React Query v5 object syntax
  const {
    data: alertsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["alerts", selectedSeverity, selectedType],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("status", "active");
      if (selectedSeverity) params.append("severity", selectedSeverity);
      if (selectedType) params.append("type", selectedType);

      const response = await fetch(`/api/alerts?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!response.ok) throw new Error("Failed to fetch alerts");
      return response.json();
    },
    refetchInterval: autoRefresh ? 30000 : false,
    refetchIntervalInBackground: true,
  });

  const alerts = alertsData?.alerts || [];

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: {
        bgColor: "bg-red-50",
        borderColor: "border-red-500",
        iconColor: "text-red-600",
        textColor: "text-red-900",
        badge: "bg-red-600",
      },
      high: {
        bgColor: "bg-orange-50",
        borderColor: "border-orange-500",
        iconColor: "text-orange-600",
        textColor: "text-orange-900",
        badge: "bg-orange-600",
      },
      medium: {
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-500",
        iconColor: "text-yellow-600",
        textColor: "text-yellow-900",
        badge: "bg-yellow-600",
      },
      low: {
        bgColor: "bg-blue-50",
        borderColor: "border-blue-500",
        iconColor: "text-blue-600",
        textColor: "text-blue-900",
        badge: "bg-blue-600",
      },
    };
    return configs[severity] || configs.medium;
  };

  const getTypeIcon = (type) => {
    const icons = {
      flood: <AlertTriangle className="w-5 h-5" />,
      weather: <Clock className="w-5 h-5" />,
      emergency: <Shield className="w-5 h-5" />,
      community: <Users className="w-5 h-5" />,
    };
    return icons[type] || <Info className="w-5 h-5" />;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const alertTime = new Date(date);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Emergency Alerts</h1>
              <p className="text-red-100 mt-1">
                Stay informed about flood conditions in your area
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <div className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              <span className="text-sm">
                Auto-refresh: {autoRefresh ? "ON" : "OFF"}
              </span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`ml-2 w-10 h-6 rounded-full transition-colors ${
                  autoRefresh ? "bg-green-600" : "bg-gray-600"
                } relative`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    autoRefresh ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Critical Alerts</p>
              <p className="text-xl font-bold text-gray-900">
                {alerts.filter((a) => a.severity === "critical").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-xl font-bold text-gray-900">{alerts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Your Area</p>
              <p className="text-sm font-medium text-gray-900">
                {user?.location?.district || "Not set"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Last Update</p>
              <p className="text-sm font-medium text-gray-900">
                {alerts.length > 0
                  ? formatTimeAgo(
                      Math.max(...alerts.map((a) => new Date(a.createdAt)))
                    )
                  : "No data"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Remaining Filters, Alerts List, and Auto-refresh Banner... */}
      {/* You can continue with your existing JSX for filters and alert cards */}
    </div>
  );
};

export default AlertsPage;
