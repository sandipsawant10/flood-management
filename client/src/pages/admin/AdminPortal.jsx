import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  ChartPieIcon,
  UserGroupIcon,
  TruckIcon,
  BuildingOfficeIcon,
  ShieldExclamationIcon,
  BanknotesIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

const AdminPortal = () => {
  const { hasAnyRole } = useAuthStore();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path
      ? "bg-primary-50 text-primary-700"
      : "hover:bg-blue-50 text-blue-600";
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
            {hasAnyRole(["admin"]) && (
              <li>
                <Link
                  to="/admin/analytics"
                  className={`flex items-center px-4 py-2 rounded-md ${isActive(
                    "/admin/analytics"
                  )} font-medium mx-2`}
                >
                  <ChartPieIcon className="w-5 h-5 mr-2" />
                  Analytics Dashboard
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
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPortal;
