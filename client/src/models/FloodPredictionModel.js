/**
 * FloodPredictionModel - Data model for flood prediction analytics
 *
 * This model represents the structure of data used in the advanced analytics
 * for predictive modeling and flood risk assessment.
 */

/**
 * @typedef {Object} FloodPrediction
 * @property {string} region - The region identifier
 * @property {string} district - The district within the region
 * @property {Object} coordinates - Geographic coordinates
 * @property {number} coordinates.lat - Latitude
 * @property {number} coordinates.lng - Longitude
 * @property {string} riskLevel - Risk level (low, medium, high, critical)
 * @property {number} probability - Probability of flooding (0-100)
 * @property {number} confidenceInterval - Confidence interval for the prediction (0-100)
 * @property {Object} weatherData - Associated weather data
 * @property {number} weatherData.rainfall - Predicted rainfall in mm
 * @property {number} weatherData.riverLevel - Current river level in meters
 * @property {number} weatherData.soilMoisture - Soil moisture percentage
 * @property {string[]} factors - Contributing factors to the flood risk
 * @property {Object} timeline - Timeline of prediction data
 * @property {Object[]} timeline.forecasts - Array of forecast points
 * @property {string} timeline.forecasts[].timeframe - Timeframe (e.g., "24h", "48h")
 * @property {number} timeline.forecasts[].probability - Probability at this timeframe
 * @property {number} timeline.forecasts[].waterLevel - Predicted water level
 * @property {number} timeline.forecasts[].affectedArea - Affected area size
 * @property {string[]} recommendedActions - Recommended preventive actions
 */

/**
 * @typedef {Object} ResourceOptimization
 * @property {string} region - Target region for resource optimization
 * @property {Object[]} resourceAllocation - Resource allocation data
 * @property {string} resourceAllocation[].type - Type of resource
 * @property {number} resourceAllocation[].optimal - Optimal quantity
 * @property {number} resourceAllocation[].current - Current quantity
 * @property {number} resourceAllocation[].delta - Difference (optimal - current)
 * @property {Object[]} evacuationRoutes - Evacuation routes data
 * @property {number} evacuationRoutes[].id - Route identifier
 * @property {string} evacuationRoutes[].from - Starting location
 * @property {string} evacuationRoutes[].to - Destination
 * @property {string} evacuationRoutes[].estimatedTime - Estimated travel time
 * @property {number} evacuationRoutes[].capacityPerHour - People per hour capacity
 * @property {Object[]} criticalAreas - Critical areas data
 * @property {string} criticalAreas[].name - Area name
 * @property {string} criticalAreas[].priorityLevel - Priority level (Critical, High, Medium, Low)
 * @property {number} criticalAreas[].population - Affected population
 * @property {number} affectedPopulation - Total affected population
 * @property {string} estimatedEvacuationTime - Estimated time for full evacuation
 * @property {string} timeWindow - Critical response time window
 * @property {number} efficiencyScore - Resource allocation efficiency score (0-100)
 */

/**
 * @typedef {Object} HistoricalFloodData
 * @property {string} region - Region identifier
 * @property {Object[]} events - Historical flood events
 * @property {string} events[].date - Date of the event
 * @property {string} events[].severity - Severity of the flood
 * @property {number} events[].rainfall - Rainfall amount in mm
 * @property {number} events[].affectedArea - Affected area in sq. km
 * @property {number} events[].casualties - Number of casualties
 * @property {number} events[].economicLoss - Economic loss in local currency
 * @property {Object} patterns - Identified patterns
 * @property {string[]} patterns.seasonality - Seasonal patterns
 * @property {Object[]} patterns.hotspots - Geographical hotspots
 * @property {Object} correlations - Correlation data with other factors
 */

/**
 * @typedef {Object} RiskHeatmapData
 * @property {string} region - Region identifier
 * @property {string} riskType - Type of risk (flood, infrastructure, combined)
 * @property {Object[]} points - Heatmap data points
 * @property {number} points[].lat - Latitude
 * @property {number} points[].lng - Longitude
 * @property {number} points[].intensity - Risk intensity (0-1)
 * @property {string} points[].color - Color code for the point
 * @property {Object} metadata - Additional metadata
 * @property {string} metadata.generatedAt - Generation timestamp
 * @property {string} metadata.validUntil - Validity timestamp
 * @property {number} metadata.confidenceScore - Confidence score
 */

