import React from "react";
import { useAuthStore } from "../../store/authStore";

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome to Aqua Assists Dashboard, {user?.name}!
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Recent Reports</h3>
          <p className="text-gray-600">Dashboard coming soon...</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Active Alerts</h3>
          <p className="text-gray-600">No active alerts</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Your Trust Score</h3>
          <p className="text-2xl font-bold text-green-600">
            {user?.trustScore || 100}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
