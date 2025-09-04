const express = require("express");
const router = express.Router();
const FloodReport = require("../models/FloodReport");
const User = require("../models/User");
const Alert = require("../models/Alert");
const auth = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

// Admin middleware
const adminAuth = (req, res, next) => {
  if (!["admin", "official"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

// Get system stats for admin dashboard
router.get(
  "/stats",
  auth,
  adminAuth,
  asyncHandler(async (req, res) => {
    const [userStats, reportStats, systemHealth] = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            verified: { $sum: { $cond: ["$isVerified", 1, 0] } },
            avgTrustScore: { $avg: "$trustScore" },
            roleBreakdown: {
              $push: {
                role: "$role",
                count: 1,
              },
            },
          },
        },
      ]),

      // Report statistics
      FloodReport.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: {
              $sum: {
                $cond: [{ $eq: ["$verificationStatus", "pending"] }, 1, 0],
              },
            },
            verified: {
              $sum: {
                $cond: [{ $eq: ["$verificationStatus", "verified"] }, 1, 0],
              },
            },
            avgUrgency: { $avg: "$urgencyLevel" },
          },
        },
      ]),

      // System health metrics
      {
        dbConnected: true,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
      },
    ]);

    res.json({
      success: true,
      data: {
        users: userStats[0] || {},
        reports: reportStats[0] || {},
        system: systemHealth,
      },
    });
  })
);

// Moderate flood reports
router.put(
  "/reports/:id/moderate",
  auth,
  adminAuth,
  asyncHandler(async (req, res) => {
    const { action, reason, notes } = req.body;
    const reportId = req.params.id;

    const validActions = ["approve", "reject", "flag", "delete"];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid moderation action",
      });
    }

    const updateData = {
      verificationStatus:
        action === "approve"
          ? "verified"
          : action === "reject"
          ? "disputed"
          : "pending",
      verifiedBy: req.user.userId,
      verifiedAt: new Date(),
      verificationNotes: notes || reason,
    };

    if (action === "delete") {
      await FloodReport.findByIdAndDelete(reportId);
      return res.json({
        success: true,
        message: "Report deleted successfully",
      });
    }

    const report = await FloodReport.findByIdAndUpdate(reportId, updateData, {
      new: true,
    }).populate("reportedBy", "name email");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.json({
      success: true,
      message: `Report ${action}ed successfully`,
      data: report,
    });
  })
);

// Manage users
router.get(
  "/users",
  auth,
  adminAuth,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, role, verified } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) query.role = role;
    if (verified !== undefined) query.isVerified = verified === "true";

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  })
);

// Update user
router.put(
  "/users/:id",
  auth,
  adminAuth,
  asyncHandler(async (req, res) => {
    const { role, isVerified, trustScore, isActive } = req.body;

    const updateFields = {};
    if (role) updateFields.role = role;
    if (isVerified !== undefined) updateFields.isVerified = isVerified;
    if (trustScore !== undefined) updateFields.trustScore = trustScore;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      select: "-password",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  })
);

module.exports = router;
