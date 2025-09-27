import React from "react";
import { useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const AdminDashboardDebug = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  return (
    <div className="p-6 bg-white border border-gray-300 rounded-lg shadow-lg m-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Admin Dashboard Debug Info
      </h2>

      <div className="space-y-3">
        <div>
          <strong>Current Route:</strong> {location.pathname}
        </div>

        <div>
          <strong>Authentication Status:</strong>{" "}
          {isAuthenticated ? "Authenticated" : "Not Authenticated"}
        </div>

        <div>
          <strong>Loading:</strong> {loading ? "True" : "False"}
        </div>

        <div>
          <strong>User Data:</strong> {user ? "Present" : "Missing"}
        </div>

        {user && (
          <div className="ml-4">
            <div>
              <strong>User ID:</strong> {user.userId || "N/A"}
            </div>
            <div>
              <strong>User Name:</strong> {user.name || "N/A"}
            </div>
            <div>
              <strong>User Email:</strong> {user.email || "N/A"}
            </div>
            <div>
              <strong>User Role:</strong> {user.role || "N/A"}
            </div>
            <div>
              <strong>User Roles Array:</strong>{" "}
              {JSON.stringify(user.roles || [])}
            </div>
          </div>
        )}

        <div>
          <strong>Full User Object:</strong>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardDebug;
