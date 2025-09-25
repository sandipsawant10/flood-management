const express = require("express");
const router = express.Router();
const FloodReport = require("../models/FloodReport");
const User = require("../models/User");
const Alert = require("../models/Alert");
const { auth, authorize } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

// Get dashboard analytics
router.get(
  "/dashboard",
  auth,
  authorize(["admin", "official"]),
  asyncHandler(async (req, res) => {
    const { timeRange = "30d" } = req.query;

    const daysBack = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const [
      totalReports,
      verifiedReports,
      activeAlerts,
      newUsers,
      severityStats,
      locationStats,
      trendsData,
    ] = await Promise.all([
      // Total reports
      FloodReport.countDocuments({ createdAt: { $gte: startDate } }),

      // Verified reports
      FloodReport.countDocuments({
        verificationStatus: "verified",
        createdAt: { $gte: startDate },
      }),

      // Active alerts
      Alert.countDocuments({
        status: "active",
        createdAt: { $gte: startDate },
      }),

      // New users
      User.countDocuments({ createdAt: { $gte: startDate } }),

      // Severity breakdown
      FloodReport.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: "$severity",
            count: { $sum: 1 },
            avgUrgency: { $avg: "$urgencyLevel" },
          },
        },
      ]),

      // Top affected locations
      FloodReport.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              state: "$location.state",
              district: "$location.district",
            },
            count: { $sum: 1 },
            avgSeverity: {
              $avg: {
                $switch: {
                  branches: [
                    { case: { $eq: ["$severity", "low"] }, then: 1 },
                    { case: { $eq: ["$severity", "medium"] }, then: 2 },
                    { case: { $eq: ["$severity", "high"] }, then: 3 },
                    { case: { $eq: ["$severity", "critical"] }, then: 4 },
                  ],
                  default: 1,
                },
              },
            },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Daily trends
      FloodReport.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            reports: { $sum: 1 },
            avgUrgency: { $avg: "$urgencyLevel" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalReports,
          verifiedReports,
          activeAlerts,
          newUsers,
          verificationRate:
            totalReports > 0
              ? Math.round((verifiedReports / totalReports) * 100)
              : 0,
        },
        severityStats,
        locationStats,
        trendsData,
        timeRange,
      },
    });
  })
);

// Get flood predictions
router.get(
  "/predictions",
  auth,
  authorize(["admin", "official"]),
  asyncHandler(async (req, res) => {
    const {
      state,
      district,
      lat,
      lng,
      timeframe = "7d",
      modelType = "ml",
      confidenceInterval = 95,
    } = req.query;

    // Mock prediction data (integrate with ML models later)
    const predictions = [
      {
        location: {
          state: state || "Maharashtra",
          district: district || "Mumbai",
          coordinates: {
            lat: lat || 19.076,
            lng: lng || 72.8777,
          },
        },
        riskLevel: "medium",
        probability: 65,
        timeframe:
          timeframe === "1d"
            ? "24 hours"
            : timeframe === "3d"
            ? "72 hours"
            : timeframe === "7d"
            ? "7 days"
            : timeframe === "14d"
            ? "14 days"
            : timeframe === "30d"
            ? "30 days"
            : "48 hours",
        factors: [
          "Heavy rainfall forecast",
          "River water level rising",
          "Monsoon season",
          "Historical flood patterns",
          "Current infrastructure status",
        ],
        predictionConfidence: parseInt(confidenceInterval) || 95,
        modelType: modelType || "ml",
        recommendedActions: [
          "Alert residents in low-lying areas",
          "Prepare emergency response teams",
          "Monitor water levels continuously",
          "Ensure drainage systems are operational",
        ],
        historicalComparison: "+15%",
        forecastData: generateForecastData(timeframe, modelType),
      },
    ];

    res.json({
      success: true,
      predictions,
      updatedAt: new Date().toISOString(),
    });
  })
);

