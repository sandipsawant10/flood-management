import React from "react";
import { useNavigate } from "react-router-dom";
import {
  UserGroupIcon,
  PresentationChartLineIcon,
  ShieldExclamationIcon,
  TruckIcon,
  BanknotesIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: "User Management",
      description: "Manage user accounts, roles, and permissions.",
      icon: UserGroupIcon,
      color: "bg-blue-500 hover:bg-blue-600",
      route: "/admin/users",
    },
    {
      title: "Advanced Analytics",
      description:
        "View system performance, flood data trends, and user activity.",
      icon: PresentationChartLineIcon,
      color: "bg-green-500 hover:bg-green-600",
      route: "/admin/analytics",
    },
    {
      title: "Resource Tracking",
      description: "Monitor and manage emergency resources and equipment.",
      icon: TruckIcon,
      color: "bg-purple-500 hover:bg-purple-600",
      route: "/admin/resources",
    },
    {
      title: "Municipality Dashboard",
      description: "Manage municipality data and municipal services.",
      icon: BuildingOfficeIcon,
      color: "bg-indigo-500 hover:bg-indigo-600",
      route: "/admin/municipality",
    },
    {
      title: "Rescuer Dashboard",
      description: "Coordinate rescue teams and emergency response.",
      icon: ShieldExclamationIcon,
      color: "bg-red-500 hover:bg-red-600",
      route: "/admin/rescuer",
    },
    {
      title: "Financial Aid Requests",
      description: "Review and manage financial assistance applications.",
      icon: BanknotesIcon,
      color: "bg-yellow-500 hover:bg-yellow-600",
      route: "/admin/financial-aid",
    },
    {
      title: "AI Report Verification",
      description:
        "Review AI-verified reports and adjust verification settings.",
      icon: CheckCircleIcon,
      color: "bg-teal-500 hover:bg-teal-600",
      route: "/admin/verification",
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome to the administrator dashboard. Here you can manage users,
          view system analytics, and configure emergency settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dashboardCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-lg bg-gray-100">
                  <IconComponent className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                {card.title}
              </h2>
              <p className="text-gray-600 mb-4 text-sm">{card.description}</p>
              <button
                onClick={() => navigate(card.route)}
                className={`w-full px-4 py-2 text-white rounded-md transition-colors ${card.color} font-medium text-sm`}
              >
                Access {card.title}
              </button>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Active Users
          </h3>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
          <p className="text-sm text-gray-500 mt-1">+12% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Active Alerts
          </h3>
          <p className="text-3xl font-bold text-red-600">5</p>
          <p className="text-sm text-gray-500 mt-1">2 high priority</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Reports Today
          </h3>
          <p className="text-3xl font-bold text-green-600">23</p>
          <p className="text-sm text-gray-500 mt-1">18 verified</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Response Time
          </h3>
          <p className="text-3xl font-bold text-purple-600">8m</p>
          <p className="text-sm text-gray-500 mt-1">Average response time</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
