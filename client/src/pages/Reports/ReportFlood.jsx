import React from "react";
import { useAuthStore } from "../../store/authStore";

const ReportFlood = () => {
  const { user } = useAuthStore();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Report Flood</h1>
        <p className="text-gray-600 mb-6">
          Help your community by reporting flood conditions in your area
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              placeholder="Enter your location"
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity Level
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe the flood situation..."
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          <button className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700">
            Submit Report (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportFlood;
