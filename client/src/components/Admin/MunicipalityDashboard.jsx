import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../services/axiosConfig";
import useAuth from "../../hooks/useAuth";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  FileText,
  TrendingUp,
  Activity,
  LogOut,
  UserCircle,
} from "lucide-react";

const MunicipalityDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch flood reports
  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["floodReports"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/flood-reports");
      return data;
    },
  });

  // Fetch alerts
  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/api/alerts");
      return data;
    },
  });

  // Ensure data is always an array
  const reportsArray = Array.isArray(reports) ? reports : [];
  const alertsArray = Array.isArray(alerts) ? alerts : [];

  // Calculate stats
  const stats = {
    totalReports: reportsArray.length,
    pendingReports: reportsArray.filter(
      (r) => r.verificationStatus === "pending"
    ).length,
    criticalAlerts: alertsArray.filter((a) => a.severity === "critical").length,
    activeAlerts: alertsArray.filter((a) => !a.resolved).length,
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue" }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 bg-${color}-100 rounded-full`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        )}
      </div>
    </div>
  );

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 font-medium rounded-lg transition-colors ${
        isActive
          ? "bg-blue-600 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  const ReportsList = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
      </div>
      <div className="p-6">
        {reportsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading reports...</p>
          </div>
        ) : reportsArray.length > 0 ? (
          <div className="space-y-4">
            {reportsArray.slice(0, 5).map((report) => (
              <div
                key={report._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${
                      report.verificationStatus === "verified"
                        ? "bg-green-100"
                        : report.verificationStatus === "pending"
                        ? "bg-yellow-100"
                        : "bg-red-100"
                    }`}
                  >
                    {report.verificationStatus === "verified" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : report.verificationStatus === "pending" ? (
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {report.location?.address || "Unknown Location"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {report.verificationStatus} •{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    report.severity === "critical"
                      ? "bg-red-100 text-red-800"
                      : report.severity === "high"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {report.severity}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No reports found</p>
          </div>
        )}
      </div>
    </div>
  );

  const AlertsList = () => (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
      </div>
      <div className="p-6">
        {alertsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading alerts...</p>
          </div>
        ) : alertsArray.length > 0 ? (
          <div className="space-y-4">
            {alertsArray.slice(0, 5).map((alert) => (
              <div
                key={alert._id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${
                      alert.severity === "critical"
                        ? "bg-red-100"
                        : alert.severity === "high"
                        ? "bg-orange-100"
                        : "bg-yellow-100"
                    }`}
                  >
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        alert.severity === "critical"
                          ? "text-red-600"
                          : alert.severity === "high"
                          ? "text-orange-600"
                          : "text-yellow-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{alert.title}</p>
                    <p className="text-sm text-gray-500">
                      {alert.description?.substring(0, 60)}...
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    alert.resolved
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {alert.resolved ? "Resolved" : "Active"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No active alerts</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Municipality Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage municipal services and monitor flood reports
            </p>
          </div>

          {/* User Profile and Logout */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <UserCircle className="w-5 h-5" />
              <div className="text-sm">
                <p className="font-medium">
                  {user?.name || "Municipality User"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || "municipality"}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-1 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Reports"
            value={stats.totalReports}
            subtitle="+12% from last month"
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Pending Reports"
            value={stats.pendingReports}
            subtitle="Requires verification"
            icon={Activity}
            color="yellow"
          />
          <StatCard
            title="Critical Alerts"
            value={stats.criticalAlerts}
            subtitle="High priority"
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            title="Active Alerts"
            value={stats.activeAlerts}
            subtitle="Needs attention"
            icon={Users}
            color="orange"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
          <TabButton
            id="overview"
            label="Overview"
            isActive={activeTab === "overview"}
            onClick={setActiveTab}
          />
          <TabButton
            id="reports"
            label="Reports"
            isActive={activeTab === "reports"}
            onClick={setActiveTab}
          />
          <TabButton
            id="alerts"
            label="Alerts"
            isActive={activeTab === "alerts"}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeTab === "overview" && (
            <>
              <ReportsList />
              <AlertsList />
            </>
          )}
          {activeTab === "reports" && (
            <div className="lg:col-span-2">
              <ReportsList />
            </div>
          )}
          {activeTab === "alerts" && (
            <div className="lg:col-span-2">
              <AlertsList />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MunicipalityDashboard;
