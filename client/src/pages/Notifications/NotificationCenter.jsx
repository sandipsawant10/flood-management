import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAuthToken } from "../../utils/tokenUtils";
import {
  Bell,
  BellOff,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Trash2,
  Search,
  Calendar,
  Loader2,
  Eye,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";

const NotificationCenter = () => {
  const { user } = useAuthStore();
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // React Query v5 object syntax
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications", selectedFilter, searchTerm, showUnreadOnly],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedFilter !== "all") params.append("type", selectedFilter);
      if (searchTerm) params.append("search", searchTerm);
      if (showUnreadOnly) params.append("unread", "true");

      const response = await fetch(`/api/notifications?${params}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");
      return response.json();
    },
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  const notifications = notificationsData?.notifications || [];

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      refetch();
      toast.success("Marked as read");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
      refetch();
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      if (!res.ok) throw new Error("Failed to delete notification");
      refetch();
      toast.success("Notification deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Helpers
  const getNotificationIcon = (type) => {
    const props = { className: "w-5 h-5" };
    switch (type) {
      case "alert":
        return <AlertTriangle {...props} className="text-red-600" />;
      case "info":
        return <Info {...props} className="text-blue-600" />;
      case "success":
        return <CheckCircle {...props} className="text-green-600" />;
      default:
        return <Bell {...props} className="text-gray-600" />;
    }
  };

  const getNotificationStyle = (type, isRead) => {
    const base = "border-l-4 rounded-lg transition-colors";
    const readStyle = isRead ? "bg-gray-50" : "bg-white shadow-sm";
    const typeStyles = {
      alert: "border-red-500",
      info: "border-blue-500",
      success: "border-green-500",
      default: "border-gray-300",
    };
    return `${base} ${readStyle} ${typeStyles[type] || typeStyles.default}`;
  };

  const formatTimeAgo = (date) => {
    const diffMs = new Date() - new Date(date);
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    alerts: notifications.filter((n) => n.type === "alert").length,
    today: notifications.filter(
      (n) => new Date(n.createdAt).toDateString() === new Date().toDateString()
    ).length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header and Stats */}
      {/* Filters/Search */}
      {/* Notification List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin" />{" "}
            <span>Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="text-red-600">{error.message}</div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-500">No notifications found.</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id || notification.id}
              className={getNotificationStyle(
                notification.type,
                notification.isRead
              )}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "1rem",
                border: "1px solid #e5e7eb",
                marginBottom: "0.5rem",
              }}
            >
              <div className="mr-4">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="font-semibold">
                  {notification.title || "Notification"}
                </div>
                <div className="text-gray-700 text-sm">
                  {notification.message}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatTimeAgo(notification.createdAt)}
                </div>
              </div>
              {notification.link && (
                <a
                  href={notification.link}
                  className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Report
                </a>
              )}
              <button
                className="ml-2 text-xs text-gray-400 hover:text-blue-600"
                onClick={() => markAsRead(notification._id || notification.id)}
                disabled={notification.isRead}
              >
                {notification.isRead ? "Read" : "Mark as Read"}
              </button>
              <button
                className="ml-2 text-xs text-gray-400 hover:text-red-600"
                onClick={() =>
                  deleteNotification(notification._id || notification.id)
                }
              >
                <Trash2 className="inline w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
