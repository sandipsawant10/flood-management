import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  AlertTriangle,
  FileText,
  MapPin,
  Calendar,
  BarChart,
  AlertOctagon,
  PlusCircle,
  ArrowUpRight,
  Shield,
  Map,
  PhoneCall,
} from "lucide-react";
import { floodReportService } from "../../services/floodReportService";
import { alertService } from "../../services/alertService";
import WeatherWidget from "../../components/WeatherWidget";
import NewsWidget from "../../components/NewsWidget";
import FloodMap from "../../components/FloodMap";

const UserDashboard = () => {
  const { data: recentReports } = useQuery({
    queryKey: ["user-recent-reports"],
    queryFn: () => floodReportService.getCurrentUserReports({ limit: 3 }),
    placeholderData: [],
  });

  const { data: nearbyAlerts } = useQuery({
    queryKey: ["nearby-alerts"],
    queryFn: () => alertService.getNearbyAlerts(),
    placeholderData: [],
  });

  // Format date
  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get severity badge
  const getSeverityBadge = (severity) => {
    const colors = {
      critical: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          colors[severity] || "bg-gray-100 text-gray-800 border-gray-200"
        } border`}
      >
        <AlertTriangle className="w-3 h-3 mr-1" />
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome to the Citizen Portal
          </h1>
          <p className="mt-2 text-gray-600 max-w-3xl">
            Help your community by reporting flood situations, tracking alerts
            in your area, and accessing emergency resources. Your reports make a
            difference in disaster management.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              to="/portal/map"
              className="flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100"
            >
              <Map className="w-5 h-5 mr-2" /> View Flood Map
            </Link>
            <Link
              to="/portal/report"
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <PlusCircle className="w-5 h-5 mr-2" /> Report Flood
            </Link>
            <Link
              to="/portal/emergency"
              className="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
            >
              <PhoneCall className="w-5 h-5 mr-2" /> Emergency Resources
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Report Stats */}
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-primary-500">
            <div className="flex items-start">
              <div className="p-2 bg-primary-100 rounded">
                <FileText className="w-6 h-6 text-primary-700" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Your Reports
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {recentReports?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Nearby Alerts */}
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-orange-500">
            <div className="flex items-start">
              <div className="p-2 bg-orange-100 rounded">
                <AlertOctagon className="w-6 h-6 text-orange-700" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Nearby Alerts
                </p>
                <p className="text-xl font-semibold text-gray-900">
                  {nearbyAlerts?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Trust Score */}
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
            <div className="flex items-start">
              <div className="p-2 bg-green-100 rounded">
                <Shield className="w-6 h-6 text-green-700" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Trust Score</p>
                <p className="text-xl font-semibold text-gray-900">95%</p>
              </div>
            </div>
          </div>

          {/* Response Rate */}
          <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
            <div className="flex items-start">
              <div className="p-2 bg-purple-100 rounded">
                <BarChart className="w-6 h-6 text-purple-700" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">
                  Response Rate
                </p>
                <p className="text-xl font-semibold text-gray-900">78%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="md:row-span-2">
          <div className="bg-white rounded-lg shadow h-full">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium text-gray-800">Local Weather</h2>
            </div>
            <div className="p-4">
              <WeatherWidget />
            </div>
          </div>
        </div>

        {/* Map Preview */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-medium text-gray-800">
              Flood Activity Near You
            </h2>
            <Link
              to="/portal/map"
              className="text-primary-600 text-sm flex items-center"
            >
              View Full Map <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="h-64 relative">
            <FloodMap height="100%" />
          </div>
        </div>

        {/* News Updates */}
        <div className="bg-white rounded-lg shadow col-span-1 md:col-span-3">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-medium text-gray-800">Latest News & Updates</h2>
          </div>
          <div className="p-4">
            <NewsWidget />
          </div>
        </div>
      </div>

      {/* Your Reports Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-medium text-gray-800">Your Recent Reports</h2>
          <Link
            to="/portal/reports"
            className="text-primary-600 text-sm flex items-center"
          >
            View All <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {recentReports && recentReports.length > 0 ? (
            recentReports.map((report) => (
              <div key={report._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/portal/reports/${report._id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary-600"
                      >
                        {report.location.district}, {report.location.state}
                      </Link>
                      <span className="text-xs text-gray-500">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {report.description}
                    </p>
                    <div className="mt-2 flex items-center">
                      {getSeverityBadge(report.severity)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No reports yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't submitted any flood reports.
              </p>
              <div className="mt-6">
                <Link
                  to="/portal/report"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  <PlusCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                  Report Flood
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nearby Alerts */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-medium text-gray-800">Nearby Flood Alerts</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {nearbyAlerts && nearbyAlerts.length > 0 ? (
            nearbyAlerts.map((alert) => (
              <div key={alert._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.title}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatDate(alert.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {alert.description}
                    </p>
                    <div className="mt-2 flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        {alert.location.district}, {alert.location.state}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500">
                No alerts in your area at this time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
