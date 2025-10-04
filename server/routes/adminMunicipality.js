const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const FloodReport = require("../models/FloodReport");
const Alert = require("../models/Alert");
const User = require("../models/User");
const roleAuth = require("../middleware/roleAuth");

// Get all flood reports with filtering and pagination
router.get("/reports", auth, roleAuth("municipality"), async (req, res) => {
  try {
    const { status, severity, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.verificationStatus = status;
    if (severity) query.severity = severity;

    const reports = await FloodReport.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("reportedBy", "name email");

    const total = await FloodReport.countDocuments(query);

    res.json({
      reports,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching reports", error: error.message });
  }
});

// Update flood report status
router.patch(
  "/reports/:reportId",
  auth,
  roleAuth("municipality"),
  async (req, res) => {
    try {
      const { status, officialNotes } = req.body;
      const report = await FloodReport.findByIdAndUpdate(
        req.params.reportId,
        {
          status,
          officialNotes,
          verifiedBy: req.user._id,
          verifiedAt: Date.now(),
        },
        { new: true }
      );

      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating report", error: error.message });
    }
  }
);

// Create area-specific alert
router.post("/alerts", auth, roleAuth("municipality"), async (req, res) => {
  try {
    const { title, message, severity, targetArea, audience, duration } =
      req.body;

    const alert = new Alert({
      title,
      message,
      severity,
      targetArea,
      audience,
      duration,
      issuedBy: req.user._id,
    });

    await alert.save();
    res.status(201).json(alert);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating alert", error: error.message });
  }
});

// Get analytics data
router.get("/analytics", auth, roleAuth("municipality"), async (req, res) => {
  try {
    const { timeframe = "24h" } = req.query;
    const timeFilter = {};

    if (timeframe === "24h") {
      timeFilter.createdAt = {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      };
    } else if (timeframe === "7d") {
      timeFilter.createdAt = {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      };
    }

    const [reportStats, alertStats] = await Promise.all([
      FloodReport.aggregate([
        { $match: timeFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Alert.aggregate([
        { $match: timeFilter },
        {
          $group: {
            _id: "$severity",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    res.json({
      reportStats: reportStats.reduce(
        (acc, curr) => ({ ...acc, [curr._id]: curr.count }),
        {}
      ),
      alertStats: alertStats.reduce(
        (acc, curr) => ({ ...acc, [curr._id]: curr.count }),
        {}
      ),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching analytics", error: error.message });
  }
});

// Get all users with specific roles for contact coordination
router.get("/contacts", auth, roleAuth("municipality"), async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { roles: role } : {};

    const users = await User.find(query)
      .select("name email phone roles lastActive")
      .sort({ lastActive: -1 });

    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching contacts", error: error.message });
  }
});

module.exports = router;