// Advanced analytics with predictive modeling data
router.get(
  "/advanced-analytics",
  auth,
  authorize(["admin"]),
  asyncHandler(async (req, res) => {
    const { timeframe = "month", region = "all" } = req.query;

    // This would be replaced with actual ML model data in a production environment
    // For now we'll use mock data that simulates complex predictive analytics

    // Calculate risk index based on region and timeframe
    let floodRiskIndex = 72; // default
    let affectedRegions = 3; // default

    // Adjust based on region
    if (region !== "all") {
      // Add 10-20% to risk for certain high-risk regions
      if (["north", "east"].includes(region)) {
        floodRiskIndex = Math.min(
          95,
          floodRiskIndex + Math.floor(Math.random() * 10) + 10
        );
        affectedRegions = 1;
      }
      // Reduce risk for certain low-risk regions
      else if (["south", "west"].includes(region)) {
        floodRiskIndex = Math.max(
          30,
          floodRiskIndex - Math.floor(Math.random() * 15) - 10
        );
        affectedRegions = 1;
      }
    }

    // Adjust based on timeframe
    if (timeframe === "week") {
      // Short-term predictions may be more accurate but lower risk
      floodRiskIndex = Math.max(20, floodRiskIndex - 15);
    } else if (timeframe === "quarter") {
      // Longer timeframes have higher uncertainty and potential risk
      floodRiskIndex = Math.min(90, floodRiskIndex + 10);
      affectedRegions = Math.min(5, affectedRegions + 1);
    } else if (timeframe === "year") {
      // Very long timeframes have highest uncertainty
      floodRiskIndex = Math.min(85, floodRiskIndex + 5);
      affectedRegions = Math.min(5, affectedRegions + 2);
    }

    res.json({
      success: true,
      predictiveAnalysis: {
        floodRiskIndex,
        riskTrend: floodRiskIndex > 60 ? "increasing" : "decreasing",
        historicalComparison: floodRiskIndex > 60 ? "+15%" : "-8%",
        affectedRegions,
        predictionConfidence: 85,
        forecastData: generateForecastData(timeframe, "ensemble"),
        riskFactors: [
          { factor: "Rainfall", weight: 0.35, value: 78 },
          { factor: "River Levels", weight: 0.25, value: 65 },
          { factor: "Terrain", weight: 0.15, value: 50 },
          { factor: "Infrastructure", weight: 0.15, value: 70 },
          { factor: "Historical Patterns", weight: 0.1, value: 85 },
        ],
        highRiskAreas: [
          {
            name: "North District",
            riskScore: 82,
            population: 125000,
            infrastructure: "vulnerable",
          },
          {
            name: "East Zone",
            riskScore: 75,
            population: 95000,
            infrastructure: "moderate",
          },
          {
            name: "Central Area",
            riskScore: 68,
            population: 145000,
            infrastructure: "adequate",
          },
        ],
      },
      resourceOptimization: {
        currentEfficiency: 68,
        recommendedAdjustments: 5,
        potentialSavings: "18%",
        criticalShortages: 2,
        resourceAllocation: generateResourceAllocationData(region),
        evacuationRoutes: generateEvacuationRoutes(),
        resourceDistribution: generateResourceDistribution(),
      },
      recentIncidents: [
        {
          id: 1,
          location: "North District",
          severity: "high",
          reports: 23,
          timestamp: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: 2,
          location: "Central Area",
          severity: "medium",
          reports: 12,
          timestamp: new Date(
            Date.now() - 1 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: 3,
          location: "East Zone",
          severity: "critical",
          reports: 45,
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 4,
          location: "South Region",
          severity: "low",
          reports: 8,
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
      ],
    });
  })
);

// Resource optimization endpoint
router.get(
  "/analytics/resource-optimization",
  auth,
  authorize(["admin"]),
  asyncHandler(async (req, res) => {
    const { region = "all", riskThreshold = 65 } = req.query;

    // In a production environment, this would run actual optimization algorithms
    // based on ML predictions and available resource data

    const optimizationResults = {
      summary: {
        affectedPopulation: 125000,
        estimatedEvacuationTime: "8 hours",
        requiredResources: {
          rescueTeams: 28,
          vehicles: 42,
          medicalKits: 350,
          foodSupply: 2500,
          shelters: 15,
        },
        currentAvailability: {
          rescueTeams: 20,
          vehicles: 30,
          medicalKits: 250,
          foodSupply: 1800,
          shelters: 10,
        },
      },
      resourceAllocation: generateResourceAllocationData(region),
      evacuationRoutes: generateEvacuationRoutes(),
      criticalAreas: [
        {
          name: "Riverside Housing Complex",
          priorityLevel: "Critical",
          population: 5000,
          evacuationTime: "2.5 hours",
        },
        {
          name: "Downtown Market",
          priorityLevel: "High",
          population: 8000,
          evacuationTime: "3 hours",
        },
        {
          name: "Eastern Suburb",
          priorityLevel: "Medium",
          population: 12000,
          evacuationTime: "4.5 hours",
        },
      ],
      resourceEfficiency: {
        current: 65,
        optimized: 85,
        savingsPercentage: 18,
      },
      recommendations: [
        "Relocate 5 rescue teams from West Zone to North District",
        "Increase medical kit allocation to East Zone by 25%",
        "Establish 2 additional evacuation centers in Central Area",
        "Deploy early warning systems in Riverside Housing Complex",
        "Pre-position food supplies near Downtown Market",
      ],
    };

    res.json({
      success: true,
      data: optimizationResults,
    });
  })
);

// Get historical flood data for machine learning training
router.get(
  "/historical-data",
  auth,
  authorize(["admin"]),
  asyncHandler(async (req, res) => {
    const { years = 5, location } = req.query;

    // In production, this would fetch real historical data from the database
    // Possibly from a specialized collection dedicated to historical records

    const historicalData = {
      timeframe: `${years} years`,
      location: location || "All Regions",
      records: generateHistoricalData(parseInt(years), location),
      dataSources: [
        "Government Meteorological Department",
        "National Disaster Response Force",
        "River Management Authorities",
        "Historical Flood Report Archives",
        "Geographical Survey of India",
      ],
      summary: {
        totalFloodEvents: 24,
        averageSeverity: "Medium-High",
        worstAffectedRegions: [
          "North District",
          "East Zone",
          "Riverside Areas",
        ],
        seasonalTrends: [
          { season: "Monsoon", riskLevel: "High", months: "June-September" },
          {
            season: "Post-Monsoon",
            riskLevel: "Medium",
            months: "October-November",
          },
          { season: "Winter", riskLevel: "Low", months: "December-February" },
          { season: "Summer", riskLevel: "Low-Medium", months: "March-May" },
        ],
      },
    };

    res.json({
      success: true,
      data: historicalData,
    });
  })
);

// Export data for analysis
router.get(
  "/export/:format",
  auth,
  authorize(["admin", "official"]),
  asyncHandler(async (req, res) => {
    const { format } = req.params;
    const { startDate, endDate, type = "reports" } = req.query;

    if (!["json", "csv"].includes(format)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported format. Use json or csv",
      });
    }

    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const data = await FloodReport.find(query)
      .populate("reportedBy", "name email location")
      .lean();

    if (format === "csv") {
      const csv = convertToCSV(data); // Implement CSV conversion
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=flood-reports.csv"
      );
      return res.send(csv);
    }

    res.json({
      success: true,
      data,
      count: data.length,
    });
  })
);

