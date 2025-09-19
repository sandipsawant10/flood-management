const express = require("express");
const router = express.Router();

const FloodReport = require("../models/FloodReport");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const { asyncHandler } = require("../middleware/errorHandler");

// Get system stats for admin dashboard
router.get(
  "/stats",
  auth,
  roleAuth(["admin", "official"]),
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
  roleAuth(["admin", "official"]),
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
  roleAuth(["admin", "official"]),
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
  roleAuth(["admin", "official"]),
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

// Get all flood reports with detailed verification data for admin review
router.get(
  "/reports",
  auth,
  roleAuth(["admin", "official"]),
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 20,
      status,
      urgency,
      location,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    let query = {};
    if (status) query["verification.status"] = status;
    if (urgency) query.urgencyLevel = { $gte: parseInt(urgency) };
    if (location) query["location.name"] = { $regex: location, $options: "i" };

    const sortOptions = {};
    sortOptions[sortBy] = order === "desc" ? -1 : 1;

    const reports = await FloodReport.find(query)
      .populate("reportedBy", "name email phone trustScore")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean(); // Use .lean() for faster retrieval if not modifying docs

    const total = await FloodReport.countDocuments(query);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  })
);

// Get all flood reports for admin review
router.get(
  "/flood-reports",
  auth,
  roleAuth(["admin", "municipality_admin"]),
  asyncHandler(async (req, res) => {
    try {
      const { status, verified, page = 1, limit = 10 } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (verified !== undefined) filter.verified = verified === "true";

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: ["reportedBy", "municipality"],
      };

      const reports = await FloodReport.paginate(filter, options);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching admin flood reports:", error);
      res.status(500).json({ message: "Server error" });
    }
  })
);

// Update flood report status
router.patch(
  "/flood-reports/:id/status",
  auth,
  roleAuth(["admin", "municipality_admin"]),
  asyncHandler(async (req, res) => {
    try {
      const { status } = req.body;
      const report = await FloodReport.findByIdAndUpdate(
        req.params.id,
        { status, updatedAt: Date.now() },
        { new: true }
      ).populate(["reportedBy", "municipality"]);

      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      console.error("Error updating report status:", error);
      res.status(500).json({ message: "Server error" });
    }
  })
);

// Verify flood report
router.patch(
  "/flood-reports/:id/verify",
  auth,
  roleAuth(["admin", "municipality_admin"]),
  asyncHandler(async (req, res) => {
    try {
      const { verified } = req.body;
      const report = await FloodReport.findByIdAndUpdate(
        req.params.id,
        { verified, verifiedAt: verified ? Date.now() : null },
        { new: true }
      ).populate(["reportedBy", "municipality"]);

      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      res.json(report);
    } catch (error) {
      console.error("Error verifying report:", error);
      res.status(500).json({ message: "Server error" });
    }
  })
);

module.exports = router;
