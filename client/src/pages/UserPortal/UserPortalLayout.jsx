import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Map,
  PhoneCall,
  User,
  Bell,
  PlusCircle,
  Home,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";

const UserPortalLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: "Dashboard", to: "/portal", icon: LayoutDashboard },
    { name: "Your Reports", to: "/portal/reports", icon: FileText },
    { name: "Flood Map", to: "/portal/map", icon: Map },
    { name: "Emergency Resources", to: "/portal/emergency", icon: PhoneCall },
    { name: "Profile", to: "/portal/profile", icon: User },
  ];

  // Close mobile menu when route changes
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-primary-600">
                  Flood Relief
                </span>
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded">
                  Citizen Portal
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className="flex items-center text-sm font-medium text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md"
                >
                  <item.icon className="w-5 h-5 mr-1.5" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-1 text-gray-500 hover:text-gray-700">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              {/* Mobile menu button */}
              <button
                type="button"
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {/* User Avatar */}
              <div className="hidden md:flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src={
                    user.photoURL ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(user.displayName || user.email)
                  }
                  alt={user.displayName || "User"}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {user.displayName || user.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed inset-0 z-40 md:hidden transform ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform ease-in-out duration-300`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setMobileMenuOpen(false)}
        />
        <nav className="relative flex flex-col bg-white h-full w-72 max-w-sm py-6 px-6 ml-auto">
          {/* Close button */}
          <button
            type="button"
            className="absolute top-5 right-5 rounded-md text-gray-400 hover:text-gray-500"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

          {/* User info */}
          <div className="flex items-center mb-8 mt-4">
            <img
              className="h-10 w-10 rounded-full"
              src={
                user.photoURL ||
                "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(user.displayName || user.email)
              }
              alt={user.displayName || "User"}
            />
            <div className="ml-3">
              <p className="text-base font-medium text-gray-800">
                {user.displayName || "User"}
              </p>
              <p className="text-sm font-medium text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-1 flex-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 rounded-md"
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-500" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Other links */}
          <div className="space-y-1 pt-4 border-t border-gray-200">
            <Link
              to="/"
              className="flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 rounded-md"
            >
              <Home className="w-5 h-5 mr-3 text-gray-500" />
              Main Home
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-md"
            >
              <LogOut className="w-5 h-5 mr-3 text-gray-500" />
              Log Out
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>

        {/* Floating Action Button */}
        <Link
          to="/portal/report"
          className="md:hidden fixed right-6 bottom-6 p-4 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700"
        >
          <PlusCircle className="w-6 h-6" />
        </Link>
      </main>
    </div>
  );
};

export default UserPortalLayout;