// Helper function to generate forecast data
function generateForecastData(timeframe, modelType) {
  const timePoints = [];
  let dataPoints = 7; // Default for 7 days

  // Adjust number of data points based on timeframe
  if (timeframe === "week" || timeframe === "7d") {
    dataPoints = 7;
  } else if (timeframe === "month" || timeframe === "30d") {
    dataPoints = 10;
  } else if (timeframe === "quarter" || timeframe === "90d") {
    dataPoints = 12;
  } else if (timeframe === "year" || timeframe === "365d") {
    dataPoints = 12;
  }

  // Create time points
  for (let i = 0; i < dataPoints; i++) {
    // Set base values
    const baseRisk = 65;
    const baseWaterLevel = 3.2;
    const baseAffectedArea = 15;

    // Add trend and randomness based on model type
    let trendFactor = 1.0;
    let randomFactor = 10;

    if (modelType === "ml") {
      trendFactor = 1.05;
      randomFactor = 15;
    } else if (modelType === "hydro") {
      trendFactor = 1.02;
      randomFactor = 8;
    } else if (modelType === "ensemble") {
      trendFactor = 1.04;
      randomFactor = 5;
    }

    // Calculate values with trend and randomness
    const probability = Math.min(
      95,
      Math.max(
        10,
        Math.round(
          baseRisk * Math.pow(trendFactor, i) +
            (Math.random() * randomFactor - randomFactor / 2)
        )
      )
    );

    const waterLevel = parseFloat(
      (
        baseWaterLevel * Math.pow(trendFactor, i / 2) +
        (Math.random() * 0.5 - 0.25)
      ).toFixed(2)
    );

    const affectedArea = Math.round(
      baseAffectedArea * Math.pow(trendFactor, i / 3) +
        (Math.random() * 5 - 2.5)
    );

    // Calculate confidence interval
    const ciRange = 5; // 5% range for 95% confidence
    const lowerBound = Math.max(0, probability - ciRange);
    const upperBound = Math.min(100, probability + ciRange);

    // Define time label based on timeframe
    let timeLabel;
    if (timeframe === "week" || timeframe === "7d") {
      timeLabel = `Day ${i + 1}`;
    } else if (timeframe === "month" || timeframe === "30d") {
      timeLabel = `Week ${Math.floor(i / 2) + 1}`;
      if (i % 2 !== 0) timeLabel += ".5";
    } else if (timeframe === "quarter" || timeframe === "90d") {
      timeLabel = `Month ${Math.floor(i / 3) + 1}`;
      if (i % 3 !== 0) timeLabel += `.${i % 3}`;
    } else {
      timeLabel = `Month ${i + 1}`;
    }

    timePoints.push({
      timeframe: timeLabel,
      probability,
      waterLevel,
      affectedArea,
      lowerBound,
      upperBound,
    });
  }

  return timePoints;
}

