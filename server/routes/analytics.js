const express = require("express");
const router = express.Router();
const FloodReport = require("../models/FloodReport");
const User = require("../models/User");
const Alert = require("../models/Alert");
const auth = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

// Get dashboard analytics
router.get(
  "/dashboard",
  auth,
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
  asyncHandler(async (req, res) => {
    const { state, district, lat, lng } = req.query;

    // Mock prediction data (integrate with ML models later)
    const predictions = [
      {
        location: {
          state: state || "Maharashtra",
          district: district || "Mumbai",
        },
        riskLevel: "medium",
        probability: 65,
        timeframe: "48 hours",
        factors: [
          "Heavy rainfall forecast",
          "River water level rising",
          "Monsoon season",
        ],
      },
    ];

    res.json({
      success: true,
      predictions,
    });
  })
);

// Export data for analysis
router.get(
  "/export/:format",
  auth,
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

module.exports = router;
