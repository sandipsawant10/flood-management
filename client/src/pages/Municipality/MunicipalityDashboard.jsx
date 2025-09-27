import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Bell,
  AlertTriangle,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  LogOut,
  UserCircle,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

// Components to be created later
import FloodReportTable from "../../components/Admin/FloodReportTable";
import AlertForm from "../../components/Admin/AlertForm";
import EvacuationZoneManager from "../../components/Admin/EvacuationZoneManager";
import DashboardStats from "../../components/Admin/DashboardStats";

const MunicipalityDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("reports");

  // Mock data - replace with actual API calls
  const { data: dashboardStats } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => ({
      totalReports: 150,
      pendingReports: 25,
      activeAlerts: 3,
      evacuationZones: 5,
    }),
  });

  const tabs = [
    { id: "reports", name: "Flood Reports", icon: MapPin },
    { id: "alerts", name: "Alerts & Bulletins", icon: Bell },
    { id: "zones", name: "Evacuation Zones", icon: AlertTriangle },
    { id: "contacts", name: "Contact Coordination", icon: Users },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "reports":
        return <FloodReportTable />;
      case "alerts":
        return <AlertForm />;
      case "zones":
        return <EvacuationZoneManager />;
      case "contacts":
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Municipality Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Manage flood reports, alerts, and emergency response
          </p>
        </div>

        {/* User Profile and Logout */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <UserCircle className="w-5 h-5" />
            <div className="text-sm">
              <p className="font-medium">{user?.name || "Municipality User"}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardStats
          stats={[
            {
              name: "Total Reports",
              value: dashboardStats?.totalReports || 0,
              icon: MapPin,
              color: "bg-blue-500",
            },
            {
              name: "Pending Review",
              value: dashboardStats?.pendingReports || 0,
              icon: Clock,
              color: "bg-yellow-500",
            },
            {
              name: "Active Alerts",
              value: dashboardStats?.activeAlerts || 0,
              icon: Bell,
              color: "bg-red-500",
            },
            {
              name: "Evacuation Zones",
              value: dashboardStats?.evacuationZones || 0,
              icon: AlertTriangle,
              color: "bg-purple-500",
            },
          ]}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">{renderTabContent()}</div>
    </div>
  );
};

export default MunicipalityDashboard;