// Helper function to generate resource allocation data
function generateResourceAllocationData(region) {
  const regions = [
    { name: "North Region", riskLevel: "high" },
    { name: "South Region", riskLevel: "medium" },
    { name: "East Zone", riskLevel: "high" },
    { name: "West Zone", riskLevel: "low" },
    { name: "Central Region", riskLevel: "medium" },
  ];

  // Filter by region if specified
  let filteredRegions = regions;
  if (region !== "all" && region) {
    filteredRegions = regions.filter((r) =>
      r.name.toLowerCase().includes(region.toLowerCase())
    );
    if (filteredRegions.length === 0) {
      filteredRegions = [
        regions.find((r) => r.name.toLowerCase().includes("north")) ||
          regions[0],
      ];
    }
  }

  return filteredRegions.map((r) => {
    // Determine current and optimal resources based on risk level
    let current, optimal;

    if (r.riskLevel === "high") {
      current = {
        teams: 15,
        vehicles: 8,
      };
      optimal = {
        teams: 20,
        vehicles: 12,
      };
    } else if (r.riskLevel === "medium") {
      current = {
        teams: 18,
        vehicles: 10,
      };
      optimal = {
        teams: r.name.includes("South") ? 15 : 18,
        vehicles: r.name.includes("South") ? 8 : 10,
      };
    } else {
      current = {
        teams: 20,
        vehicles: 12,
      };
      optimal = {
        teams: 18,
        vehicles: 10,
      };
    }

    return {
      region: r.name,
      current: `${current.teams} Teams, ${current.vehicles} Vehicles`,
      recommended: `${optimal.teams} Teams, ${optimal.vehicles} Vehicles`,
      riskLevel: r.riskLevel,
      adjustment: `${optimal.teams > current.teams ? "+" : ""}${
        optimal.teams - current.teams
      } Teams, ${optimal.vehicles > current.vehicles ? "+" : ""}${
        optimal.vehicles - current.vehicles
      } Vehicles`,
    };
  });
}

