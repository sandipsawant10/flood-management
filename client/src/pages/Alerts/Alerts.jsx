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
  Filter,
  Calendar,
  Phone,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const AlertsPage = () => {
  const { user } = useAuthStore();
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch alerts with real-time updates
  const {
    data: alertsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["alerts", selectedSeverity, selectedType],
    async () => {
      const params = new URLSearchParams();
      params.append("status", "active");
      if (selectedSeverity) params.append("severity", selectedSeverity);
      if (selectedType) params.append("type", selectedType);

      const response = await fetch(`/api/alerts?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch alerts");
      return response.json();
    },
    {
      refetchInterval: autoRefresh ? 30000 : false, // Auto-refresh every 30 seconds
      refetchIntervalInBackground: true,
    }
  );

  const alerts = alertsData?.alerts || [];

  // Real-time notification setup
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Filter Alerts</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="flood">Flood Warnings</option>
            <option value="weather">Weather Alerts</option>
            <option value="emergency">Emergency</option>
            <option value="community">Community</option>
          </select>

          <button
            onClick={() => {
              setSelectedSeverity("");
              setSelectedType("");
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Emergency Contacts Banner */}
      <div className="bg-red-600 text-white rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Phone className="w-5 h-5 mr-3" />
            <span className="font-medium">Emergency Contacts:</span>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <span>Police: 100</span>
            <span>Medical: 108</span>
            <span>Fire: 101</span>
            <span>Disaster Mgmt: 1070</span>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading alerts...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Error Loading Alerts
            </h3>
            <p className="text-red-600 mb-4">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-green-800 mb-2">
              No Active Alerts
            </h3>
            <p className="text-green-600">
              Great! There are no emergency alerts for your area at this time.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const config = getSeverityConfig(alert.severity);
            return (
              <div
                key={alert._id}
                className={`${config.bgColor} border-l-4 ${config.borderColor} rounded-lg shadow-sm overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`${config.iconColor} mr-3`}>
                        {getTypeIcon(alert.type)}
                      </div>
                      <div>
                        <h3
                          className={`text-xl font-semibold ${config.textColor} mb-1`}
                        >
                          {alert.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.badge}`}
                          >
                            {alert.severity?.toUpperCase()}
                          </span>
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{formatTimeAgo(alert.createdAt)}</span>
                          </div>
                          {alert.targetArea && (
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>
                                {alert.targetArea.district},{" "}
                                {alert.targetArea.state}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${config.badge} text-white`}
                    >
                      {alert.priority || "MEDIUM"} PRIORITY
                    </div>
                  </div>

                  <div className={`${config.textColor} mb-4`}>
                    <p className="text-base leading-relaxed">{alert.message}</p>
                  </div>

                  {alert.instructions && alert.instructions.length > 0 && (
                    <div className={`${config.textColor} mb-4`}>
                      <h4 className="font-medium mb-2">Safety Instructions:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {alert.instructions.map((instruction, index) => (
                          <li key={index} className="text-sm">
                            {instruction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {alert.affectedAreas && alert.affectedAreas.length > 0 && (
                    <div className={`${config.textColor} mb-4`}>
                      <h4 className="font-medium mb-2">Affected Areas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {alert.affectedAreas.map((area, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-white bg-opacity-50"
                          >
                            <MapPin className="w-3 h-3 mr-1" />
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 border-opacity-50">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          Valid until:{" "}
                          {alert.validUntil
                            ? new Date(alert.validUntil).toLocaleDateString()
                            : "Until further notice"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>
                          Issued by:{" "}
                          {alert.issuedBy || "Flood Management Authority"}
                        </span>
                      </div>
                    </div>

                    {alert.actionUrl && (
                      <a
                        href={alert.actionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center text-sm font-medium ${config.textColor} hover:underline`}
                      >
                        More Details
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Auto-refresh info */}
      {autoRefresh && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Info className="w-5 h-5 text-blue-600 mr-3" />
            <p className="text-blue-800 text-sm">
              This page automatically refreshes every 30 seconds to show the
              latest alerts. You will receive browser notifications for critical
              alerts if enabled.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
