import React, { useState } from "react";
import useAuth from "../../hooks/useAuth";
import FloodReportTable from "./FloodReportTable";
import {
  AlertTriangle,
  Users,
  FileText,
  Activity,
  LogOut,
  UserCircle,
} from "lucide-react";

const MunicipalityDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // (Stats and alerts logic omitted for brevity, keep if needed elsewhere)

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

        {/* Stats Overview removed for consistency with FloodReportTable usage */}

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
          <div className="lg:col-span-2">
            <FloodReportTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MunicipalityDashboard;
