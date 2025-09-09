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

  const chartData = data?.reportsByDay || [];
  const pieData = data?.reportsBySeverity || [];
  const predictionData = data?.alertTrends || [];
  const renderLineChart = (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="reports" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="alerts" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderBarChart = (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="reports" fill="#8884d8" />
        <Bar dataKey="alerts" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pieData}
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
          {pieData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderPredictionChart = (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={predictionData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="predictedLevel"
          stroke="#ffc658"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-6 text-white flex items-center justify-between">
        <div className="flex items-center mb-2">
          <BarChart className="w-8 h-8 mr-3" />
          <h1 className="text-3xl font-bold">Flood Analytics & Predictions</h1>
        </div>
        <div className="text-right">
          <span className="text-sm">Insights into flood trends</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800">Total Reports</h3>
          <p className="text-3xl font-bold text-blue-600">
            {data?.stats?.totalReports}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Verified Reports
          </h3>
          <p className="text-3xl font-bold text-green-600">
            {data?.stats?.verifiedReports}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Active Alerts
          </h3>
          <p className="text-3xl font-bold text-red-600">
            {data?.stats?.activeAlerts}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Average Response Time (min)
          </h3>
          <p className="text-3xl font-bold text-purple-600">
            {data?.stats?.avgResponseTime}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Reports & Alerts Trend
        </h2>
        <div className="flex justify-center mb-4 space-x-2">
          <button
            onClick={() => setChartType("line")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              chartType === "line"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Line Chart
          </button>
          <button
            onClick={() => setChartType("bar")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              chartType === "bar"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setChartType("pie")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              chartType === "pie"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Pie Chart
          </button>
        </div>
        {chartType === "line" && renderLineChart}
        {chartType === "bar" && renderBarChart}
        {chartType === "pie" && renderPieChart}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Flood Prediction for Next 7 Days
        </h2>
        {renderPredictionChart}
      </div>
    </div>
  );
};

export default Analytics;
