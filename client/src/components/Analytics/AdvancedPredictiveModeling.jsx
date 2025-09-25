import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ComposedChart,
} from "recharts";
import {
  AlertTriangle,
  Map,
  Loader2,
  Info,
  Calendar,
  Droplet,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertOctagon,
  CloudRain,
  Truck,
  Users,
  Zap,
  Sliders,
  Download,
  RefreshCw,
} from "lucide-react";
import { analyticsService } from "../../services/analyticsService";

/**
 * Advanced Predictive Modeling component for flood analytics
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filters applied to analytics
 * @param {Function} props.onOptimizationRequest - Callback for resource optimization
 */
const AdvancedPredictiveModeling = ({ filters, onOptimizationRequest }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [timeframe, setTimeframe] = useState("7d");
  const [modelType, setModelType] = useState("ml");
  const [confidenceInterval, setConfidenceInterval] = useState(95);
  const [showOptimizations, setShowOptimizations] = useState(false);
  const [optimizations, setOptimizations] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");

  // List of available regions to select for prediction
  const regions = useMemo(
    () => [
      {
        state: "Karnataka",
        district: "Bangalore",
        coordinates: { lat: 12.9716, lng: 77.5946 },
      },
      {
        state: "Kerala",
        district: "Kochi",
        coordinates: { lat: 9.9312, lng: 76.2673 },
      },
      {
        state: "Maharashtra",
        district: "Mumbai",
        coordinates: { lat: 19.076, lng: 72.8777 },
      },
      {
        state: "Tamil Nadu",
        district: "Chennai",
        coordinates: { lat: 13.0827, lng: 80.2707 },
      },
      {
        state: "Assam",
        district: "Guwahati",
        coordinates: { lat: 26.1445, lng: 91.7362 },
      },
      {
        state: "Bihar",
        district: "Patna",
        coordinates: { lat: 25.5941, lng: 85.1376 },
      },
      {
        state: "West Bengal",
        district: "Kolkata",
        coordinates: { lat: 22.5726, lng: 88.3639 },
      },
      {
        state: "Uttar Pradesh",
        district: "Varanasi",
        coordinates: { lat: 25.3176, lng: 82.9739 },
      },
    ],
    []
  );

  // List of available prediction models
  const predictionModels = [
    {
      id: "ml",
      name: "Machine Learning (General)",
      description:
        "Uses historical flood data and current conditions for general predictions",
    },
    {
      id: "hydro",
      name: "Hydrological Model",
      description:
        "Physics-based water flow simulation with rainfall and terrain data",
    },
    {
      id: "ensemble",
      name: "Ensemble Model",
      description: "Combines multiple models for higher accuracy predictions",
    },
    {
      id: "temporal",
      name: "Temporal Neural Network",
      description: "Deep learning model analyzing time-series flood patterns",
    },
  ];

  // Fetch prediction data when region, timeframe, model or filters change
  useEffect(() => {
    const fetchPredictions = async () => {
      if (!selectedRegion) {
        // Set default region if none selected
        setSelectedRegion(regions[0]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Add the timeframe and model type to the filters
        const predictionFilters = {
          ...filters,
          timeframe,
          modelType,
          confidenceInterval,
        };

        // In a real app, this would call the API with the selected model type
        const data = await analyticsService.getPredictions(
          selectedRegion,
          predictionFilters
        );
        setPredictionData(data);
      } catch (err) {
        console.error("Failed to fetch prediction data:", err);
        setError("Failed to load prediction data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [
    selectedRegion,
    timeframe,
    filters,
    regions,
    modelType,
    confidenceInterval,
  ]);

  // Request resource optimization based on prediction data
  const handleOptimizeResources = async () => {
    if (!predictionData) return;

    setIsOptimizing(true);

    try {
      // Mock the optimization service call
      // In real implementation, this would call a backend service
      setTimeout(() => {
        // Generate mock optimization results
        const mockOptimizations = {
          resourceAllocation: [
            { type: "Rescue Teams", optimal: 12, current: 8, delta: 4 },
            { type: "Boats", optimal: 25, current: 15, delta: 10 },
            { type: "Medical Kits", optimal: 200, current: 150, delta: 50 },
            {
              type: "Food Supply (kg)",
              optimal: 1500,
              current: 1000,
              delta: 500,
            },
            { type: "Shelters", optimal: 8, current: 5, delta: 3 },
          ],
          evacuationRoutes: [
            {
              id: 1,
              from: "Lower District",
              to: "Evacuation Center A",
              estimatedTime: "45 min",
              capacityPerHour: 120,
            },
            {
              id: 2,
              from: "Riverside Area",
              to: "Evacuation Center B",
              estimatedTime: "30 min",
              capacityPerHour: 90,
            },
            {
              id: 3,
              from: "City Center",
              to: "Evacuation Center C",
              estimatedTime: "60 min",
              capacityPerHour: 150,
            },
          ],
          timeWindow: "48 hours",
          affectedPopulation: 25000,
          estimatedEvacuationTime: "6 hours",
          criticalAreas: [
            {
              name: "Riverside Housing Complex",
              priorityLevel: "Critical",
              population: 5000,
            },
            {
              name: "Downtown Market",
              priorityLevel: "High",
              population: 8000,
            },
            {
              name: "Eastern Suburb",
              priorityLevel: "Medium",
              population: 12000,
            },
          ],
        };

        setOptimizations(mockOptimizations);
        setShowOptimizations(true);
        setIsOptimizing(false);

        // Call the callback if provided
        if (onOptimizationRequest) {
          onOptimizationRequest(mockOptimizations);
        }
      }, 1500);
    } catch (err) {
      console.error("Failed to optimize resources:", err);
      setError("Failed to generate resource optimization plan.");
      setIsOptimizing(false);
    }
  };

  // Export prediction data
  const handleExportData = () => {
    if (!predictionData) return;

    // In a real implementation, this would call an export API
    const filename = `flood-prediction-${selectedRegion.district}-${new Date()
      .toISOString()
      .slice(0, 10)}.${exportFormat}`;
    alert(
      `Exporting prediction data as ${exportFormat.toUpperCase()}. Filename: ${filename}`
    );
  };

  // Generate forecast data
  const forecastData = useMemo(() => {
    if (!predictionData || !predictionData.predictions) return [];

    // In a real implementation, this would use actual forecast data
    // Here we're generating synthetic data based on the prediction

    const timeframes = ["24h", "48h", "72h", "96h", "120h", "144h", "168h"];
    const prediction = predictionData.predictions[0];
    const baseRisk = prediction.probability;

    return timeframes.map((time, index) => {
      // Generate varying probability that trends based on the base risk
      // Add some randomness but maintain the trend
      const daysPassed = index + 1;
      const trendFactor =
        prediction.riskLevel === "high"
          ? 1.1
          : prediction.riskLevel === "medium"
          ? 0.95
          : 0.85;

      // Probability increases or decreases based on risk level
      let probability = baseRisk * Math.pow(trendFactor, daysPassed);

      // Add randomness (±10%)
      probability += Math.random() * 20 - 10;

      // Constrain to 0-100 range
      probability = Math.min(100, Math.max(0, probability));

      // Calculate confidence interval
      const ciRange = ((100 - confidenceInterval) / 100) * probability;
      const lowerBound = Math.max(0, probability - ciRange);
      const upperBound = Math.min(100, probability + ciRange);

      // Calculate water level prediction
      // In a real implementation, this would use actual water level models
      const baseWaterLevel =
        prediction.riskLevel === "high"
          ? 4.5
          : prediction.riskLevel === "medium"
          ? 3.2
          : 2.0;
      const waterLevel =
        baseWaterLevel * Math.pow(trendFactor, daysPassed / 2) +
        (Math.random() * 0.5 - 0.25);

      // Calculate affected area prediction
      const baseAffectedArea =
        prediction.riskLevel === "high"
          ? 25
          : prediction.riskLevel === "medium"
          ? 15
          : 5;
      const affectedArea =
        baseAffectedArea * Math.pow(trendFactor, daysPassed / 3) +
        (Math.random() * 5 - 2.5);

      return {
        timeframe: time,
        probability: Math.round(probability),
        waterLevel: parseFloat(waterLevel.toFixed(2)),
        affectedArea: Math.round(affectedArea),
        lowerBound: Math.round(lowerBound),
        upperBound: Math.round(upperBound),
      };
    });
  }, [predictionData, confidenceInterval]);

  // Get risk level color
  const getRiskColor = (risk) => {
    if (risk >= 75) return "#ef4444"; // Red for high risk
    if (risk >= 50) return "#f97316"; // Orange for medium-high risk
    if (risk >= 30) return "#facc15"; // Yellow for medium risk
    if (risk >= 15) return "#84cc16"; // Light green for low-medium risk
    return "#22c55e"; // Green for low risk
  };

  // Apply risk colors to forecast data
  const forecastWithColors = useMemo(() => {
    return forecastData.map((item) => ({
      ...item,
      riskColor: getRiskColor(item.probability),
    }));
  }, [forecastData]);

  // Custom tooltip for forecast chart
  const ForecastTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="text-sm font-medium">Forecast: {data.timeframe}</p>
          <p className="text-sm text-gray-700">
            Probability:{" "}
            <span className="font-medium">{data.probability}%</span>
          </p>
          <p className="text-sm text-gray-700">
            Water Level: <span className="font-medium">{data.waterLevel}m</span>
          </p>
          <p className="text-sm text-gray-700">
            Affected Area:{" "}
            <span className="font-medium">{data.affectedArea} km²</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {confidenceInterval}% CI: [{data.lowerBound}% - {data.upperBound}%]
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center">
          <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
          Advanced Flood Risk Prediction
        </h3>
        <div className="mt-2 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={handleExportData}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded text-sm font-medium flex items-center"
            disabled={loading || !predictionData}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="text-sm border border-gray-300 rounded py-1.5 px-2"
            disabled={loading || !predictionData}
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex flex-col">
              <label
                htmlFor="region-select"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                <Map className="inline mr-1 h-4 w-4" /> Region
              </label>
              <select
                id="region-select"
                value={`${selectedRegion?.state}-${selectedRegion?.district}`}
                onChange={(e) => {
                  const [state, district] = e.target.value.split("-");
                  const region = regions.find(
                    (r) => r.state === state && r.district === district
                  );
                  setSelectedRegion(region);
                }}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                {regions.map((region) => (
                  <option
                    key={`${region.state}-${region.district}`}
                    value={`${region.state}-${region.district}`}
                  >
                    {region.district}, {region.state}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="timeframe-select"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                <Calendar className="inline mr-1 h-4 w-4" /> Timeframe
              </label>
              <select
                id="timeframe-select"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="1d">24 Hours</option>
                <option value="3d">3 Days</option>
                <option value="7d">7 Days</option>
                <option value="14d">14 Days</option>
                <option value="30d">30 Days</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="model-select"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                <Sliders className="inline mr-1 h-4 w-4" /> Model Type
              </label>
              <select
                id="model-select"
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                {predictionModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="confidence-select"
                className="text-sm font-medium text-gray-700 mb-1"
              >
                <CheckCircle className="inline mr-1 h-4 w-4" /> Confidence
              </label>
              <select
                id="confidence-select"
                value={confidenceInterval}
                onChange={(e) => setConfidenceInterval(Number(e.target.value))}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="99">99%</option>
                <option value="95">95%</option>
                <option value="90">90%</option>
                <option value="80">80%</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <h4 className="text-sm font-medium text-blue-800 flex items-center mb-2">
            <Info className="h-4 w-4 mr-1" /> Model Information
          </h4>
          <p className="text-xs text-blue-700 mb-2">
            {predictionModels.find((m) => m.id === modelType)?.description}
          </p>
          <div className="flex items-center mt-2 text-xs text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Last updated:{" "}
            {predictionData
              ? new Date(
                  predictionData.updatedAt || Date.now()
                ).toLocaleString()
              : "Loading..."}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading prediction data...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 text-red-500">
          <AlertTriangle className="h-6 w-6 mr-2" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {predictionData?.predictions &&
            predictionData.predictions.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="bg-white p-3 rounded-lg shadow-sm flex items-start md:w-1/3 mb-3 md:mb-0 md:mr-4">
                    <div
                      className={`p-2 rounded-md ${
                        predictionData.predictions[0].riskLevel === "high"
                          ? "bg-red-100"
                          : predictionData.predictions[0].riskLevel === "medium"
                          ? "bg-orange-100"
                          : "bg-yellow-100"
                      }`}
                    >
                      <AlertOctagon
                        className={`h-6 w-6 ${
                          predictionData.predictions[0].riskLevel === "high"
                            ? "text-red-500"
                            : predictionData.predictions[0].riskLevel ===
                              "medium"
                            ? "text-orange-500"
                            : "text-yellow-500"
                        }`}
                      />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium">
                        {predictionData.predictions[0].location.district},{" "}
                        {predictionData.predictions[0].location.state}
                      </h4>
                      <p className="text-sm text-gray-600">
                        <span
                          className={`font-semibold ${
                            predictionData.predictions[0].riskLevel === "high"
                              ? "text-red-600"
                              : predictionData.predictions[0].riskLevel ===
                                "medium"
                              ? "text-orange-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {predictionData.predictions[0].riskLevel.toUpperCase()}{" "}
                          RISK
                        </span>{" "}
                        - {predictionData.predictions[0].probability}%
                        probability
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Within next {predictionData.predictions[0].timeframe}
                      </div>
                    </div>
                  </div>

                  <div className="md:w-2/3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 h-full">
                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">
                          Est. Water Level Rise
                        </div>
                        <div className="flex items-center">
                          <Droplet className="h-4 w-4 text-blue-500 mr-2" />
                          <span className="text-lg font-semibold">
                            {(
                              predictionData.predictions[0].probability / 20 +
                              1
                            ).toFixed(1)}
                            m
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">
                          Population at Risk
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-purple-500 mr-2" />
                          <span className="text-lg font-semibold">
                            {(
                              predictionData.predictions[0].probability * 500
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded shadow-sm">
                        <div className="text-xs text-gray-500 mb-1">
                          Infrastructure Impact
                        </div>
                        <div className="flex items-center">
                          <Zap className="h-4 w-4 text-amber-500 mr-2" />
                          <span className="text-lg font-semibold">
                            {predictionData.predictions[0].probability > 75
                              ? "Severe"
                              : predictionData.predictions[0].probability > 50
                              ? "Moderate"
                              : "Limited"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Contributing Factors:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {predictionData.predictions[0].factors.map(
                      (factor, idx) => (
                        <span
                          key={idx}
                          className="bg-white text-xs px-2 py-1 rounded-full border border-gray-200 text-gray-700"
                        >
                          {factor}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Forecast Chart */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              7-Day Forecast Projection
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg p-3 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastWithColors}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="timeframe" />
                  <YAxis yAxisId="probability" domain={[0, 100]} />
                  <YAxis
                    yAxisId="waterLevel"
                    orientation="right"
                    domain={[0, 10]}
                  />
                  <Tooltip content={<ForecastTooltip />} />
                  <Legend />
                  {/* Confidence interval area */}
                  <Area
                    yAxisId="probability"
                    dataKey="upperBound"
                    stroke="transparent"
                    fill="#8884d822"
                    activeDot={false}
                  />
                  <Area
                    yAxisId="probability"
                    dataKey="lowerBound"
                    stroke="transparent"
                    fill="#8884d822"
                    activeDot={false}
                  />
                  {/* Main probability line */}
                  <Line
                    yAxisId="probability"
                    type="monotone"
                    dataKey="probability"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={({ payload }) => (
                      <circle r={4} cx={0} cy={0} fill={payload.riskColor} />
                    )}
                    activeDot={({ payload }) => (
                      <circle
                        r={6}
                        cx={0}
                        cy={0}
                        fill={payload.riskColor}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    )}
                    name="Flood Probability %"
                  />
                  {/* Water level line */}
                  <Line
                    yAxisId="waterLevel"
                    type="monotone"
                    dataKey="waterLevel"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Water Level (m)"
                  />
                  {/* Affected area bars */}
                  <Bar
                    yAxisId="probability"
                    dataKey="affectedArea"
                    barSize={20}
                    fill="#ffc658"
                    opacity={0.6}
                    name="Affected Area (km²)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resource Optimization Section */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-medium text-gray-800">
                Resource Optimization
              </h4>

              <button
                onClick={handleOptimizeResources}
                disabled={isOptimizing || !predictionData}
                className={`px-3 py-1 rounded text-sm font-medium flex items-center ${
                  isOptimizing || !predictionData
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isOptimizing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4 mr-1" />
                    Optimize Resources
                  </>
                )}
              </button>
            </div>

            {showOptimizations && optimizations && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-blue-50 border-b border-gray-200">
                  <h5 className="font-medium text-sm mb-1">
                    Resource Allocation Plan
                  </h5>
                  <p className="text-xs text-gray-600">
                    Optimal resource distribution based on predicted flood
                    impact for {selectedRegion?.district},{" "}
                    {selectedRegion?.state}
                  </p>
                </div>

                <div className="p-4">
                  <div className="mb-4">
                    <h6 className="text-xs font-medium text-gray-700 mb-2">
                      Required Resources
                    </h6>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Resource
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Optimal
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Current
                            </th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Delta
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {optimizations.resourceAllocation.map(
                            (resource, idx) => (
                              <tr key={idx}>
                                <td className="px-3 py-2 text-sm">
                                  {resource.type}
                                </td>
                                <td className="px-3 py-2 text-sm text-right font-medium">
                                  {resource.optimal}
                                </td>
                                <td className="px-3 py-2 text-sm text-right">
                                  {resource.current}
                                </td>
                                <td
                                  className={`px-3 py-2 text-sm text-right font-medium ${
                                    resource.delta > 0
                                      ? "text-red-600"
                                      : resource.delta < 0
                                      ? "text-green-600"
                                      : "text-gray-600"
                                  }`}
                                >
                                  {resource.delta > 0
                                    ? `+${resource.delta}`
                                    : resource.delta}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h6 className="text-xs font-medium text-gray-700 mb-2">
                        Critical Areas
                      </h6>
                      <div className="overflow-y-auto max-h-40">
                        {optimizations.criticalAreas.map((area, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <p className="text-sm font-medium">{area.name}</p>
                              <p className="text-xs text-gray-600">
                                Population: {area.population.toLocaleString()}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                area.priorityLevel === "Critical"
                                  ? "bg-red-100 text-red-800"
                                  : area.priorityLevel === "High"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {area.priorityLevel}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h6 className="text-xs font-medium text-gray-700 mb-2">
                        Evacuation Routes
                      </h6>
                      <div className="overflow-y-auto max-h-40">
                        {optimizations.evacuationRoutes.map((route, idx) => (
                          <div
                            key={idx}
                            className="flex items-center mb-2 p-2 bg-gray-50 rounded"
                          >
                            <div className="flex-grow">
                              <p className="text-sm font-medium">
                                Route {route.id}: {route.from} → {route.to}
                              </p>
                              <div className="flex items-center justify-between text-xs text-gray-600">
                                <span>Est. Time: {route.estimatedTime}</span>
                                <span>
                                  Capacity: {route.capacityPerHour}/hr
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          Evacuation Recommendations
                        </p>
                        <p className="text-xs text-yellow-700">
                          Estimated{" "}
                          {optimizations.affectedPopulation.toLocaleString()}{" "}
                          people affected. Complete evacuation will require
                          approximately {optimizations.estimatedEvacuationTime}.
                          Critical response window: next{" "}
                          {optimizations.timeWindow}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
            <div className="flex items-center">
              <RefreshCw className="h-3 w-3 mr-1" />
              Prediction updates every 30 minutes
            </div>
            <div>
              Model:{" "}
              <span className="font-medium">
                {predictionModels.find((m) => m.id === modelType)?.name}
              </span>{" "}
              | Confidence:{" "}
              <span className="font-medium">{confidenceInterval}%</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdvancedPredictiveModeling;
