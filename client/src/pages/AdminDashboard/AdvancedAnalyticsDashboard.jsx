import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  LineChart,
  AlertTriangle,
  Truck,
  UserCheck,
  Droplet,
  Layers,
  TrendingUp,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
  RefreshCcw,
  Download,
  HelpCircle,
  Map,
} from "lucide-react";
import { analyticsService } from "../../services/analyticsService";
import AdvancedPredictiveModeling from "../../components/Analytics/AdvancedPredictiveModeling";

// Mock data for charts until backend is implemented
const mockPredictionData = {
  regions: [
    "North Region",
    "South Region",
    "East Region",
    "West Region",
    "Central",
  ],
  currentMonth: [65, 45, 30, 55, 40],
  nextMonth: [75, 60, 45, 65, 50],
  threeMonths: [80, 70, 60, 75, 65],
};

const mockResourceData = {
  categories: [
    "Rescue Boats",
    "Medical Kits",
    "Food Supplies",
    "Shelter Kits",
    "Water Pumps",
  ],
  current: [80, 65, 50, 70, 40],
  recommended: [90, 80, 70, 85, 75],
};

const AdvancedAnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState("predictive");
  const [selectedTimeframe, setSelectedTimeframe] = useState("month");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [riskThreshold, setRiskThreshold] = useState(65); // Default risk threshold

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-analytics", selectedTimeframe, selectedRegion],
    queryFn: () =>
      analyticsService.getAdvancedAnalytics(selectedTimeframe, selectedRegion),
    // Use mock data until backend implementation
    placeholderData: {
      predictiveAnalysis: {
        floodRiskIndex: 72,
        riskTrend: "increasing",
        historicalComparison: "+15%",
        affectedRegions: 3,
        predictionConfidence: 85,
      },
      resourceOptimization: {
        currentEfficiency: 68,
        recommendedAdjustments: 5,
        potentialSavings: "18%",
        criticalShortages: 2,
      },
      recentIncidents: [
        {
          id: 1,
          location: "North District",
          severity: "high",
          reports: 23,
          timestamp: "2025-09-20T08:30:00Z",
        },
        {
          id: 2,
          location: "Central Area",
          severity: "medium",
          reports: 12,
          timestamp: "2025-09-21T14:15:00Z",
        },
        {
          id: 3,
          location: "East Zone",
          severity: "critical",
          reports: 45,
          timestamp: "2025-09-23T10:45:00Z",
        },
        {
          id: 4,
          location: "South Region",
          severity: "low",
          reports: 8,
          timestamp: "2025-09-24T16:20:00Z",
        },
      ],
    },
  });

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Risk level indicator
  const RiskIndicator = ({ value }) => {
    let color, label;

    if (value >= 80) {
      color = "bg-red-500";
      label = "Critical Risk";
    } else if (value >= 60) {
      color = "bg-orange-500";
      label = "High Risk";
    } else if (value >= 40) {
      color = "bg-yellow-500";
      label = "Moderate Risk";
    } else {
      color = "bg-green-500";
      label = "Low Risk";
    }

    return (
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full ${color}`}
            style={{ width: `${value}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs">
          <span>0</span>
          <span className={`font-medium ${color.replace("bg-", "text-")}`}>
            {label}: {value}%
          </span>
          <span>100</span>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
        <p>Error loading analytics data. Please try again later.</p>
        <button
          onClick={() => refetch()}
          className="mt-2 flex items-center text-sm font-medium text-red-700"
        >
          <RefreshCcw className="w-4 h-4 mr-1" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Advanced Analytics Dashboard
              </h1>
              <p className="text-gray-500 mt-1">
                Predictive modeling and resource optimization for flood
                management
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <div className="bg-blue-50 p-2 rounded-md flex items-center">
                <select
                  className="text-sm text-blue-800 bg-transparent border-none focus:ring-0"
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                >
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                  <option value="quarter">Last 90 days</option>
                  <option value="year">Last 365 days</option>
                </select>
              </div>
              <div className="bg-blue-50 p-2 rounded-md flex items-center">
                <select
                  className="text-sm text-blue-800 bg-transparent border-none focus:ring-0"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  <option value="all">All Regions</option>
                  <option value="north">North Region</option>
                  <option value="south">South Region</option>
                  <option value="east">East Region</option>
                  <option value="west">West Region</option>
                  <option value="central">Central Region</option>
                </select>
              </div>
              <button
                onClick={() => refetch()}
                className="text-gray-500 hover:text-gray-700"
                title="Refresh Data"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  analyticsService
                    .exportData("json", {
                      timeframe: selectedTimeframe,
                      region: selectedRegion,
                      riskThreshold: riskThreshold,
                    })
                    .then((data) => {
                      console.log("Exported data:", data);
                      alert(
                        `Data exported successfully. ${
                          data.count || ""
                        } records exported.`
                      );
                    });
                }}
                className="text-gray-500 hover:text-gray-700"
                title="Export Data"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "predictive"
                  ? "border-b-2 border-primary-600 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("predictive")}
            >
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" /> Predictive Analysis
              </div>
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "resources"
                  ? "border-b-2 border-primary-600 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("resources")}
            >
              <div className="flex items-center">
                <Truck className="w-4 h-4 mr-2" /> Resource Optimization
              </div>
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "incidents"
                  ? "border-b-2 border-primary-600 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("incidents")}
            >
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2" /> Recent Incidents
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Predictive Analysis Tab */}
          {activeTab === "predictive" && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">
                      Flood Risk Index
                    </h3>
                    <div className="p-2 bg-blue-100 rounded">
                      <Droplet className="w-5 h-5 text-blue-700" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {analyticsData.predictiveAnalysis.floodRiskIndex}%
                    </p>
                    <div className="flex items-center mt-1">
                      <span
                        className={`text-sm ${
                          analyticsData.predictiveAnalysis.riskTrend ===
                          "increasing"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {analyticsData.predictiveAnalysis.historicalComparison}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">
                        from last {selectedTimeframe}
                      </span>
                    </div>
                  </div>
                  <RiskIndicator
                    value={analyticsData.predictiveAnalysis.floodRiskIndex}
                  />
                </div>

                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">
                      Affected Regions
                    </h3>
                    <div className="p-2 bg-orange-100 rounded">
                      <MapPin className="w-5 h-5 text-orange-700" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {analyticsData.predictiveAnalysis.affectedRegions}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Regions at risk level above {riskThreshold}%
                    </p>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Risk threshold
                      </div>
                      <div className="text-xs font-medium">
                        {riskThreshold}%
                      </div>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="90"
                      value={riskThreshold}
                      onChange={(e) => setRiskThreshold(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">
                      Prediction Confidence
                    </h3>
                    <div className="p-2 bg-green-100 rounded">
                      <Layers className="w-5 h-5 text-green-700" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {analyticsData.predictiveAnalysis.predictionConfidence}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on historical and realtime data
                    </p>
                  </div>
                  <div className="mt-3">
                    <div className="bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-500 h-1.5 rounded-full"
                        style={{
                          width: `${analyticsData.predictiveAnalysis.predictionConfidence}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Confidence level</span>
                      <span className="font-medium text-green-600">
                        {analyticsData.predictiveAnalysis.predictionConfidence}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">
                      Risk Forecast
                    </h3>
                    <div className="p-2 bg-purple-100 rounded">
                      <Calendar className="w-5 h-5 text-purple-700" />
                    </div>
                  </div>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Current Month</span>
                      <div className="flex items-center">
                        <span className="text-lg font-semibold">65%</span>
                        <div className="ml-1 w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Next Month</span>
                      <div className="flex items-center">
                        <span className="text-lg font-semibold">75%</span>
                        <div className="ml-1 w-2 h-2 rounded-full bg-orange-500"></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">3 Months</span>
                      <div className="flex items-center">
                        <span className="text-lg font-semibold">55%</span>
                        <div className="ml-1 w-2 h-2 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Advanced Predictive Modeling Component */}
              <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center">
                    <Map className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-gray-800">
                      Advanced Predictive Modeling
                    </h3>
                  </div>
                </div>
                <div className="p-0">
                  <AdvancedPredictiveModeling
                    filters={{
                      timeRange: selectedTimeframe,
                      region: selectedRegion,
                      riskThreshold: riskThreshold,
                    }}
                    onOptimizationRequest={(data) => {
                      // We could handle this in the future
                      console.log("Optimization requested", data);
                    }}
                  />
                </div>
              </div>

              {/* Predictive Analysis Chart */}
              <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium text-gray-800">
                    Region-wise Flood Risk Prediction
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                      <span className="text-xs text-gray-600">Current</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
                      <span className="text-xs text-gray-600">Next Month</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-xs text-gray-600">3 Months</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 h-80 flex items-center justify-center">
                  {/* This is where the actual chart would be rendered */}
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="space-y-6 w-full">
                      {mockPredictionData.regions.map((region, index) => (
                        <div key={region} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {region}
                            </span>
                            <span className="text-sm text-gray-500">
                              Current: {mockPredictionData.currentMonth[index]}%
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <div
                              className="h-6 bg-blue-500 rounded-l"
                              style={{
                                width: `${mockPredictionData.currentMonth[index]}%`,
                              }}
                            ></div>
                            <div
                              className="h-6 bg-orange-500"
                              style={{
                                width: `${
                                  mockPredictionData.nextMonth[index] -
                                  mockPredictionData.currentMonth[index]
                                }%`,
                              }}
                            ></div>
                            <div
                              className="h-6 bg-green-500 rounded-r"
                              style={{
                                width: `${
                                  mockPredictionData.threeMonths[index] -
                                  mockPredictionData.nextMonth[index]
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    <span>
                      Prediction based on historical data, weather forecasts,
                      and infrastructure assessment
                    </span>
                  </div>
                </div>
              </div>

              {/* Preventive Actions */}
              <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800">
                    Recommended Preventive Actions
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-orange-600 mr-3 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-orange-800">
                            High Risk Alert: North District
                          </h4>
                          <p className="text-sm text-orange-700 mt-1">
                            Predictive models indicate 78% chance of severe
                            flooding in the next 14 days. Consider deploying
                            additional rescue teams and pre-positioning
                            emergency supplies.
                          </p>
                          <div className="mt-3 flex items-center">
                            <button className="text-sm text-orange-800 font-medium bg-white border border-orange-300 rounded-md px-3 py-1 hover:bg-orange-50">
                              View Details
                            </button>
                            <button className="ml-3 text-sm text-orange-800 font-medium bg-white border border-orange-300 rounded-md px-3 py-1 hover:bg-orange-50">
                              Take Action
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">
                            Medium Risk Alert: East Zone
                          </h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            Increasing water levels detected in upstream areas.
                            Consider issuing early warnings to residents and
                            activating monitoring stations.
                          </p>
                          <div className="mt-3 flex items-center">
                            <button className="text-sm text-yellow-800 font-medium bg-white border border-yellow-300 rounded-md px-3 py-1 hover:bg-yellow-50">
                              View Details
                            </button>
                            <button className="ml-3 text-sm text-yellow-800 font-medium bg-white border border-yellow-300 rounded-md px-3 py-1 hover:bg-yellow-50">
                              Take Action
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-800">
                            Infrastructure Alert: Central Region
                          </h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Drainage systems operating at reduced efficiency
                            (67%). Schedule maintenance to clear blockages
                            before the upcoming rainfall period.
                          </p>
                          <div className="mt-3 flex items-center">
                            <button className="text-sm text-blue-800 font-medium bg-white border border-blue-300 rounded-md px-3 py-1 hover:bg-blue-50">
                              View Details
                            </button>
                            <button className="ml-3 text-sm text-blue-800 font-medium bg-white border border-blue-300 rounded-md px-3 py-1 hover:bg-blue-50">
                              Schedule Maintenance
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resource Optimization Tab */}
          {activeTab === "resources" && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">
                      Resource Efficiency
                    </h3>
                    <div className="p-2 bg-green-100 rounded">
                      <Layers className="w-5 h-5 text-green-700" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {analyticsData.resourceOptimization.currentEfficiency}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Current resource utilization rate
                    </p>
                  </div>
                  <RiskIndicator
                    value={analyticsData.resourceOptimization.currentEfficiency}
                  />
                </div>

                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">
                      Recommended Adjustments
                    </h3>
                    <div className="p-2 bg-blue-100 rounded">
                      <RefreshCcw className="w-5 h-5 text-blue-700" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {
                        analyticsData.resourceOptimization
                          .recommendedAdjustments
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Suggested resource reallocation actions
                    </p>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        analyticsService
                          .getOptimizedResourceAllocation({
                            region: selectedRegion,
                            riskThreshold: riskThreshold,
                          })
                          .then((data) => {
                            console.log("Optimization data:", data);
                            // In a real app, we would update state with this data
                            alert(
                              "Resource optimization recommendations generated."
                            );
                          });
                      }}
                      className="w-full py-1 px-2 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200"
                    >
                      View Recommendations
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">
                      Potential Savings
                    </h3>
                    <div className="p-2 bg-purple-100 rounded">
                      <TrendingUp className="w-5 h-5 text-purple-700" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {analyticsData.resourceOptimization.potentialSavings}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Projected operational cost savings
                    </p>
                  </div>
                  <div className="mt-3">
                    <div className="bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-purple-500 h-1.5 rounded-full"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Current budget</span>
                      <span className="font-medium text-purple-600">
                        Optimized
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">
                      Critical Shortages
                    </h3>
                    <div className="p-2 bg-red-100 rounded">
                      <AlertTriangle className="w-5 h-5 text-red-700" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-3xl font-bold text-gray-900">
                      {analyticsData.resourceOptimization.criticalShortages}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Resources below critical threshold
                    </p>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        // In a real app, we'd fetch critical shortage data from analytics service
                        analyticsService
                          .getHistoricalData(1, selectedRegion)
                          .then((data) => {
                            console.log("Historical data for shortages:", data);
                            alert("Retrieving critical shortage data...");
                          });
                      }}
                      className="w-full py-1 px-2 bg-red-50 text-red-700 text-xs font-medium rounded border border-red-200"
                    >
                      Address Critical Shortages
                    </button>
                  </div>
                </div>
              </div>

              {/* Resource Optimization Chart */}
              <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-medium text-gray-800">
                    Resource Allocation vs. Recommended
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                      <span className="text-xs text-gray-600">Current</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-xs text-gray-600">Recommended</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 h-80 flex items-center justify-center">
                  {/* This is where the actual chart would be rendered */}
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="space-y-6 w-full">
                      {mockResourceData.categories.map((category, index) => (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {category}
                            </span>
                            <span className="text-sm text-gray-500">
                              Current: {mockResourceData.current[index]}% |
                              Recommended: {mockResourceData.recommended[index]}
                              %
                            </span>
                          </div>
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-6 text-xs flex rounded bg-gray-200">
                              <div
                                style={{
                                  width: `${mockResourceData.current[index]}%`,
                                }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                              ></div>
                            </div>
                            <div className="overflow-hidden h-2 mt-1 flex rounded">
                              <div
                                style={{
                                  width: `${mockResourceData.recommended[index]}%`,
                                }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 rounded"
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    <span>
                      Recommendations based on historical usage patterns and
                      predicted emergency needs
                    </span>
                  </div>
                </div>
              </div>

              {/* Resource Allocation Table */}
              <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800">
                    Resource Allocation by Region
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Region
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Current Allocation
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Recommended
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Risk Level
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Adjustment
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            North Region
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            15 Teams, 8 Vehicles
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            20 Teams, 12 Vehicles
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            High
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="text-red-600">
                            +5 Teams, +4 Vehicles
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            South Region
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            18 Teams, 10 Vehicles
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            15 Teams, 8 Vehicles
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Medium
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="text-green-600">
                            -3 Teams, -2 Vehicles
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            East Zone
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            12 Teams, 6 Vehicles
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            16 Teams, 8 Vehicles
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                            High
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="text-red-600">
                            +4 Teams, +2 Vehicles
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            West Zone
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            20 Teams, 12 Vehicles
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            18 Teams, 10 Vehicles
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Low
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="text-green-600">
                            -2 Teams, -2 Vehicles
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Central Region
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            10 Teams, 5 Vehicles
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            12 Teams, 7 Vehicles
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Medium
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="text-red-600">
                            +2 Teams, +2 Vehicles
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                    Apply Recommendations
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Recent Incidents Tab */}
          {activeTab === "incidents" && (
            <div className="space-y-6">
              <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800">
                    Recent Flood Incidents
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Location
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Severity
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Reports
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Timestamp
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analyticsData.recentIncidents.map((incident) => (
                        <tr key={incident.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                              <div className="text-sm font-medium text-gray-900">
                                {incident.location}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityColor(
                                incident.severity
                              )}`}
                            >
                              {incident.severity.charAt(0).toUpperCase() +
                                incident.severity.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {incident.reports}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(incident.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <a
                              href="#"
                              className="text-primary-600 hover:text-primary-900 mr-3"
                            >
                              View
                            </a>
                            <a
                              href="#"
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Respond
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Incident Map */}
              <div className="bg-white border rounded-lg shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800">Incident Map</h3>
                </div>
                <div className="h-96 bg-gray-100 flex items-center justify-center">
                  {/* This would be replaced with an actual map component */}
                  <div className="text-center">
                    <MapPin className="w-10 h-10 text-gray-400 mx-auto" />
                    <p className="mt-2 text-gray-500">
                      Interactive incident map would be displayed here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
