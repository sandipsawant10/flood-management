import axios from "axios";
import PredictiveAnalyticsProvider from "./PredictiveAnalyticsProvider";

const API_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api";

// Initialize the predictive analytics provider
const predictiveProvider = new PredictiveAnalyticsProvider();

// Helper function to build query string from filters
const buildQueryString = (filters) => {
  if (!filters) return "";

  const queryParts = [];

  // Add time range filters
  if (filters.timeRange) {
    queryParts.push(`timeRange=${filters.timeRange}`);
  }

  // Add custom date range if present
  if (filters.dateStart && filters.dateEnd) {
    queryParts.push(`startDate=${filters.dateStart}`);
    queryParts.push(`endDate=${filters.dateEnd}`);
  }

  // Add severity filters
  if (filters.severity && filters.severity.length) {
    queryParts.push(`severity=${filters.severity.join(",")}`);
  }

  // Add location filters
  if (filters.locations && filters.locations.length) {
    queryParts.push(`locations=${filters.locations.join(",")}`);
  }

  // Add report type filter
  if (filters.reportType && filters.reportType !== "all") {
    queryParts.push(`reportType=${filters.reportType}`);
  }

  // Add verification status filter
  if (filters.verificationStatus && filters.verificationStatus !== "all") {
    queryParts.push(`verificationStatus=${filters.verificationStatus}`);
  }

  // Add reported by filter
  if (filters.reportedBy) {
    queryParts.push(`reportedBy=${filters.reportedBy}`);
  }

  // Add additional filters
  if (filters.additionalFilters) {
    Object.entries(filters.additionalFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParts.push(`${key}=${encodeURIComponent(value)}`);
      }
    });
  }

  return queryParts.length ? `?${queryParts.join("&")}` : "";
};

