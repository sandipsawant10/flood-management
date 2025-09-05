import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  AlertTriangle,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Droplets,
  Phone,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user } = useAuthStore();
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery(["dashboard", selectedTimeRange], async () => {
    const response = await fetch(
      `/api/analytics/dashboard?timeRange=${selectedTimeRange}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch dashboard data");
    return response.json();
  });

  const stats = dashboardData?.data?.overview || {};
  const trends = dashboardData?.data?.trendsData || [];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Here&apos;s what&apos;s happening with flood conditions in your
              area
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>

            <Link
              to="/emergency"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              Emergency
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Droplets className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : stats.totalReports || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Verified Reports</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : stats.verifiedReports || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : stats.activeAlerts || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Verification Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? "..." : `${stats.verificationRate || 0}%`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/report-flood"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <Droplets className="w-5 h-5 text-blue-600 mr-3" />
              <span className="font-medium text-gray-900">Report Flood</span>
            </Link>

            <Link
              to="/reports"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <MapPin className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-medium text-gray-900">View Reports</span>
            </Link>

            <Link
              to="/alerts"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
            >
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
              <span className="font-medium text-gray-900">Check Alerts</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Your Trust Score
          </h2>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {user?.trustScore || 100}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Keep contributing to maintain your score
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${Math.min(user?.trustScore || 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-600">Account created</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              <span className="text-gray-600">Profile verified</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="w-4 h-4 text-blue-500 mr-2" />
              <span className="text-gray-600">Location updated</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">
            Recent Flood Reports
          </h2>
          <Link
            to="/reports"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            View all →
          </Link>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading reports...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8 text-gray-500">
                <p>No recent reports to display</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <XCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Error loading dashboard
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {error.message || "Unable to load dashboard data"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
