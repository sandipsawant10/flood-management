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
  Filter,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { alertService } from "../../services/alertService";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";


const AlertsPage = () => {
  const { user } = useAuthStore();
  const [selectedSeverity, setSelectedSeverity] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(
    Notification.permission === "granted"
  );

  // React Query v5 object syntax
  const {
    data: alertsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["alerts", selectedSeverity, selectedType],
    queryFn: async () => {
      const params = {
        status: "active",
      };
      
      if (selectedSeverity) params.severity = selectedSeverity;
      if (selectedType) params.type = selectedType;

      return alertService.getAlerts(params);
    },
    refetchInterval: autoRefresh ? 30000 : false,
    refetchIntervalInBackground: true,
  });

  const alerts = alertsData?.alerts || [];

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        setNotificationEnabled(permission === "granted");
      });
    }
  }, []);
  
  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        setNotificationEnabled(permission === "granted");
        if (permission === "granted") {
          toast.success("Notifications enabled!");
          // Show a test notification
          new Notification("AquaAssist Alerts", {
            body: "You will now receive flood alerts in real-time",
            icon: "/favicon.ico"
          });
        } else {
          toast.error("Notification permission denied");
        }
      });
    }
  };

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

      {/* Notification Banner */}
      {!notificationEnabled && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-start">
            <Bell className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Enable Notifications</h3>
              <p className="text-sm text-blue-600 mt-1">
                Get real-time alerts about flood emergencies in your area
              </p>
            </div>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Enable
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Filter Alerts</h2>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
            <ChevronRight
              className={`w-4 h-4 ml-1 transition-transform ${showFilters ? "rotate-90" : ""}`}
            />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="flood">Flood</option>
                <option value="weather">Weather</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedSeverity("");
                  setSelectedType("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 mr-2"
              >
                Reset
              </button>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-800">
              Error loading alerts: {error.message}
            </p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No Active Alerts
            </h3>
            <p className="text-gray-600">
              There are currently no active flood alerts for your area.
            </p>
          </div>
        ) : (
          alerts.map((alert) => {
            const config = getSeverityConfig(alert.severity);
            return (
              <div
                key={alert.id}
                className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4`}
              >
                <div className="flex items-start">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${config.badge}`}
                  >
                    {getTypeIcon(alert.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${config.textColor}`}>
                        {alert.title}
                      </h3>
                      <span className="text-xs bg-white bg-opacity-50 px-2 py-1 rounded-full">
                        {formatTimeAgo(alert.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{alert.description}</p>
                    <div className="flex items-center mt-3 text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>
                        {alert.location.district}, {alert.location.state}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.badge} text-white`}
                        >
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {alert.type}
                        </span>
                      </div>
                      <button className="text-xs flex items-center text-blue-600 hover:text-blue-800">
                        View Details
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Emergency Contact */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-red-800">Emergency Assistance</h3>
          <p className="text-sm text-red-600 mt-1">
            Need immediate help? Contact emergency services
          </p>
        </div>
        <Link
          to="/emergency"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Phone className="w-4 h-4 mr-2" />
          Emergency
        </Link>
      </div>
    </div>
  );
};

export default AlertsPage;
