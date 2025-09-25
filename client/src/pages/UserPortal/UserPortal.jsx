import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  AlertTriangle,
  History,
  Users,
  Clock,
  LifeBuoy,
  FileEdit,
  Plus,
  ChevronDown,
  ArrowRight,
  PlusCircle,
  Eye,
  CheckCircle,
  XCircle,
  Bell,
} from "lucide-react";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { floodReportService } from "../../services/floodReportService";
import { alertService } from "../../services/alertService";
import InteractiveFloodMap from "../../components/Maps/InteractiveFloodMap";
import NearbyAlerts from "../../components/Alerts/NearbyAlerts";

const UserPortal = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showReportModal, setShowReportModal] = useState(false);
  const [mapRadius, setMapRadius] = useState(5); // 5 km radius

  // Get user's coordinates or default to central India
  const userCoordinates = user?.location?.coordinates || [20.5937, 78.9629];

  // Check if we're at the root portal path
  const isRootPath =
    location.pathname === "/portal" || location.pathname === "/portal/";

  // Fetch nearby flood reports
  const { data: nearbyReports, isLoading: reportsLoading } = useQuery({
    queryKey: ["nearby-reports", userCoordinates, mapRadius],
    queryFn: () =>
      floodReportService.getReports({
        "location.coordinates": userCoordinates,
        "location.radius": mapRadius,
      }),
    enabled: !!userCoordinates[0] && !!userCoordinates[1],
  });

  // Fetch user's submitted reports
  const { data: userReports, isLoading: userReportsLoading } = useQuery({
    queryKey: ["user-reports", user?.id],
    queryFn: () => floodReportService.getReports({ reportedBy: user?.id }),
    enabled: !!user?.id,
  });

  // Fetch nearby alerts
  const { data: nearbyAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["nearby-alerts", userCoordinates, mapRadius],
    queryFn: () =>
      alertService.getAlerts({
        "location.coordinates": userCoordinates,
        "location.radius": mapRadius,
      }),
    enabled: !!userCoordinates[0] && !!userCoordinates[1],
  });

  useEffect(() => {
    // Set active tab based on location path
    const path = location.pathname;
    if (path.includes("/portal/map")) {
      setActiveTab("map");
    } else if (path.includes("/portal/reports")) {
      setActiveTab("reports");
    } else if (path.includes("/portal/verify")) {
      setActiveTab("verify");
    } else if (path.includes("/portal/resources")) {
      setActiveTab("resources");
    } else {
      setActiveTab("dashboard");
    }
  }, [location.pathname]);

  // Handle tab navigation
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case "map":
        navigate("/portal/map");
        break;
      case "reports":
        navigate("/portal/reports");
        break;
      case "verify":
        navigate("/portal/verify");
        break;
      case "resources":
        navigate("/portal/resources");
        break;
      default:
        navigate("/portal");
        break;
    }
  };

  const handleReportButtonClick = () => {
    navigate("/portal/report");
  };

  // Get flood report statistics
  const getReportStats = () => {
    if (!userReports || !userReports.reports)
      return { total: 0, verified: 0, pending: 0 };

    const reports = userReports.reports || [];
    const total = reports.length;
    const verified = reports.filter(
      (r) => r.verificationStatus === "verified"
    ).length;
    const pending = reports.filter(
      (r) => r.verificationStatus === "pending"
    ).length;

    return { total, verified, pending };
  };

  // Get nearby alert stats
  const getAlertStats = () => {
    if (!nearbyAlerts || !nearbyAlerts.alerts) return { total: 0, critical: 0 };

    const alerts = nearbyAlerts.alerts || [];
    const total = alerts.length;
    const critical = alerts.filter(
      (a) => a.severity === "critical" || a.severity === "high"
    ).length;

    return { total, critical };
  };

  const reportStats = getReportStats();
  const alertStats = getAlertStats();

  const notificationCount = user?.notifications?.unreadCount || 0;

  // Dashboard content
  const DashboardContent = () => (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Bell className="mr-2 text-primary-600" />
          Latest Alerts Near You
        </h2>
        <div className="mb-6">
          <NearbyAlerts maxAlerts={3} compact={true} />
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate("/portal/map")}
            className="flex-1 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center"
          >
            <MapPin className="w-5 h-5 mr-2" /> View Map
          </button>
          <button
            onClick={handleReportButtonClick}
            className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
          >
            <AlertTriangle className="w-5 h-5 mr-2" /> Report Flood
          </button>
        </div>
      </div>

      {/* Map Preview */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <MapPin className="mr-2 text-primary-600" />
            Nearby Flood Activity
          </h2>
          <button
            onClick={() => navigate("/portal/map")}
            className="text-primary-600 hover:text-primary-800 flex items-center text-sm font-medium"
          >
            Full Map <ArrowRight className="ml-1 w-4 h-4" />
          </button>
        </div>
        <div className="h-[300px] mb-4 rounded-lg overflow-hidden border border-gray-200">
          <InteractiveFloodMap
            height="100%"
            center={userCoordinates}
            zoom={10}
            radius={mapRadius}
          />
        </div>
        <div className="flex flex-wrap justify-between text-sm text-gray-600">
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span>Critical Reports</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
            <span>High Reports</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Medium Reports</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
            <span>Low Reports</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Report stats */}
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Your Reports</p>
              <p className="text-2xl font-bold">{reportStats.total}</p>
            </div>
            <div className="bg-blue-100 p-2 rounded-lg">
              <FileEdit className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Verified: {reportStats.verified}</span>
              <span>Pending: {reportStats.pending}</span>
            </div>
          </div>
        </div>

        {/* Alert stats */}
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Nearby Alerts</p>
              <p className="text-2xl font-bold">{alertStats.total}</p>
            </div>
            <div className="bg-orange-100 p-2 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Critical: {alertStats.critical}</span>
              <span>Within {mapRadius}km</span>
            </div>
          </div>
        </div>

        {/* Trust Score */}
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Trust Score</p>
              <p className="text-2xl font-bold">{user?.trustScore || 0}/100</p>
            </div>
            <div className="bg-green-100 p-2 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-500">
              <span>{user?.trustLevel || "Newcomer"}</span>
            </div>
          </div>
        </div>

        {/* Response Rating */}
        <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-600">Response Rating</p>
              <p className="text-2xl font-bold">92%</p>
            </div>
            <div className="bg-purple-100 p-2 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xs text-gray-500">
              <span>Last response: 25 mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      {userReports && userReports.reports && userReports.reports.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <History className="mr-2 text-primary-600" />
              Your Recent Reports
            </h2>
            <button
              onClick={() => navigate("/portal/reports")}
              className="text-primary-600 hover:text-primary-800 flex items-center text-sm font-medium"
            >
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </button>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-2 px-3 text-left">Location</th>
                  <th className="py-2 px-3 text-left">Date</th>
                  <th className="py-2 px-3 text-left">Status</th>
                  <th className="py-2 px-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {userReports.reports.slice(0, 3).map((report) => (
                  <tr key={report._id} className="text-sm">
                    <td className="py-2 px-3">
                      {report.location.address ||
                        `${report.location.district}, ${report.location.state}`}
                    </td>
                    <td className="py-2 px-3">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3">
                      {report.verificationStatus === "verified" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" /> Verified
                        </span>
                      ) : report.verificationStatus === "pending" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </span>
                      ) : report.verificationStatus === "disputed" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <XCircle className="w-3 h-3 mr-1" /> Disputed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {report.verificationStatus}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() =>
                          navigate(`/portal/reports/${report._id}`)
                        }
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-gray-900 flex items-center">
              <AlertTriangle className="w-6 h-6 text-primary-600 mr-2" />
              Citizen Portal
            </h1>

            <div className="flex items-center space-x-4">
              {/* Notification bell */}
              <button className="relative p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                <Bell className="h-6 w-6" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>

              {/* Profile dropdown (simplified) */}
              <div className="flex items-center">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 font-medium">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="ml-2 hidden md:block">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name || "User"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.role || "Citizen"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-4 overflow-x-auto pb-3">
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
                activeTab === "dashboard"
                  ? "bg-primary-100 text-primary-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabClick("dashboard")}
            >
              <Users className="w-4 h-4 mr-2" />
              Dashboard
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
                activeTab === "map"
                  ? "bg-primary-100 text-primary-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabClick("map")}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Flood Map
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
                activeTab === "reports"
                  ? "bg-primary-100 text-primary-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabClick("reports")}
            >
              <History className="w-4 h-4 mr-2" />
              Your Reports
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
                activeTab === "verify"
                  ? "bg-primary-100 text-primary-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabClick("verify")}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Verify Reports
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md flex items-center ${
                activeTab === "resources"
                  ? "bg-primary-100 text-primary-800"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => handleTabClick("resources")}
            >
              <LifeBuoy className="w-4 h-4 mr-2" />
              Emergency Resources
            </button>
          </nav>
        </div>

        {/* Floating Action Button */}
        <button
          onClick={handleReportButtonClick}
          className="fixed bottom-8 right-8 bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-10"
        >
          <Plus className="h-6 w-6" />
        </button>

        {/* Content Area */}
        <div>
          {/* Show the dashboard content when we're at the root portal path */}
          {isRootPath ? (
            <DashboardContent />
          ) : (
            <Outlet /> // Render child routes
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPortal;
