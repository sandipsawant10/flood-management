import axios from "axios";

const API_URL =
  import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:5000/api";

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
        const params = { ...location, ...filters };
        const response = await axios.get(`${API_URL}/analytics/predictions`, {
          params,
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching predictions:", error);
        throw new Error("Failed to fetch predictions");
      }
    }

    // Mock prediction data
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate more relevant mock predictions
        let riskLevel = "medium";
        let probability = 65;

        // Adjust based on severity filters if provided
        if (filters.severity && filters.severity.includes("critical")) {
          riskLevel = "high";
          probability = Math.floor(Math.random() * 20) + 75; // 75-95%
        } else if (filters.timeRange === "7d") {
          // Shorter time range might have more accurate predictions
          probability = Math.floor(Math.random() * 15) + 60; // 60-75%
        }

        resolve({
          predictions: [
            {
              location: {
                state: location?.state || "Karnataka",
                district: location?.district || "Bangalore",
              },
              riskLevel,
              probability,
              timeframe: "48 hours",
              factors: [
                "Heavy rainfall forecast",
                "River water level rising",
                "Monsoon season",
                "Previous flood patterns",
                "Terrain elevation analysis",
              ],
              recommendedActions: [
                "Monitor water levels",
                "Alert residents in low-lying areas",
                "Prepare emergency response teams",
                "Ensure drainage systems are clear",
              ],
            },
          ],
          updatedAt: new Date().toISOString(),
        });
      }, 500);
    });
  },

  /**
   * Export analytics data in various formats
   * @param {string} format - Export format (csv, json, pdf)
   * @param {Object} params - Export parameters including filters
   * @returns {Promise<Object|Blob>} Export result or file blob
   */
  exportData: async (format, params = {}) => {
    // Use mock data in development, real API in production
    const USE_MOCK_DATA = import.meta.env.DEV;

    if (!USE_MOCK_DATA) {
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
    }

    // Mock export response
    return new Promise((resolve) => {
      setTimeout(() => {
        if (format === "json") {
          // Return mock JSON data
          resolve({
            success: true,
            data: generateMockAnalyticsData(params),
            exportedAt: new Date().toISOString(),
            count: Math.floor(Math.random() * 100) + 50,
          });
        } else {
          // For CSV/PDF in mock mode, just return success message
          resolve({
            success: true,
            message: `Mock ${format.toUpperCase()} export created`,
            filename: `flood-analytics-export-${new Date()
              .toISOString()
              .slice(0, 10)}.${format}`,
          });
        }
      }, 800);
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
