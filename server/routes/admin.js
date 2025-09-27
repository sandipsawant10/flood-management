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
    const {
      name,
      email,
      phone,
      password,
      role,
      isVerified,
      trustScore,
      isActive,
    } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (password) updateFields.password = password;
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

// Create user (admin only)
router.post(
  "/users",
  auth,
  roleAuth(["admin"]),
  asyncHandler(async (req, res) => {
    const {
      name,
      email,
      phone,
      password,
      role = "citizen",
      status = "active",
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or phone already exists",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      password,
      role,
      status,
      isVerified: true, // Admin created users are verified by default
    });

    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id).select("-password");

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userResponse,
    });
  })
);

// Delete user (admin only)
router.delete(
  "/users/:id",
  auth,
  roleAuth(["admin"]),
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "User deleted successfully",
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
  roleAuth(["admin", "municipality_admin", "municipality"]),
  asyncHandler(async (req, res) => {
    try {
      const { status, verified, page = 1, limit = 10 } = req.query;

      const filter = {};
      if (status) filter.status = status;
      if (verified !== undefined) filter.verified = verified === "true";

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const reports = await FloodReport.find(filter)
        .populate("reportedBy", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await FloodReport.countDocuments(filter);

      res.json({
        success: true,
        data: {
          reports,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching admin flood reports:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  })
);

// Update flood report status
router.patch(
  "/flood-reports/:id/status",
  auth,
  roleAuth(["admin", "municipality_admin", "municipality"]),
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
  roleAuth(["admin", "municipality_admin", "municipality"]),
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

// Get resources with admin filters
router.get(
  "/resources",
  auth,
  roleAuth(["admin", "municipality"]),
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      search = "",
      category = "all",
      location = "all",
      status = "all",
      sortField = "name",
      sortOrder = "asc",
    } = req.query;

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }
    if (category !== "all") {
      filter.category = category;
    }
    if (location !== "all") {
      filter.location = { $regex: location, $options: "i" };
    }
    if (status !== "all") {
      filter.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortField] = sortOrder === "desc" ? -1 : 1;

    // Mock data structured to match frontend expectations
    const resources = [
      {
        id: 1,
        name: "Emergency Rescue Boat",
        category: "vehicle",
        quantity: 5,
        location: "North Depot",
        status: "available",
        lastUsed: "2025-09-15T10:30:00Z",
        lastMaintenance: "2025-09-01T08:15:00Z",
        assignedTo: null,
        notes: "Regular maintenance completed",
      },
      {
        id: 2,
        name: "Medical First Aid Kits",
        category: "medical",
        quantity: 50,
        location: "Central Headquarters",
        status: "low_stock",
        lastUsed: "2025-09-20T14:45:00Z",
        lastMaintenance: null,
        assignedTo: null,
        notes: "Need to restock bandages and antiseptics",
      },
      {
        id: 3,
        name: "Emergency Food Packages",
        category: "food",
        quantity: 200,
        location: "South Warehouse",
        status: "available",
        lastUsed: "2025-09-10T09:20:00Z",
        lastMaintenance: null,
        assignedTo: null,
        notes: "Each package contains 3-day supply for one person",
      },
      {
        id: 4,
        name: "Portable Water Pumps",
        category: "equipment",
        quantity: 8,
        location: "West Emergency Storage",
        status: "maintenance",
        lastUsed: "2025-09-18T16:10:00Z",
        lastMaintenance: "2025-09-22T11:30:00Z",
        assignedTo: "Maintenance Team",
        notes: "Motor repair in progress",
      },
    ];

    const summary = {
      totalResources: resources.length,
      totalQuantity: resources.reduce((sum, r) => sum + r.quantity, 0),
      availableResources: resources.filter((r) => r.status === "available")
        .length,
      inUseResources: resources.filter((r) => r.status === "in_use").length,
      lowStockResources: resources.filter((r) => r.status === "low_stock")
        .length,
      maintenanceResources: resources.filter((r) => r.status === "maintenance")
        .length,
      resourcesByCategory: resources.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + r.quantity;
        return acc;
      }, {}),
    };

    const assignments = [
      {
        id: 1,
        resourceName: "Emergency Rescue Boat",
        assignedTo: "North District Flood Response",
        location: "North District",
        startDate: "2025-09-23T07:00:00Z",
        estimatedEndDate: "2025-09-25T18:00:00Z",
        status: "active",
      },
      {
        id: 2,
        resourceName: "Medical First Aid Kits",
        assignedTo: "Field Teams",
        location: "Multiple Locations",
        startDate: "2025-09-20T09:00:00Z",
        estimatedEndDate: "2025-09-28T17:00:00Z",
        status: "active",
      },
    ];

    res.json({
      success: true,
      resources,
      summary,
      assignments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: resources.length,
        pages: Math.ceil(resources.length / limit),
      },
    });
  })
);

module.exports = router;
