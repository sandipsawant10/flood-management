import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {
  ChartPieIcon,
  UserGroupIcon,
  TruckIcon,
  BuildingOfficeIcon,
  ShieldExclamationIcon,
  BanknotesIcon,
  CheckCircleIcon,
  PresentationChartLineIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const AdminPortal = () => {
  const { user, logout } = useAuth();
  const location = useLocation(); // Helper function to check if user has any of the required roles
  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.some(
      (role) => user.roles?.includes(role) || user.role === role
    );
  };

  const isActive = (path) => {
    // Special handling for dashboard route
    if (
      path === "/admin" &&
      (location.pathname === "/admin" ||
        location.pathname === "/admin/dashboard")
    ) {
      return "bg-blue-50 text-blue-700 border-r-2 border-blue-700";
    }

    return location.pathname === path
      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
      : "hover:bg-gray-50 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md h-screen sticky top-0">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Admin Portal</h1>
          <p className="text-sm text-gray-500">Flood Management System</p>
        </div>
        <nav className="mt-4">
          <ul className="space-y-1">
            <li>
              <Link
                to="/admin"
                className={`flex items-center px-4 py-2 rounded-md ${isActive(
                  "/admin"
                )} font-medium mx-2`}
              >
                <ChartPieIcon className="w-5 h-5 mr-2" />
                Dashboard
              </Link>
            </li>

            {hasAnyRole(["admin"]) && (
              <li>
                <Link
                  to="/admin/analytics"
                  className={`flex items-center px-4 py-2 rounded-md ${isActive(
                    "/admin/analytics"
                  )} font-medium mx-2`}
                >
                  <PresentationChartLineIcon className="w-5 h-5 mr-2" />
                  Advanced Analytics
                </Link>
              </li>
            )}

            {hasAnyRole(["admin"]) && (
              <li>
                <Link
                  to="/admin/users"
                  className={`flex items-center px-4 py-2 rounded-md ${isActive(
                    "/admin/users"
                  )} font-medium mx-2`}
                >
                  <UserGroupIcon className="w-5 h-5 mr-2" />
                  User Management
                </Link>
              </li>
            )}

            {hasAnyRole(["admin", "municipality"]) && (
              <li>
                <Link
                  to="/admin/resources"
                  className={`flex items-center px-4 py-2 rounded-md ${isActive(
                    "/admin/resources"
                  )} font-medium mx-2`}
                >
                  <TruckIcon className="w-5 h-5 mr-2" />
                  Resource Tracking
                </Link>
              </li>
            )}

            <li>
              <Link
                to="/admin/municipality"
                className={`flex items-center px-4 py-2 rounded-md ${isActive(
                  "/admin/municipality"
                )} font-medium mx-2`}
              >
                <BuildingOfficeIcon className="w-5 h-5 mr-2" />
                Municipality Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/admin/rescuer"
                className={`flex items-center px-4 py-2 rounded-md ${isActive(
                  "/admin/rescuer"
                )} font-medium mx-2`}
              >
                <ShieldExclamationIcon className="w-5 h-5 mr-2" />
                Rescuer Dashboard
              </Link>
            </li>

            {hasAnyRole(["admin", "municipality"]) && (
              <li>
                <Link
                  to="/admin/financial-aid"
                  className={`flex items-center px-4 py-2 rounded-md ${isActive(
                    "/admin/financial-aid"
                  )} font-medium mx-2`}
                >
                  <BanknotesIcon className="w-5 h-5 mr-2" />
                  Financial Aid Requests
                </Link>
              </li>
            )}

            {hasAnyRole(["admin", "municipality"]) && (
              <li>
                <Link
                  to="/admin/verification"
                  className={`flex items-center px-4 py-2 rounded-md ${isActive(
                    "/admin/verification"
                  )} font-medium mx-2`}
                >
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  AI Report Verification
                </Link>
              </li>
            )}
          </ul>
        </nav>

        {/* User Profile and Logout Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <UserCircleIcon className="w-8 h-8 text-gray-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || "admin"}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPortal;
