import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  BellOff,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Trash2,
  MarkAsRead,
  Filter,
  Search,
  Calendar,
  Settings,
  Loader2,
  X,
  Eye,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const NotificationCenter = () => {
  const { user } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["notifications", selectedFilter, searchTerm, showUnreadOnly],
    async () => {
      const params = new URLSearchParams();
      if (selectedFilter !== "all") params.append("type", selectedFilter);
      if (searchTerm) params.append("search", searchTerm);
      if (showUnreadOnly) params.append("unread", "true");

      const response = await fetch(`/api/notifications?${params}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      refetchIntervalInBackground: true,
    }
  );

  const notifications = notificationsData?.data || [];

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to mark as read");

      refetch();
      toast.success("Marked as read");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to mark all as read");

      refetch();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete notification");

      refetch();
      toast.success("Notification deleted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { className: "w-5 h-5" };

    switch (type) {
      case "alert":
        return (
          <AlertTriangle {...iconProps} className="w-5 h-5 text-red-600" />
        );
      case "info":
        return <Info {...iconProps} className="w-5 h-5 text-blue-600" />;
      case "success":
        return (
          <CheckCircle {...iconProps} className="w-5 h-5 text-green-600" />
        );
      default:
        return <Bell {...iconProps} className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationStyle = (type, isRead) => {
    const baseStyle = "border-l-4 rounded-lg transition-colors";
    const readStyle = isRead ? "bg-gray-50" : "bg-white shadow-sm";

    const typeStyles = {
      alert: "border-red-500",
      info: "border-blue-500",
      success: "border-green-500",
      default: "border-gray-300",
    };

    return `${baseStyle} ${readStyle} ${
      typeStyles[type] || typeStyles.default
    }`;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationTime = new Date(date);
    const diffMs = now - notificationTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notificationTime.toLocaleDateString();
  };

  // Statistics
  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    alerts: notifications.filter((n) => n.type === "alert").length,
    today: notifications.filter((n) => {
      const today = new Date().toDateString();
      return new Date(n.createdAt).toDateString() === today;
    }).length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="w-8 h-8 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Notification Center</h1>
              <p className="text-blue-100 mt-1">
                Stay updated with all your alerts and messages
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {stats.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <MarkAsRead className="w-4 h-4 mr-2" />
                Mark All Read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BellOff className="w-5 h-5 text-orange-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-xl font-bold text-gray-900">{stats.unread}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Alerts</p>
              <p className="text-xl font-bold text-gray-900">{stats.alerts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-xl font-bold text-gray-900">{stats.today}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="alert">Alerts</option>
              <option value="info">Information</option>
              <option value="success">Success</option>
              <option value="system">System</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            {/* Unread Filter */}
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show unread only</span>
            </label>

            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
            >
              <Loader2
                className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Error Loading Notifications
            </h3>
            <p className="text-red-600 mb-4">{error.message}</p>
            <button
              onClick={() => refetch()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              No Notifications
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedFilter !== "all" || showUnreadOnly
                ? "No notifications match your current filters."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={getNotificationStyle(
                notification.type,
                notification.isRead
              )}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <div className="mr-4 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`font-medium ${
                            notification.isRead
                              ? "text-gray-600"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`text-sm ${
                          notification.isRead
                            ? "text-gray-500"
                            : "text-gray-700"
                        } mb-3`}
                      >
                        {notification.message}
                      </p>

                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {notification.metadata && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      {notification.source && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Source: {notification.source}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More */}
      {notifications.length >= 20 && (
        <div className="text-center pt-6">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Load More Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
