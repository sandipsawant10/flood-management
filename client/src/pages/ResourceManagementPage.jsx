import React, { useState } from "react";
import {
  BarChart3,
  Calendar,
  Clock,
  FileBarChart,
  Gauge,
  List,
  Map,
  Truck,
  AlertTriangle,
  PackageOpen,
} from "lucide-react";
import ResourceTracking from "../components/Admin/ResourceTracking";

/**
 * ResourceManagementPage component that provides a dashboard for resource management
 * with different views and real-time updates
 */
const ResourceManagementPage = () => {
  const [activeView, setActiveView] = useState("tracking");
  const [timeframe, setTimeframe] = useState("all");
  const [showAlert, setShowAlert] = useState(true);

  // Mock data for dashboard stats
  const resourceStats = {
    totalResources: 187,
    availableResources: 114,
    allocatedResources: 58,
    maintenanceResources: 15,
    criticalLowStocks: 3,
    pendingRequests: 7,
    averageResponseTime: "14.2 mins",
    totalAllocationsCurrent: 24,
  };

  // Define view options with their icons
  const viewOptions = [
    {
      id: "tracking",
      name: "Resource Tracking",
      icon: <Truck className="h-5 w-5" />,
    },
    { id: "map", name: "Resource Map", icon: <Map className="h-5 w-5" /> },
    {
      id: "history",
      name: "Allocation History",
      icon: <Clock className="h-5 w-5" />,
    },
    {
      id: "scheduled",
      name: "Scheduled Allocations",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: "analytics",
      name: "Resource Analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      id: "inventory",
      name: "Inventory Report",
      icon: <FileBarChart className="h-5 w-5" />,
    },
  ];

  // Define timeframe options
  const timeframeOptions = [
    { id: "today", name: "Today" },
    { id: "week", name: "This Week" },
    { id: "month", name: "This Month" },
    { id: "quarter", name: "This Quarter" },
    { id: "year", name: "This Year" },
    { id: "all", name: "All Time" },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Truck className="h-6 w-6 text-blue-600 mr-2" />
            Resource Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track, allocate, and manage emergency resources across
            municipalities
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <span className="text-gray-600 text-sm">Timeframe:</span>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md py-1 pl-2 pr-8 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {timeframeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alert for critical resources */}
      {showAlert && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-red-800">
                  Critical Resource Levels Detected
                </p>
                <button
                  onClick={() => setShowAlert(false)}
                  className="text-red-600 hover:text-red-800"
                >
                  <span className="sr-only">Dismiss</span>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <p className="text-sm text-red-700 mt-1">
                3 resources have reached critically low levels. Immediate
                attention required.
              </p>
              <button
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
                onClick={() => {}}
              >
                View Critical Resources &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex justify-between">
            <p className="text-sm font-medium text-gray-600">Total Resources</p>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {resourceStats.totalResources} units
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {resourceStats.availableResources}
              </p>
              <p className="text-xs text-gray-500">Available for allocation</p>
            </div>
            <Gauge className="h-10 w-10 text-blue-600 opacity-80" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>{resourceStats.allocatedResources} allocated</span>
            <span>{resourceStats.maintenanceResources} in maintenance</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex justify-between">
            <p className="text-sm font-medium text-gray-600">
              Current Allocations
            </p>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {resourceStats.totalAllocationsCurrent}
              </p>
              <p className="text-xs text-gray-500">Across {7} municipalities</p>
            </div>
            <Map className="h-10 w-10 text-green-600 opacity-80" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>{resourceStats.pendingRequests} pending requests</span>
            <span>{resourceStats.averageResponseTime} avg. response</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex justify-between">
            <p className="text-sm font-medium text-gray-600">
              Resource Utilization
            </p>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full">
              Last 30 days
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">74%</p>
              <p className="text-xs text-gray-500">Efficiency rating</p>
            </div>
            <BarChart3 className="h-10 w-10 text-purple-600 opacity-80" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>42 deployments</span>
            <span>18 returns</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex justify-between">
            <p className="text-sm font-medium text-gray-600">Resource Alerts</p>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
              Attention needed
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {resourceStats.criticalLowStocks}
              </p>
              <p className="text-xs text-gray-500">Critical stock levels</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-red-600 opacity-80" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>8 expiring soon</span>
            <span>5 maintenance due</span>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex overflow-x-auto hide-scrollbar">
          {viewOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setActiveView(option.id)}
              className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap flex items-center ${
                activeView === option.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              aria-current={activeView === option.id ? "page" : undefined}
            >
              <span className="mr-2">{option.icon}</span>
              {option.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeView === "tracking" && <ResourceTracking />}

        {activeView === "map" && (
          <div className="p-8 flex flex-col items-center justify-center h-96 bg-gray-50">
            <Map className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Resource Map View
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Interactive map showing current resource allocation and
              availability across all municipalities. This feature is under
              development and will be available soon.
            </p>
          </div>
        )}

        {activeView === "history" && (
          <div className="p-8 flex flex-col items-center justify-center h-96 bg-gray-50">
            <Clock className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Allocation History
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              View historical resource allocations, including duration,
              requesting agencies, and usage outcomes. This feature is under
              development and will be available soon.
            </p>
          </div>
        )}

        {activeView === "scheduled" && (
          <div className="p-8 flex flex-col items-center justify-center h-96 bg-gray-50">
            <Calendar className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Scheduled Allocations
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Calendar view of upcoming resource allocations, deliveries, and
              returns. Plan resource availability in advance. This feature is
              under development and will be available soon.
            </p>
          </div>
        )}

        {activeView === "analytics" && (
          <div className="p-8 flex flex-col items-center justify-center h-96 bg-gray-50">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Resource Analytics
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              In-depth analysis of resource utilization, allocation patterns,
              and optimization opportunities. This feature is under development
              and will be available soon.
            </p>
          </div>
        )}

        {activeView === "inventory" && (
          <div className="p-8 flex flex-col items-center justify-center h-96 bg-gray-50">
            <FileBarChart className="h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Inventory Reports
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              Generate detailed inventory reports, forecast future resource
              needs, and identify procurement priorities. This feature is under
              development and will be available soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceManagementPage;