export const analyticsService = {
  /**
   * Get analytics data with advanced filtering
   * @param {Object} filters - Filter parameters
   * @param {string} filters.timeRange - Time range (e.g., '7d', '30d', '90d', '1y')
   * @param {string} filters.dateStart - Start date for custom range (YYYY-MM-DD)
   * @param {string} filters.dateEnd - End date for custom range (YYYY-MM-DD)
   * @param {Array} filters.severity - Severity levels to include (e.g., ['critical', 'high'])
   * @param {Array} filters.locations - Location IDs or names to include
   * @param {string} filters.reportType - Type of report to filter by
   * @param {string} filters.verificationStatus - Verification status to filter by
   * @param {string} filters.reportedBy - Filter by reporter (ID or role)
   * @param {Object} filters.additionalFilters - Additional custom filters
   * @returns {Promise<Object>} Analytics data
   */
  getAnalyticsData: async (filters = {}) => {
    // Use mock data in development, real API in production
    const USE_MOCK_DATA = import.meta.env.DEV;

    if (!USE_MOCK_DATA) {
      try {
        const queryString = buildQueryString(filters);
        const response = await axios.get(
          `${API_URL}/analytics/dashboard${queryString}`
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        throw new Error("Failed to fetch analytics data");
      }
    }

    // Mock data with delay to simulate API call
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // Generate mock data that somewhat respects the filters
        const mockData = generateMockAnalyticsData(filters);
        resolve(mockData);
      }, 800);
    });
  },

  /**
   * Get advanced analytics data including predictive modeling and resource optimization
   * @param {string} timeframe - Timeframe for analysis (week, month, quarter, year)
   * @param {string} region - Region to analyze (all, north, south, east, west, central)
   * @returns {Promise<Object>} Advanced analytics data with predictive modeling
   */
  getAdvancedAnalytics: async (timeframe = "month", region = "all") => {
    // Use mock data in development, real API in production
    const USE_MOCK_DATA = import.meta.env.DEV;

    if (!USE_MOCK_DATA) {
      try {
        const response = await axios.get(
          `${API_URL}/analytics/advanced-analytics`,
          {
            params: { timeframe, region },
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching advanced analytics:", error);
        throw new Error("Failed to fetch advanced analytics data");
      }
    }

    // Use the predictive analytics provider for mock data
    try {
      // Get prediction for the specific region or multiple regions if "all"
      let predictions;
      if (region === "all") {
        predictions = await predictiveProvider.getRegionalPredictions();
      } else {
        predictions = await predictiveProvider.getFloodPrediction(region);
      }

      // Get historical data based on timeframe
      const years = timeframe === "year" ? 5 : timeframe === "quarter" ? 3 : 1;
      const historicalData = await predictiveProvider.getHistoricalData(
        region,
        years
      );

      // Get resource optimization data
      const resourceData =
        await predictiveProvider.getOptimizedResourceAllocation(region);

      // Get sensor data
      const sensorData = await predictiveProvider.getSensorData();

      // Get model confidence metrics
      const modelConfidence = await predictiveProvider.getModelConfidence();

      // Combine all data into one response
      return {
        timeframe,
        region,
        predictions: Array.isArray(predictions) ? predictions : [predictions],
        historical: historicalData,
        resources: resourceData,
        sensors: sensorData,
        modelConfidence,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating predictive analytics data:", error);
      throw new Error("Failed to generate predictive analytics data");
    }
  },

  /**
   * Get historical comparison data
   * @param {Object} filters - Current period filters
   * @param {Object} previousFilters - Previous period filters for comparison
   * @returns {Promise<Object>} Comparison data for both periods
   */
  getComparisonData: async (filters = {}, previousFilters = {}) => {
    // Use mock data in development, real API in production
    const USE_MOCK_DATA = import.meta.env.DEV;

    if (!USE_MOCK_DATA) {
      try {
        // Make parallel requests for current and previous period data
        const [currentResponse, previousResponse] = await Promise.all([
          axios.get(
            `${API_URL}/analytics/dashboard${buildQueryString(filters)}`
          ),
          axios.get(
            `${API_URL}/analytics/dashboard${buildQueryString(previousFilters)}`
          ),
        ]);

        return {
          current: currentResponse.data,
          previous: previousResponse.data,
        };
      } catch (error) {
        console.error("Error fetching comparison data:", error);
        throw new Error("Failed to fetch comparison data");
      }
    }

    // Mock data for comparison
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentData = generateMockAnalyticsData(filters);
        const previousData = generateMockAnalyticsData(previousFilters, true);

        resolve({
          current: currentData,
          previous: previousData,
        });
      }, 1000);
    });
  },

  /**
   * Get real-time analytics updates (for WebSocket fallback)
   * @param {Array} dataSources - Data sources to include (e.g., ['reports', 'alerts', 'users'])
   * @returns {Promise<Object>} Real-time analytics data
   */
  getRealTimeUpdates: async (dataSources = ["reports", "alerts", "users"]) => {
    // Use mock data in development, real API in production
    const USE_MOCK_DATA = import.meta.env.DEV;

    if (!USE_MOCK_DATA) {
      try {
        const response = await axios.get(
          `${API_URL}/analytics/realtime?sources=${dataSources.join(",")}`
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching real-time updates:", error);
        throw new Error("Failed to fetch real-time updates");
      }
    }

    // Mock real-time data
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = {
          timestamp: new Date().toISOString(),
        };

        if (dataSources.includes("reports")) {
          data.reports = {
            new: Math.floor(Math.random() * 20),
            trend: Math.random() * 20 - 10, // Random value between -10 and 10
          };
        }

        if (dataSources.includes("alerts")) {
          data.alerts = {
            new: Math.floor(Math.random() * 10),
            trend: Math.random() * 15 - 5,
          };
        }

        if (dataSources.includes("users")) {
          data.users = {
            active: Math.floor(Math.random() * 100) + 50,
            trend: Math.random() * 8 - 4,
          };
        }

        resolve(data);
      }, 300);
    });
  },

  /**
   * Get flood risk predictions for locations
   * @param {Object} location - Location data for prediction
   * @param {Object} filters - Additional filter parameters
   * @returns {Promise<Object>} Prediction data
   */
  getPredictions: async (location, filters = {}) => {
    // Use mock data in development, real API in production
    const USE_MOCK_DATA = import.meta.env.DEV;

    if (!USE_MOCK_DATA) {
      try {
        const params = {
          state: location?.state || "",
          district: location?.district || "",
          lat: location?.coordinates?.lat || "",
          lng: location?.coordinates?.lng || "",
          timeframe: filters.timeframe || "7d",
          modelType: filters.modelType || "ml",
          confidenceInterval: filters.confidenceInterval || 95,
        };

        const response = await axios.get(`${API_URL}/analytics/predictions`, {
          params,
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching predictions:", error);
        throw new Error("Failed to fetch predictions");
      }
    }

    // Use the predictive analytics provider for mock data
    try {
      const region = location?.district || "Central District";

      // Get the prediction data
      const predictionData = await predictiveProvider.getFloodPrediction(
        region
      );

      // Get time series forecast for the specified timeframe
      const days =
        filters.timeframe === "7d"
          ? 7
          : filters.timeframe === "14d"
          ? 14
          : filters.timeframe === "30d"
          ? 30
          : 7;

      const timeSeriesData = await predictiveProvider.getTimeSeriesForecast(
        region,
        days
      );

      // Get risk heatmap data
      const heatmapData = await predictiveProvider.getRiskHeatmap(region);

      // Combine the data
      return {
        prediction: predictionData,
        timeSeries: timeSeriesData,
        heatmap: heatmapData,
        modelInfo: {
          type: filters.modelType || "ml",
          confidenceInterval: filters.confidenceInterval || 95,
          lastUpdated: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Error generating prediction data:", error);
      throw new Error("Failed to generate prediction data");
    }
  },

  /**
   * Get optimized resource allocation based on predictive models
   * @param {Object} params - Parameters for optimization calculation
   * @param {string} params.region - Region to optimize resources for
   * @param {number} params.riskThreshold - Risk threshold percentage for optimization
   * @returns {Promise<Object>} Optimized resource allocation data
   */
  getOptimizedResourceAllocation: async (params = {}) => {
    // Use mock data in development, real API in production
    const USE_MOCK_DATA = import.meta.env.DEV;

    if (!USE_MOCK_DATA) {
      try {
        const response = await axios.get(
          `${API_URL}/analytics/resource-optimization`,
          {
            params,
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching resource optimization data:", error);
        throw new Error("Failed to fetch resource optimization data");
      }
    }

    // Use the predictive analytics provider for mock data
    try {
      const region = params.region || "North District";

      // Get optimized resource allocation from the provider
      const optimizationData =
        await predictiveProvider.getOptimizedResourceAllocation(region);

      // Get current resource availability
      const resourceAvailability =
        await predictiveProvider.getResourceAvailability();

      // Get evacuation plan if available
      const evacuationPlan = await predictiveProvider.getEvacuationPlan(region);

      return {
        optimization: optimizationData,
        resources: resourceAvailability,
        evacuationPlan,
        riskThreshold: params.riskThreshold || 50,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error generating resource optimization data:", error);
      throw new Error("Failed to generate resource optimization data");
    }
  },

  /**
   * Get historical flood data for predictive modeling
   * @param {number} years - Number of years of historical data to retrieve
   * @param {string} location - Optional location filter
   * @returns {Promise<Object>} Historical flood data
   */
  getHistoricalData: async (years = 5, location = "") => {
    // Use mock data in development, real API in production
    const USE_MOCK_DATA = import.meta.env.DEV;

    if (!USE_MOCK_DATA) {
      try {
        const response = await axios.get(
          `${API_URL}/analytics/historical-data`,
          {
            params: { years, location },
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching historical data:", error);
        throw new Error("Failed to fetch historical flood data");
      }
    }

    // Use the predictive analytics provider for mock data
    try {
      // Get historical data from the provider
      const historicalData = await predictiveProvider.getHistoricalData(
        location,
        years
      );

      // Get incident clusters to enhance historical data
      const incidentClusters = await predictiveProvider.getIncidentClusters(
        location
      );

      return {
        ...historicalData,
        clusters: incidentClusters.clusters,
        hotspots: incidentClusters.hotspot,
      };
    } catch (error) {
      console.error("Error generating historical data:", error);
      throw new Error("Failed to generate historical flood data");
    }
  },

  /**
   * Export analytics data in various formats
   * @param {string} format - Export format (csv, json, pdf)
   * @param {Object} params - Export parameters including filters
   * @returns {Promise<Object|Blob>} Export result or file blob
   */
  exportData: async (format, params = {}) => {
    try {
      const response = await axios.get(
        `${API_URL}/analytics/export/${format}`,
        {
          params,
          responseType: format === "json" ? "json" : "blob",
        }
      );

      // Handle different response types
      if (format === "json") {
        return response.data;
      } else {
        // For CSV or PDF, return the blob for download
        const blob = new Blob([response.data], {
          type: format === "csv" ? "text/csv" : "application/pdf",
        });

        return {
          blob,
          filename: `flood-analytics-export-${new Date()
            .toISOString()
            .slice(0, 10)}.${format}`,
        };
      }
    } catch (error) {
      console.error(`Error exporting data as ${format}:`, error);
      throw new Error(`Failed to export data as ${format}`);
    }
  },

  /**
   * Get real-time flood monitoring data from integrated sensors
   * @param {Array<string>} sensorIds - IDs of specific sensors to query
   * @param {string} region - Region to filter sensors by
   * @returns {Promise<Object>} Real-time sensor data
   */
  getSensorData: async (sensorIds = [], region = "all") => {
    // Use mock data in development, real API in production
    const USE_MOCK_DATA = import.meta.env.DEV;

    if (!USE_MOCK_DATA) {
      try {
        const params = { region };

        if (sensorIds.length > 0) {
          params.sensors = sensorIds.join(",");
        }

        const response = await axios.get(`${API_URL}/analytics/sensor-data`, {
          params,
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        throw new Error("Failed to fetch sensor data");
      }
    }

    // Use the predictive analytics provider for mock data
    try {
      // Get sensor data from the provider
      const sensorData = await predictiveProvider.getSensorData();

      // Filter by sensor IDs if provided
      if (sensorIds.length > 0) {
        sensorData.readings = sensorData.readings.filter((reading) =>
          sensorIds.includes(reading.sensorId)
        );
      }

      return sensorData;
    } catch (error) {
      console.error("Error generating sensor data:", error);
      throw new Error("Failed to generate sensor data");
    }
  },

  /**
   * Get weather forecast data integrated with flood risk assessment
   * @param {Object} location - Location to get forecast for
   * @param {string} duration - Forecast duration (short, medium, long)
   * @returns {Promise<Object>} Weather forecast with flood risk assessment
   */
  getWeatherForecast: async (location, duration = "medium") => {
    try {
      const params = {
        state: location?.state || "",
        district: location?.district || "",
        duration,
      };

      const response = await axios.get(
        `${API_URL}/analytics/weather-forecast`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching weather forecast:", error);
      throw new Error("Failed to fetch weather forecast data");
    }
  },

  /**
   * Get risk assessment heatmap data
   * @param {Object} params - Parameters for heatmap generation
   * @param {string} params.region - Region to generate heatmap for
   * @param {string} params.riskType - Type of risk to visualize (flood, infrastructure, combined)
   * @param {string} params.timeframe - Time period for risk assessment
   * @returns {Promise<Object>} Heatmap data
   */
  getRiskHeatmapData: async (params = {}) => {
    // Use mock data in development, real API in production
    const USE_MOCK_DATA = import.meta.env.DEV;

    if (!USE_MOCK_DATA) {
      try {
        const response = await axios.get(`${API_URL}/analytics/risk-heatmap`, {
          params,
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching risk heatmap data:", error);
        throw new Error("Failed to fetch risk heatmap data");
      }
    }

    // Use the predictive analytics provider for mock data
    try {
      const region = params.region || "Central District";
      const riskType = params.riskType || "flood";

      // Get heatmap data from the provider
      const heatmapData = await predictiveProvider.getRiskHeatmap(
        region,
        riskType
      );

      return heatmapData;
    } catch (error) {
      console.error("Error generating risk heatmap data:", error);
      throw new Error("Failed to generate risk heatmap data");
    }
  },

  /**
   * Get time series forecast data for predictive modeling
   * @param {string} region - Region to get forecast for
   * @param {number} days - Number of days to forecast
   * @returns {Promise<Object>} Time series forecast data
   */
  getTimeSeriesForecast: async (region, days = 7) => {
    // Use mock data in development, real API in production
    const USE_MOCK_DATA = import.meta.env.DEV;

    if (!USE_MOCK_DATA) {
      try {
        const response = await axios.get(
          `${API_URL}/analytics/time-series-forecast`,
          {
            params: { region, days },
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching time series forecast:", error);
        throw new Error("Failed to fetch time series forecast");
      }
    }

    // Use the predictive analytics provider for mock data
    try {
      return await predictiveProvider.getTimeSeriesForecast(region, days);
    } catch (error) {
      console.error("Error generating time series forecast:", error);
      throw new Error("Failed to generate time series forecast");
    }
  },

  /**
   * Get model confidence metrics for predictive models
   * @returns {Promise<Object>} Model confidence data
   */
  getModelConfidence: async () => {
    // Use mock data in development, real API in production
    const USE_MOCK_DATA = import.meta.env.DEV;

    if (!USE_MOCK_DATA) {
      try {
        const response = await axios.get(
          `${API_URL}/analytics/model-confidence`
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching model confidence data:", error);
        throw new Error("Failed to fetch model confidence data");
      }
    }

    // Use the predictive analytics provider for mock data
    try {
      return await predictiveProvider.getModelConfidence();
    } catch (error) {
      console.error("Error generating model confidence data:", error);
      throw new Error("Failed to generate model confidence data");
    }
  },

  /**
   * Get incident clusters for identifying high-risk areas
   * @param {string} region - Region to analyze
   * @returns {Promise<Object>} Incident cluster data
   */
  getIncidentClusters: async (region) => {
    // Use mock data in development, real API in production
    const USE_MOCK_DATA = import.meta.env.DEV;

    if (!USE_MOCK_DATA) {
      try {
        const response = await axios.get(
          `${API_URL}/analytics/incident-clusters`,
          {
            params: { region },
          }
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching incident clusters:", error);
        throw new Error("Failed to fetch incident cluster data");
      }
    }

    // Use the predictive analytics provider for mock data
    try {
      return await predictiveProvider.getIncidentClusters(region);
    } catch (error) {
      console.error("Error generating incident cluster data:", error);
      throw new Error("Failed to generate incident cluster data");
    }
  },

  /**
   * Get comprehensive predictive model data for advanced analytics
   * @param {Object} params - Parameters for the prediction model
   * @param {string} params.region - Region to analyze
   * @param {number} params.confidenceLevel - Confidence level for predictions (0-100)
   * @param {number} params.timeHorizon - Number of days to forecast
   * @param {string} params.modelType - Type of model to use (ensemble, neuralNetwork, etc.)
   * @param {boolean} params.includeHistorical - Whether to include historical data
   * @param {number} params.thresholdLevel - Alert threshold percentage
   * @param {string} params.features - Comma-separated list of features to include
   * @returns {Promise<Object>} Comprehensive prediction model data
   */
  getPredictiveModelData: async (params = {}) => {
    // Use mock data in development, real API in production
    const USE_MOCK_DATA = import.meta.env.DEV;

    if (!USE_MOCK_DATA) {
      try {
        const response = await axios.get(
          `${API_URL}/analytics/predictive-model`,
          { params }
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching predictive model data:", error);
        throw new Error("Failed to fetch predictive model data");
      }
    }

    // Generate mock data for development
    return new Promise((resolve) => {
      setTimeout(() => {
        // Base data for the model
        const baseDate = new Date();
        const region = params.region || "Central District";
        const confidenceLevel = params.confidenceLevel || 95;
        const timeHorizon = params.timeHorizon || 14;
        const modelType = params.modelType || "ensemble";
        const thresholdLevel = params.thresholdLevel || 70;

        // Random risk score between 30-85
        const riskScore = Math.floor(Math.random() * 55) + 30;

        // Generate prediction data over the time horizon
        const predictions = [];
        for (let i = 0; i < timeHorizon; i++) {
          const date = new Date(baseDate);
          date.setDate(date.getDate() + i);

          // Generate varying probability with a trend
          const dayFactor = i / (timeHorizon - 1); // 0 to 1 over the time horizon
          const baseTrend = riskScore < 50 ? -10 : 15; // Decreasing or increasing trend
          const trendAdjustment = baseTrend * dayFactor;
          const randomFactor = Math.random() * 10 - 5; // -5 to +5

          let probability = Math.min(
            100,
            Math.max(0, riskScore + trendAdjustment + randomFactor)
          );

          // Generate rainfall data with correlation to probability
          const baseRainfall = probability > 50 ? 25 : 10;
          const rainfall = baseRainfall + Math.random() * 20;

          // Calculate thresholds
          const threshold = thresholdLevel;
          const criticalThreshold = threshold + 20;

          predictions.push({
            day: i + 1,
            date: date.toISOString().split("T")[0],
            probability: Math.round(probability),
            rainfall: Math.round(rainfall),
            threshold,
            criticalThreshold,
          });
        }

        // Peak risk data
        const peakRisk = predictions.reduce(
          (max, p) => (p.probability > max.probability ? p : max),
          { probability: 0 }
        );
        const peakRiskDay =
          predictions.findIndex((p) => p.probability === peakRisk.probability) +
          1;
        const peakRiskLevel = peakRisk.probability;

        // Count days with high risk (over threshold)
        const sustainedHighRiskDays = predictions.filter(
          (p) => p.probability >= thresholdLevel
        ).length;

        // Recovery period (days until risk drops below threshold after peak)
        let recoveryPeriod = 0;
        const peakIndex = peakRiskDay - 1;
        for (let i = peakIndex + 1; i < predictions.length; i++) {
          if (predictions[i].probability < thresholdLevel) {
            recoveryPeriod = i - peakIndex;
            break;
          }
        }

        // If recovery doesn't happen within the time horizon
        if (recoveryPeriod === 0 && peakIndex < predictions.length - 1) {
          recoveryPeriod = predictions.length - peakIndex;
        }

        // Generate water level forecast data
        const waterLevelForecast = [];
        const currentDate = new Date();
        const warningLevel = 3.5;
        const criticalLevel = 5.0;

        // Add historical data
        for (let i = 10; i >= 1; i--) {
          const date = new Date(currentDate);
          date.setDate(date.getDate() - i);

          const baseLevel = 2 + Math.random() * 0.5; // 2.0 - 2.5m
          waterLevelForecast.push({
            timestamp: date.toISOString(),
            actual: parseFloat(baseLevel.toFixed(1)),
            forecast: null,
            upper: null,
            lower: null,
            warningLevel,
            criticalLevel,
          });
        }

        // Add forecast data
        for (let i = 0; i < timeHorizon; i++) {
          const date = new Date(currentDate);
          date.setDate(date.getDate() + i);

          // Water level correlated with the flood probability
          const probability = predictions[i].probability;
          const forecastLevel = 2.5 + (probability / 100) * 5; // 2.5 - 7.5m

          // Confidence intervals widen over time
          const confidenceWidth = 0.2 + i * 0.1;

          waterLevelForecast.push({
            timestamp: date.toISOString(),
            actual: i === 0 ? parseFloat(forecastLevel.toFixed(1)) : null,
            forecast: parseFloat(forecastLevel.toFixed(1)),
            upper: parseFloat((forecastLevel + confidenceWidth).toFixed(1)),
            lower: parseFloat((forecastLevel - confidenceWidth).toFixed(1)),
            warningLevel,
            criticalLevel,
          });
        }

        // Generate model performance metrics
        const accuracy = 75 + Math.random() * 20;
        const precision = 70 + Math.random() * 25;
        const recall = 65 + Math.random() * 30;
        const f1Score = (2 * (precision * recall)) / (precision + recall);
        const auc = 70 + Math.random() * 25;

        // Generate feature importance data
        const features = [
          "rainfall",
          "waterLevel",
          "soilSaturation",
          "topology",
          "urbanDensity",
          "riverFlow",
        ];
        const featureImportance = {};
        let remainingImportance = 100;

        // Assign random importance to each feature
        for (let i = 0; i < features.length; i++) {
          // Last feature gets the remainder
          if (i === features.length - 1) {
            featureImportance[features[i]] = remainingImportance;
          } else {
            const importance = Math.min(
              remainingImportance,
              Math.random() * 30 + 10
            );
            featureImportance[features[i]] = parseFloat(importance.toFixed(1));
            remainingImportance -= importance;
          }
        }

        // Generate risk by area data
        const areas = [
          "Riverside",
          "Downtown",
          "Eastern District",
          "Western Hills",
          "Northern Suburb",
          "Southern Region",
        ];
        const riskByArea = areas
          .map((area) => {
            const riskLevel = Math.floor(Math.random() * 80) + 20;
            return { area, riskLevel };
          })
          .sort((a, b) => b.riskLevel - a.riskLevel);

        // Generate population at risk data
        const populationAtRisk = [
          {
            riskLevel: "Critical",
            population: Math.floor(Math.random() * 10000) + 5000,
          },
          {
            riskLevel: "High",
            population: Math.floor(Math.random() * 15000) + 10000,
          },
          {
            riskLevel: "Moderate",
            population: Math.floor(Math.random() * 20000) + 15000,
          },
          {
            riskLevel: "Low",
            population: Math.floor(Math.random() * 30000) + 20000,
          },
          {
            riskLevel: "Minimal",
            population: Math.floor(Math.random() * 40000) + 30000,
          },
        ];
        const totalPopulationAtRisk = populationAtRisk.reduce(
          (sum, p) => sum + p.population,
          0
        );

        // Generate scenario comparison data
        const baselineScenario = predictions.map((p) => ({
          ...p,
          baseline: p.probability,
          worstCase: Math.min(100, p.probability + 15),
          bestCase: Math.max(0, p.probability - 20),
          withIntervention: Math.max(0, p.probability - 10),
        }));

        // Scenario details
        const scenarioDetails = {
          baseline: {
            peakRisk: peakRiskLevel,
            population: totalPopulationAtRisk,
          },
          worstCase: {
            peakRisk: Math.min(100, peakRiskLevel + 15),
            population: Math.round(totalPopulationAtRisk * 1.3),
          },
          bestCase: {
            peakRisk: Math.max(0, peakRiskLevel - 20),
            population: Math.round(totalPopulationAtRisk * 0.7),
          },
          withIntervention: {
            peakRisk: Math.max(0, peakRiskLevel - 10),
            population: Math.round(totalPopulationAtRisk * 0.8),
          },
        };

        // Generate intervention effectiveness data
        const interventions = [
          "Temporary Flood Barriers",
          "Improved Drainage",
          "Early Warning System",
          "Evacuations",
          "Water Pumps Deployment",
          "River Dredging",
        ];
        const interventionEffectiveness = interventions
          .map((intervention) => ({
            intervention,
            effectiveness: Math.floor(Math.random() * 50) + 30,
          }))
          .sort((a, b) => b.effectiveness - a.effectiveness);

        // Generate cost-benefit analysis data
        const costBenefitAnalysis = interventions.map((intervention) => {
          const cost = Math.floor(Math.random() * 900000) + 100000;
          const benefit = cost * (0.5 + Math.random() * 2); // ROI between 0.5x and 2.5x
          const effectiveness = Math.floor(Math.random() * 40) + 40;

          return {
            intervention,
            cost,
            benefit,
            effectiveness,
            roi: parseFloat((benefit / cost).toFixed(2)),
          };
        });

        // Generate rainfall forecast
        const rainfallForecast = predictions.map((p) => ({
          day: p.day,
          rainfall: p.rainfall,
        }));

        // Generate soil saturation data
        const soilSaturation = predictions.map((p) => ({
          day: p.day,
          saturation: Math.min(100, 40 + p.rainfall / 2),
          threshold: 80,
        }));

        // Generate flood extents data
        const totalAreaKm2 = Math.floor(Math.random() * 30) + 20;
        const urbanAreaKm2 = Math.floor(totalAreaKm2 * 0.4);
        const agriculturalAreaKm2 = Math.floor(totalAreaKm2 * 0.6);
        const maxDepthMeters = (3 + Math.random() * 4).toFixed(1);

        // Generate critical infrastructure at risk
        const criticalInfrastructure = [
          { type: "Hospitals", count: Math.floor(Math.random() * 3) + 1 },
          { type: "Schools", count: Math.floor(Math.random() * 5) + 2 },
          { type: "Power Stations", count: Math.floor(Math.random() * 2) + 1 },
          {
            type: "Water Treatment Plants",
            count: Math.floor(Math.random() * 2) + 1,
          },
          { type: "Bridges", count: Math.floor(Math.random() * 4) + 2 },
          { type: "Major Roads", count: Math.floor(Math.random() * 5) + 3 },
        ];

        // Generate depth distribution data
        const depthDistribution = [
          { depthRange: "0-1m", area: Math.floor(Math.random() * 10) + 5 },
          { depthRange: "1-2m", area: Math.floor(Math.random() * 8) + 4 },
          { depthRange: "2-3m", area: Math.floor(Math.random() * 6) + 2 },
          { depthRange: "3-4m", area: Math.floor(Math.random() * 3) + 1 },
          { depthRange: ">4m", area: Math.floor(Math.random() * 2) },
        ];

        // Generate duration forecast data
        const durationForecast = [];
        let remainingArea = totalAreaKm2;
        for (let i = 0; i < 10; i++) {
          const recessionRate = i < 3 ? 0.05 : i < 6 ? 0.15 : 0.25;
          remainingArea = remainingArea * (1 - recessionRate);

          durationForecast.push({
            day: i,
            area: Math.max(0, Math.round(remainingArea)),
          });

          if (remainingArea < 0.5) break;
        }

        // Final assembled data
        const modelData = {
          region,
          modelInfo: {
            type: modelType,
            confidenceLevel,
            timeHorizon,
            trainingDataPoints: Math.floor(Math.random() * 5000) + 5000,
            trainingPeriod: "5 years",
            lastTrained: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            nextUpdate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          currentRisk: {
            overallRiskScore: riskScore,
            confidenceLevel,
            affectedPopulation: Math.floor(Math.random() * 50000) + 10000,
            criticalInfrastructure: Math.floor(Math.random() * 5) + 2,
            timeToCritical: `${Math.floor(Math.random() * 48) + 24} hours`,
            lastUpdated: new Date().toISOString(),
          },
          predictions,
          peakRiskDay,
          peakRiskLevel,
          sustainedHighRiskDays,
          recoveryPeriod,
          waterLevelForecast,
          modelPerformance: {
            accuracy: parseFloat(accuracy.toFixed(1)),
            precision: parseFloat(precision.toFixed(1)),
            recall: parseFloat(recall.toFixed(1)),
            f1Score: parseFloat(f1Score.toFixed(1)),
            auc: parseFloat(auc.toFixed(1)),
          },
          featureImportance,
          riskByArea,
          populationAtRisk,
          totalPopulationAtRisk,
          scenarioComparison: baselineScenario,
          scenarioDetails,
          interventionEffectiveness,
          costBenefitAnalysis,
          rainfallForecast,
          soilSaturation,
          floodExtents: {
            totalAreaKm2,
            urbanAreaKm2,
            agriculturalAreaKm2,
            maxDepthMeters,
            criticalInfrastructure,
            depthDistribution,
            durationForecast,
            recoveryTime: `${Math.floor(Math.random() * 7) + 3} days`,
          },
          insights: {
            predictionInsight: `Based on current trends and the ${modelType} model, ${region} is facing a ${
              riskScore >= 70 ? "high" : riskScore >= 50 ? "moderate" : "low"
            } risk of flooding in the next ${timeHorizon} days. Critical monitoring is advised, particularly around day ${peakRiskDay} when risk peaks at ${peakRiskLevel}%.`,
            timeSeriesInsight: `Water levels are projected to ${
              peakRiskLevel >= 70 ? "exceed" : "approach"
            } warning thresholds within ${
              Math.floor(Math.random() * 24) + 12
            } hours. ${
              sustainedHighRiskDays > 3
                ? "Extended high water conditions expected."
                : "Water levels should recede relatively quickly."
            }`,
          },
          forecastStats: {
            peakLevel: (3 + (peakRiskLevel / 100) * 4).toFixed(1),
            timeToPeak: `${Math.floor(Math.random() * 48) + 24} hours`,
            durationAboveWarning: Math.floor(Math.random() * 72) + 24,
            accuracy: Math.floor(Math.random() * 15) + 80,
          },
        };

        resolve(modelData);
      }, 1000);
    });
  },
};

/**
 * Generate mock analytics data based on filters
 * @param {Object} filters - Filter parameters
 * @param {boolean} isPrevious - Whether this is for previous period (for comparison)
 * @returns {Object} Mock analytics data
 */
function generateMockAnalyticsData(filters = {}, isPrevious = false) {
  // Calculate a factor to reduce values for previous period data
  const periodFactor = isPrevious ? 0.8 : 1;

  // Generate daily report data
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const reportsByDay = days.map((day) => {
    // Base values that will be modified based on filters
    let reports = Math.floor(Math.random() * 25) + 10;
    let verified = Math.floor(reports * 0.7);

    // Adjust based on time range
    if (filters.timeRange === "90d") {
      // More data for longer timeframes
      reports *= 1.5;
      verified *= 1.5;
    } else if (filters.timeRange === "7d") {
      // Less data for shorter timeframes
      reports *= 0.8;
      verified *= 0.8;
    }

    // Adjust for severity filters
    if (filters.severity && filters.severity.includes("critical")) {
      reports *= 1.3; // More reports for critical severity
    }

    // Apply period factor for historical comparison
    reports = Math.floor(reports * periodFactor);
    verified = Math.floor(verified * periodFactor);

    return {
      date: day,
      reports,
      verified,
      alerts: Math.floor(reports * 0.4),
    };
  });

  // Generate severity breakdown
  const severityLevels = ["Critical", "High", "Medium", "Low"];
  const reportsBySeverity = severityLevels.map((severity) => {
    // Adjust value based on if it's in the filters
    let factor = 1;
    if (filters.severity && filters.severity.includes(severity.toLowerCase())) {
      factor = 1.4; // Increase count for filtered severities
    }

    // Value is weighted by severity and period factor
    const severityWeight = {
      Critical: 0.15,
      High: 0.25,
      Medium: 0.4,
      Low: 0.2,
    }[severity];

    const value = Math.floor(200 * severityWeight * factor * periodFactor);

    return { name: severity, value };
  });

  // Generate region data
  const regions = [
    "North District",
    "South District",
    "East District",
    "West District",
    "Central District",
  ];
  const reportsByRegion = regions.map((region) => {
    // Check if this region is in the location filters
    let factor = 1;
    if (filters.locations && filters.locations.includes(region)) {
      factor = 1.5; // Increase count for filtered locations
    }

    const reports = Math.floor(Math.random() * 30 + 15) * factor * periodFactor;

    return { name: region, reports };
  });

  // Generate alert trends
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const alertTrends = months.map((month) => {
    return {
      month,
      alerts: Math.floor(Math.random() * 20 + 5) * periodFactor,
      predictedLevel: Math.floor(Math.random() * 4 + 1), // 1-5 scale
    };
  });

  // Generate stats
  const totalReports = reportsByDay.reduce((sum, day) => sum + day.reports, 0);
  const verifiedReports = reportsByDay.reduce(
    (sum, day) => sum + day.verified,
    0
  );
  const activeAlerts = Math.floor(totalReports * 0.05);
  const affectedAreas = Math.floor(Math.random() * 10) + 3;

  return {
    reportsByDay,
    reportsBySeverity,
    reportsByRegion,
    alertTrends,
    stats: {
      totalReports,
      verifiedReports,
      activeAlerts,
      affectedAreas,
      verificationRate: Math.round((verifiedReports / totalReports) * 100),
      avgResponseTime: Math.floor(Math.random() * 20) + 10, // minutes
    },
  };
}
