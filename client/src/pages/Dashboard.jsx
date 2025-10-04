import React from "react";
import useAuth from "../hooks/useAuth";
import NearbyAlerts from "../components/Alerts/NearbyAlerts";
import AlertsMap from "../components/Maps/AlertsMap";
import NotificationCenter from "../pages/Notifications/NotificationCenter";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-gray-600 mt-2">
          Manage your flood disaster assistance here
        </p>
      </div>

      {/* Location-based Alerts */}
      <div className="mb-8">
        <NearbyAlerts maxAlerts={3} />
      </div>

      {/* Alerts Map */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Alert Map</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <AlertsMap height={300} showControls={false} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button
              onClick={() => (window.location.href = "/report-flood")}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Report Flood Incident
            </button>
            <button
              onClick={() => (window.location.href = "/report-water-issue")}
              className="w-full bg-cyan-600 text-white py-2 px-4 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Report Water Issue
            </button>
            <button
              onClick={() => (window.location.href = "/emergency")}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Emergency SOS
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
          <div className="space-y-4">
            <NotificationCenter />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