/**
 * @typedef {Object} WeatherForecastData
 * @property {string} region - Region identifier
 * @property {string} duration - Forecast duration (short, medium, long)
 * @property {Object[]} forecast - Weather forecast data points
 * @property {string} forecast[].date - Date of forecast
 * @property {number} forecast[].temperature - Temperature in Celsius
 * @property {number} forecast[].rainfall - Expected rainfall in mm
 * @property {number} forecast[].humidity - Humidity percentage
 * @property {number} forecast[].windSpeed - Wind speed in km/h
 * @property {string} forecast[].condition - Weather condition description
 * @property {Object} floodRisk - Associated flood risk data
 * @property {number} floodRisk.probability - Flood probability
 * @property {string} floodRisk.level - Risk level
 * @property {string[]} floodRisk.factors - Contributing factors
 */

/**
 * @typedef {Object} SensorData
 * @property {string} sensorId - Unique sensor identifier
 * @property {string} type - Type of sensor (water level, rainfall, etc.)
 * @property {Object} location - Sensor location
 * @property {number} location.lat - Latitude
 * @property {number} location.lng - Longitude
 * @property {string} location.description - Location description
 * @property {Object[]} readings - Sensor readings
 * @property {string} readings[].timestamp - Reading timestamp
 * @property {number} readings[].value - Sensor value
 * @property {string} readings[].unit - Unit of measurement
 * @property {Object} status - Sensor status information
 * @property {boolean} status.operational - Whether sensor is operational
 * @property {string} status.lastMaintenance - Last maintenance date
 * @property {number} status.batteryLevel - Battery level percentage
 */

export const FloodPredictionModel = {
  // Data validation functions could be added here
  isValidPrediction: (prediction) => {
    return (
      prediction &&
      typeof prediction.region === "string" &&
      typeof prediction.probability === "number" &&
      prediction.probability >= 0 &&
      prediction.probability <= 100
    );
  },

  // Helper functions
  getRiskColor: (risk) => {
    if (risk >= 75) return "#ef4444"; // Red for high risk
    if (risk >= 50) return "#f97316"; // Orange for medium-high risk
    if (risk >= 30) return "#facc15"; // Yellow for medium risk
    if (risk >= 15) return "#84cc16"; // Light green for low-medium risk
    return "#22c55e"; // Green for low risk
  },

  getRiskLabel: (risk) => {
    if (risk >= 75) return "Critical Risk";
    if (risk >= 50) return "High Risk";
    if (risk >= 30) return "Moderate Risk";
    if (risk >= 15) return "Low-Medium Risk";
    return "Low Risk";
  },

  // Sample data for development/testing
  getSamplePrediction: () => {
    return {
      region: "North District",
      district: "Riverside County",
      coordinates: { lat: 12.9716, lng: 77.5946 },
      riskLevel: "high",
      probability: 78,
      confidenceInterval: 90,
      weatherData: {
        rainfall: 120,
        riverLevel: 5.8,
        soilMoisture: 85,
      },
      factors: [
        "Heavy rainfall forecast",
        "River water level rising",
        "Saturated soil conditions",
        "Previous flood patterns",
      ],
      timeline: {
        forecasts: [
          {
            timeframe: "24h",
            probability: 65,
            waterLevel: 4.2,
            affectedArea: 15,
          },
          {
            timeframe: "48h",
            probability: 78,
            waterLevel: 5.8,
            affectedArea: 25,
          },
          {
            timeframe: "72h",
            probability: 72,
            waterLevel: 5.5,
            affectedArea: 22,
          },
          {
            timeframe: "96h",
            probability: 60,
            waterLevel: 4.8,
            affectedArea: 18,
          },
          {
            timeframe: "120h",
            probability: 45,
            waterLevel: 3.9,
            affectedArea: 12,
          },
        ],
      },
      recommendedActions: [
        "Alert residents in low-lying areas",
        "Prepare evacuation routes",
        "Monitor water levels continuously",
        "Deploy emergency response teams",
      ],
    };
  },

  getSampleResourceOptimization: () => {
    return {
      region: "North District",
      resourceAllocation: [
        { type: "Rescue Teams", optimal: 12, current: 8, delta: 4 },
        { type: "Boats", optimal: 25, current: 15, delta: 10 },
        { type: "Medical Kits", optimal: 200, current: 150, delta: 50 },
        { type: "Food Supply (kg)", optimal: 1500, current: 1000, delta: 500 },
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
      affectedPopulation: 25000,
      estimatedEvacuationTime: "6 hours",
      timeWindow: "48 hours",
      efficiencyScore: 68,
    };
  },
};

export default FloodPredictionModel;