// Helper function to generate evacuation routes
function generateEvacuationRoutes() {
  return [
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
  ];
}

// Helper function to generate resource distribution data
function generateResourceDistribution() {
  return {
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
}

// Helper function to generate historical flood data
function generateHistoricalData(years, location) {
  const records = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - years);

  // Generate quarterly records
  const quarterCount = years * 4;

  for (let i = 0; i < quarterCount; i++) {
    const recordDate = new Date(startDate);
    recordDate.setMonth(startDate.getMonth() + i * 3);

    // Determine season based on month
    const month = recordDate.getMonth();
    let season, baseRisk, baseSeverity;

    if (month >= 5 && month <= 8) {
      // June-September: Monsoon (high risk)
      season = "Monsoon";
      baseRisk = 75;
      baseSeverity = ["high", "critical"];
    } else if (month >= 9 && month <= 10) {
      // October-November: Post-Monsoon (medium risk)
      season = "Post-Monsoon";
      baseRisk = 50;
      baseSeverity = ["medium", "high"];
    } else if (month >= 11 || month <= 1) {
      // December-February: Winter (low risk)
      season = "Winter";
      baseRisk = 15;
      baseSeverity = ["low"];
    } else {
      // March-May: Summer (low-medium risk)
      season = "Summer";
      baseRisk = 30;
      baseSeverity = ["low", "medium"];
    }

    // Adjust risk based on location if provided
    if (location) {
      if (
        location.toLowerCase().includes("north") ||
        location.toLowerCase().includes("east")
      ) {
        baseRisk = Math.min(95, baseRisk + 15);
      } else if (
        location.toLowerCase().includes("south") ||
        location.toLowerCase().includes("west")
      ) {
        baseRisk = Math.max(5, baseRisk - 10);
      }
    }

    // Add random variation
    const riskLevel = Math.min(
      100,
      Math.max(5, baseRisk + (Math.random() * 20 - 10))
    );

    // Determine severity based on risk level
    let severity;
    if (riskLevel > 75) {
      severity = "critical";
    } else if (riskLevel > 60) {
      severity = "high";
    } else if (riskLevel > 40) {
      severity = "medium";
    } else {
      severity = "low";
    }

    // Generate flood event count based on risk level
    let floodEvents = 0;
    if (riskLevel > 70) {
      floodEvents = Math.floor(Math.random() * 3) + 3; // 3-5 events
    } else if (riskLevel > 50) {
      floodEvents = Math.floor(Math.random() * 2) + 1; // 1-2 events
    } else if (riskLevel > 30) {
      floodEvents = Math.floor(Math.random() * 1.2); // 0-1 events
    }

    records.push({
      period: `${recordDate.getFullYear()} Q${Math.floor(month / 3) + 1}`,
      date: recordDate.toISOString(),
      season,
      riskLevel: Math.round(riskLevel),
      severity,
      floodEvents,
      averageWaterLevel: parseFloat(
        (riskLevel / 20 + 0.5 + Math.random() * 0.5).toFixed(1)
      ),
      affectedArea: Math.round(riskLevel * 1.5 + Math.random() * 30),
      peopleAffected:
        floodEvents > 0
          ? Math.round(floodEvents * 5000 + Math.random() * 2000)
          : 0,
    });
  }

  return records;
}

module.exports = router;
