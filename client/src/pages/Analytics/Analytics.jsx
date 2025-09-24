import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Loader2,
  BarChart3,
  Download,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { analyticsService } from "../../services/analyticsService";

// Import custom components
import AnalyticsFilters from "../../components/Analytics/AnalyticsFilters";
import EnhancedChart from "../../components/Analytics/EnhancedChart";
import HistoricalComparison from "../../components/Analytics/HistoricalComparison";
import RealTimeAnalytics from "../../components/Analytics/RealTimeAnalytics";
import ExportAnalytics from "../../components/Analytics/ExportAnalytics";
import PredictiveAnalytics from "../../components/Analytics/PredictiveAnalytics";

const Analytics = () => {
  // Authentication store available for permission checks if needed later
  useAuthStore();
  const [filters, setFilters] = useState({
    timeRange: "7d",
    dateStart: "",
    dateEnd: "",
    severity: [],
    locations: [],
    reportType: "all",
    verificationStatus: "all",
  });
  const [chartType, setChartType] = useState("bar");
  const [showRealTime, setShowRealTime] = useState(false);
  const [showHistorical, setShowHistorical] = useState(false);

  // Query for analytics data
  const {
    data,
    isLoading,
    error,
    refetch: refetchAnalytics,
  } = useQuery({
    queryKey: ["analytics", filters],
    queryFn: () => analyticsService.getAnalyticsData(filters),
    // Keep data alive for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  // Query for historical comparison data
  const getPreviousPeriodFilters = useCallback(() => {
    // Calculate previous period based on current filters
    const newFilters = { ...filters };

    // If using a preset time range
    if (filters.timeRange) {
      // Keep the same time range duration, but for previous period
      newFilters.timeRange = filters.timeRange;

      // For comparison purposes, we don't change the timeRange value
      // but we'll note in the UI that it's the previous period
    }

    // If using custom date range
    if (filters.dateStart && filters.dateEnd) {
      const startDate = new Date(filters.dateStart);
      const endDate = new Date(filters.dateEnd);
      const duration = endDate.getTime() - startDate.getTime();

      // Set previous period with same duration
      const newEndDate = new Date(startDate);
      newEndDate.setDate(newEndDate.getDate() - 1);

      const newStartDate = new Date(newEndDate);
      newStartDate.setTime(newEndDate.getTime() - duration);

      newFilters.dateStart = newStartDate.toISOString().split("T")[0];
      newFilters.dateEnd = newEndDate.toISOString().split("T")[0];
    }

    return newFilters;
  }, [filters]);

  const { data: comparisonData, isLoading: isComparisonLoading } = useQuery({
    queryKey: ["analytics-comparison", filters],
    queryFn: () =>
      analyticsService.getComparisonData(filters, getPreviousPeriodFilters()),
    enabled: showHistorical,
    staleTime: 5 * 60 * 1000,
  });

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // Chart colors
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800">
            Error loading analytics data: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-2 md:mb-0">
          <BarChart3 className="w-8 h-8 mr-3" />
          <h1 className="text-2xl md:text-3xl font-bold">
            Flood Analytics Dashboard
          </h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowRealTime(!showRealTime)}
            className={`flex items-center px-3 py-1.5 rounded text-sm font-medium ${
              showRealTime
                ? "bg-blue-400 text-white"
                : "bg-white text-blue-700 hover:bg-blue-50"
            }`}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {showRealTime ? "Hide Real-time" : "Show Real-time"}
          </button>
          <button
            onClick={() => refetchAnalytics()}
            className="bg-white text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded text-sm font-medium flex items-center"
            aria-label="Refresh analytics data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <AnalyticsFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Optional Real-Time Analytics */}
      {showRealTime && <RealTimeAnalytics />}

      {/* Export Component */}
      <ExportAnalytics
        filters={filters}
        onSuccess={(result) => {
          console.log("Export completed:", result);
        }}
        onError={(error) => {
          console.error("Export failed:", error);
        }}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800">Total Reports</h3>
          <p className="text-3xl font-bold text-blue-600">
            {data?.stats?.totalReports || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Verified Reports
          </h3>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-green-600">
              {data?.stats?.verifiedReports || 0}
            </p>
            <p className="text-sm text-gray-500">
              {data?.stats?.verificationRate || 0}% rate
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800">Active Alerts</h3>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-bold text-red-600">
              {data?.stats?.activeAlerts || 0}
            </p>
            <p className="text-sm text-gray-500">
              {data?.stats?.affectedAreas || 0} areas affected
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Average Response
          </h3>
          <div className="flex items-end">
            <p className="text-3xl font-bold text-purple-600">
              {data?.stats?.avgResponseTime || 0}
            </p>
            <p className="ml-1 text-lg text-gray-500 self-end mb-1">min</p>
          </div>
        </div>
      </div>

      {/* Enhanced Charts Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2 sm:mb-0">
            Reports & Alerts Trend
          </h2>
          <div className="flex space-x-2 items-center">
            <button
              onClick={() => setShowHistorical(!showHistorical)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                showHistorical
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <Calendar className="inline h-4 w-4 mr-1" />
              {showHistorical ? "Hide Comparison" : "Historical Comparison"}
            </button>
            <div className="flex space-x-1">
              <button
                onClick={() => setChartType("bar")}
                className={`p-1 rounded ${
                  chartType === "bar"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
                aria-label="Bar Chart"
                title="Bar Chart"
              >
                <BarChart3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`p-1 rounded ${
                  chartType === "line"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
                aria-label="Line Chart"
                title="Line Chart"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18"></path>
                  <path d="m3 15 5-5 4 4 8-8"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {showHistorical ? (
          <HistoricalComparison
            currentData={comparisonData?.current || data}
            previousData={comparisonData?.previous}
            chartType={chartType}
            isLoading={isComparisonLoading}
          />
        ) : (
          <EnhancedChart
            data={data?.reportsByDay || []}
            type={chartType}
            xAxisDataKey="date"
            series={[
              { dataKey: "reports", name: "Total Reports", color: "#8884d8" },
              {
                dataKey: "verified",
                name: "Verified Reports",
                color: "#82ca9d",
              },
              { dataKey: "alerts", name: "Alerts", color: "#ffc658" },
            ]}
            height={350}
          />
        )}
      </div>

      {/* Severity & Region Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Reports by Severity
          </h2>
          <EnhancedChart
            data={data?.reportsBySeverity || []}
            type="pie"
            nameKey="name"
            dataKey="value"
            colors={COLORS}
            height={300}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Reports by Region
          </h2>
          <EnhancedChart
            data={data?.reportsByRegion || []}
            type="bar"
            xAxisDataKey="name"
            series={[{ dataKey: "reports", name: "Reports", color: "#8884d8" }]}
            height={300}
            layout="vertical"
          />
        </div>
      </div>

      {/* Predictive Analytics Section */}
      <PredictiveAnalytics filters={filters} />
    </div>
  );
};

export default Analytics;
