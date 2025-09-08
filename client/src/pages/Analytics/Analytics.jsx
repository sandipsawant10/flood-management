import React, { useState } from "react";
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
  ChevronDown,
  Filter,
  Loader2,
  MapPin,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { analyticsService } from "../../services/analyticsService";

// Use the imported analyticsService instead of the inline mock
/*const analyticsService = {
  getAnalyticsData: async (timeRange) => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          reportsByDay: [
            { date: "Mon", reports: 12, verified: 8 },
            { date: "Tue", reports: 19, verified: 12 },
            { date: "Wed", reports: 15, verified: 10 },
            { date: "Thu", reports: 25, verified: 18 },
            { date: "Fri", reports: 32, verified: 22 },
            { date: "Sat", reports: 18, verified: 14 },
            { date: "Sun", reports: 10, verified: 7 },
          ],
          reportsBySeverity: [
            { name: "Critical", value: 18 },
            { name: "High", value: 25 },
            { name: "Medium", value: 42 },
            { name: "Low", value: 15 },
          ],
          reportsByRegion: [
            { name: "North District", reports: 35 },
            { name: "South District", reports: 28 },
            { name: "East District", reports: 42 },
            { name: "West District", reports: 19 },
            { name: "Central District", reports: 25 },
          ],
          alertTrends: [
            { month: "Jan", alerts: 8 },
            { month: "Feb", alerts: 12 },
            { month: "Mar", alerts: 15 },
            { month: "Apr", alerts: 10 },
            { month: "May", alerts: 18 },
            { month: "Jun", alerts: 25 },
          ],
          stats: {
            totalReports: 245,
            verifiedReports: 178,
            activeAlerts: 12,
            affectedAreas: 8,
            verificationRate: 72.6,
            avgResponseTime: 18, // minutes
          },
        });
      }, 800);
    });
  },
};*/

const Analytics = () => {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState("week");
  const [chartType, setChartType] = useState("bar");

  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics", timeRange],
    queryFn: () => analyticsService.getAnalyticsData(timeRange),
  });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (isLoading) {
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 mr-4" />
            <div>
              <h1 className="text-3xl font-bold">Flood Analytics</h1>
              <p className="text-blue-100 mt-1">
                Data insights and trends for flood reporting and alerts
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none bg-blue-700 text-white px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Total Reports</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.stats.totalReports}
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+12% from last {timeRange}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Verified Reports</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.stats.verifiedReports}
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+8% from last {timeRange}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Active Alerts</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.stats.activeAlerts}
            </p>
            <div className="mt-2 flex items-center text-xs text-red-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+5% from last {timeRange}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Affected Areas</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.stats.affectedAreas}
            </p>
            <div className="mt-2 flex items-center text-xs text-gray-600">
              <MapPin className="w-3 h-3 mr-1" />
              <span>Across 3 districts</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Verification Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.stats.verificationRate}%
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>+2.4% from last {timeRange}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Avg Response Time</p>
            <p className="text-2xl font-bold text-gray-900">
              {data.stats.avgResponseTime} <span className="text-sm">min</span>
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>-3 min from last {timeRange}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Report Trends</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setChartType("bar")}
              className={`p-2 rounded-md ${chartType === "bar" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setChartType("line")}
              className={`p-2 rounded-md ${chartType === "line" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <LineChartIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setChartType("pie")}
              className={`p-2 rounded-md ${chartType === "pie" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
            >
              <PieChartIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={data.reportsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reports" name="Total Reports" fill="#3b82f6" />
                <Bar dataKey="verified" name="Verified" fill="#10b981" />
              </BarChart>
            ) : chartType === "line" ? (
              <LineChart data={data.reportsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="reports"
                  name="Total Reports"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="verified"
                  name="Verified"
                  stroke="#10b981"
                />
              </LineChart>
            ) : (
              <PieChart>
                <Pie
                  data={data.reportsBySeverity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.reportsBySeverity.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Charts Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Region Reports */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Reports by Region
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data.reportsByRegion}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="reports" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Alert Trends
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.alertTrends}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="alerts"
                  stroke="#ff7300"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-medium text-blue-800 mb-4">
          Key Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h3 className="font-medium text-blue-700 mb-2">
              Reporting Patterns
            </h3>
            <p className="text-sm text-gray-600">
              Flood reports peak on Fridays with 32 submissions, showing a 28%
              increase compared to the weekly average. The verification rate has
              improved by 2.4% this {timeRange}.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h3 className="font-medium text-blue-700 mb-2">
              Regional Hotspots
            </h3>
            <p className="text-sm text-gray-600">
              East District shows the highest flood activity with 42 reports,
              followed by North District with 35 reports. These areas may require
              additional monitoring and resources.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h3 className="font-medium text-blue-700 mb-2">Alert Frequency</h3>
            <p className="text-sm text-gray-600">
              Alert frequency has increased by 39% since January, with June
              showing the highest number of alerts (25). This correlates with the
              seasonal monsoon patterns.
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h3 className="font-medium text-blue-700 mb-2">Response Times</h3>
            <p className="text-sm text-gray-600">
              Average response time to flood reports has improved to 18 minutes,
              a 14% improvement from the previous {timeRange}. Critical alerts
              are responded to within 12 minutes on average.
            </p>
          </div>
        </div>
      </div>

      {/* Data Source Note */}
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>
          Data shown is for demonstration purposes. In production, this would be
          connected to real-time flood reporting and alert APIs.
        </p>
      </div>
    </div>
  );
};

export default Analytics;
