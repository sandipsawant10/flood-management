import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  AlertTriangle,
  Phone,
  User,
  BarChart3,
  Menu,
  X,
  LogOut,
  MapPin,
  Users,
  ShieldAlert,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const baseNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Report Flood", href: "/report-flood", icon: FileText },
    { name: "View Reports", href: "/reports", icon: MapPin },
    { name: "Alerts", href: "/alerts", icon: AlertTriangle },
    { name: "Emergency", href: "/emergency", icon: Phone },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Notifications", href: "/notifications", icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg> },
    { name: "Rescuer Dashboard", href: "/rescuer", icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg> },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const adminNavigation = [
    { name: "Municipality", href: "/admin/municipality", icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
    { name: "Rescuers", href: "/admin/rescuers", icon: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Report Moderation", href: "/admin/reports", icon: ShieldAlert },
  ];

  const navigation = [
    ...baseNavigation,
    ...(user?.role === "admin" || user?.role === "official" ? adminNavigation : []),
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Aqua Assists
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || "citizen"}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-1"></div>
                <span className="text-xs text-gray-500">
                  Trust: {user?.trustScore || 100}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-3 py-2 mb-1 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary-100 text-primary-700 border-r-2 border-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-4 left-0 right-0 px-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="ml-4 lg:ml-0">
                <h1 className="text-xl font-semibold text-gray-900">
                  {navigation.find((item) => item.href === location.pathname)
                    ?.name || "Dashboard"}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/emergency"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-danger-600 hover:bg-danger-700"
              >
                <Phone className="w-4 h-4 mr-1" />
                Emergency
              </Link>

              <Link
                to="/profile"
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
