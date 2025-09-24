import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { AlertTriangle, Map, Loader2, Info, Calendar } from "lucide-react";
import { analyticsService } from "../../services/analyticsService";

/**
 * Component for visualizing predictive analytics
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filters applied to analytics
 */
const PredictiveAnalytics = ({ filters }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [predictiveData, setPredictiveData] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [timeframe, setTimeframe] = useState("7d");

  // List of available regions to select for prediction
  const regions = useMemo(
    () => [
      { state: "Karnataka", district: "Bangalore" },
      { state: "Kerala", district: "Kochi" },
      { state: "Maharashtra", district: "Mumbai" },
      { state: "Tamil Nadu", district: "Chennai" },
      { state: "Assam", district: "Guwahati" },
    ],
    []
  );

  // Fetch prediction data when region, timeframe or filters change
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
        // Add the timeframe to the filters
        const predictionFilters = {
          ...filters,
          timeframe,
        };

        const data = await analyticsService.getPredictions(
          selectedRegion,
          predictionFilters
        );
        setPredictiveData(data);
      } catch (err) {
        console.error("Failed to fetch prediction data:", err);
        setError("Failed to load prediction data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [selectedRegion, timeframe, filters, regions]);

  // Generate heatmap data for visualization
  const heatmapData = useMemo(() => {
    if (!predictiveData || !predictiveData.predictions) return [];

    // Generate a grid of points with risk probabilities
    const generateHeatmapGrid = () => {
      const grid = [];
      const gridSize = 10; // 10x10 grid
      const prediction = predictiveData.predictions[0];

      // Base risk value from prediction
      const baseRisk = prediction?.probability || 50;

      // Create grid points with varying risk based on location
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          // Calculate distance from center to create a hotspot
          const centerX = gridSize / 2;
          const centerY = gridSize / 2;
          const distance = Math.sqrt(
            Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
          );

          // Risk decreases with distance from center
          const distanceFactor = 1 - distance / (gridSize / 1.5);
          const riskFactor = Math.max(0, distanceFactor);

          // Add some randomness
          const randomFactor = 0.85 + Math.random() * 0.3;

          // Calculate final risk
          let risk = baseRisk * riskFactor * randomFactor;

          // Ensure risk stays in valid range (0-100)
          risk = Math.min(100, Math.max(0, risk));
          risk = Math.round(risk);

          // Size correlates with risk
          const size = risk / 10;

          grid.push({
            x,
            y,
            risk,
            size,
          });
        }
      }

      return grid;
    };

    return generateHeatmapGrid();
  }, [predictiveData]);

  // Get risk level color
  const getRiskColor = (risk) => {
    if (risk >= 75) return "#ef4444"; // Red for high risk
    if (risk >= 50) return "#f97316"; // Orange for medium-high risk
    if (risk >= 30) return "#facc15"; // Yellow for medium risk
    if (risk >= 15) return "#84cc16"; // Light green for low-medium risk
    return "#22c55e"; // Green for low risk
  };

  // Generate legend items for risk levels
  const riskLegendItems = [
    { name: "High Risk (75-100%)", color: "#ef4444" },
    { name: "Medium-High Risk (50-74%)", color: "#f97316" },
    { name: "Medium Risk (30-49%)", color: "#facc15" },
    { name: "Low-Medium Risk (15-29%)", color: "#84cc16" },
    { name: "Low Risk (0-14%)", color: "#22c55e" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-4">Flood Risk Prediction</h3>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex flex-col">
          <label
            htmlFor="region-select"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            <Map className="inline mr-1 h-4 w-4" /> Select Region
          </label>
          <select
            id="region-select"
            value={`${selectedRegion?.state}-${selectedRegion?.district}`}
            onChange={(e) => {
              const [state, district] = e.target.value.split("-");
              setSelectedRegion({ state, district });
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
            <Calendar className="inline mr-1 h-4 w-4" /> Prediction Timeframe
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
          {predictiveData?.predictions &&
            predictiveData.predictions.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-md">
                    <AlertTriangle
                      className={`h-6 w-6 ${
                        predictiveData.predictions[0].riskLevel === "high"
                          ? "text-red-500"
                          : predictiveData.predictions[0].riskLevel === "medium"
                          ? "text-orange-500"
                          : "text-yellow-500"
                      }`}
                    />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">
                      {predictiveData.predictions[0].location.district},{" "}
                      {predictiveData.predictions[0].location.state}
                    </h4>
                    <p className="text-sm text-gray-600">
                      <span
                        className={`font-semibold ${
                          predictiveData.predictions[0].riskLevel === "high"
                            ? "text-red-600"
                            : predictiveData.predictions[0].riskLevel ===
                              "medium"
                            ? "text-orange-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {predictiveData.predictions[0].riskLevel.toUpperCase()}{" "}
                        RISK
                      </span>{" "}
                      -{predictiveData.predictions[0].probability}% probability
                      within next {predictiveData.predictions[0].timeframe}
                    </p>

                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700">
                        Contributing Factors:
                      </p>
                      <ul className="text-xs text-gray-600 list-disc pl-4 mt-1">
                        {predictiveData.predictions[0].factors.map(
                          (factor, idx) => (
                            <li key={idx}>{factor}</li>
                          )
                        )}
                      </ul>
                    </div>

                    {predictiveData.predictions[0].recommendedActions && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700">
                          Recommended Actions:
                        </p>
                        <ul className="text-xs text-gray-600 list-disc pl-4 mt-1">
                          {predictiveData.predictions[0].recommendedActions.map(
                            (action, idx) => (
                              <li key={idx}>{action}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          <div className="mb-2">
            <h4 className="font-medium text-sm">Risk Heatmap</h4>
            <p className="text-xs text-gray-500">
              Visualization of flood risk probability across the region
            </p>
          </div>

          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 10,
                  right: 30,
                  bottom: 10,
                  left: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  type="number"
                  dataKey="x"
                  domain={[0, 10]}
                  tick={false}
                  axisLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  domain={[0, 10]}
                  tick={false}
                  axisLine={false}
                />
                <ZAxis type="number" dataKey="size" range={[4, 20]} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "risk") {
                      return [`${value}%`, "Risk Level"];
                    }
                    return [value, name];
                  }}
                />
                <Scatter name="Risk Level" data={heatmapData} fill="#8884d8">
                  {heatmapData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getRiskColor(entry.risk)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>

            {/* Risk level legend overlay */}
            <div className="absolute bottom-1 right-1 bg-white/80 p-1 rounded shadow-sm text-xs">
              <div className="flex flex-col">
                {riskLegendItems.map((item) => (
                  <div key={item.name} className="flex items-center mb-0.5">
                    <div
                      className="w-3 h-3 mr-1 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            Last updated:{" "}
            {new Date(predictiveData?.updatedAt || Date.now()).toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
};

export default PredictiveAnalytics;
