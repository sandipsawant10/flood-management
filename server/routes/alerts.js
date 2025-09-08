const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");
const User = require("../models/User");
const auth = require("../middleware/auth");
const notificationService = require("../services/notificationService");

// Get all alerts
router.get("/", auth, async (req, res) => {
  try {
    const { status = "active", severity, district, state } = req.query;

    let query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (district) query["targetArea.district"] = district;
    if (state) query["targetArea.state"] = state;

    const alerts = await Alert.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .populate("createdBy", "name role");

    res.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching alerts",
      error: error.message,
    });
  }
});

// Get single alert
router.get("/:id", auth, async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id).populate(
      "createdBy",
      "name role"
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.json({
      success: true,
      alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching alert",
      error: error.message,
    });
  }
});

// Create new alert (admin/officials only)
router.post("/", auth, async (req, res) => {
  try {
    // Check if user has permission to create alerts
    if (!["admin", "official"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to create alerts",
      });
    }

    const alertData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const alert = await Alert.create(alertData);
    await alert.populate("createdBy", "name role");

    // Find users in the target area to notify
    const targetUsers = await User.find({
      "location.state": alert.targetArea.state,
      ...(alert.targetArea.district && { "location.district": alert.targetArea.district }),
    });

    // Send notifications to affected users
    if (targetUsers.length > 0) {
      try {
        await notificationService.createAlertNotification(targetUsers, alert);
      } catch (notificationError) {
        console.error("Error sending notifications:", notificationError);
        // Continue with the response even if notifications fail
      }
    }

    res.status(201).json({
      success: true,
      message: "Alert created successfully",
      alert,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating alert",
      error: error.message,
    });
  }
});

// Update alert
router.put("/:id", auth, async (req, res) => {
  try {
    if (!["admin", "official"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to update alerts",
      });
    }

    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name role");

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    // If alert was updated to active status or severity increased, notify users
    if (req.body.status === "active" || 
        (req.body.severity && ["high", "critical"].includes(req.body.severity))) {
      
      // Find users in the target area to notify
      const targetUsers = await User.find({
        "location.state": alert.targetArea.state,
        ...(alert.targetArea.district && { "location.district": alert.targetArea.district }),
      });

      // Send notifications to affected users
      if (targetUsers.length > 0) {
        try {
          await notificationService.createAlertNotification(targetUsers, alert);
        } catch (notificationError) {
          console.error("Error sending notifications:", notificationError);
          // Continue with the response even if notifications fail
        }
      }
    }

    res.json({
      success: true,
      message: "Alert updated successfully",
      alert,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating alert",
      error: error.message,
    });
  }
});

// Delete alert
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!["admin", "official"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to delete alerts",
      });
    }

    const alert = await Alert.findByIdAndDelete(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting alert",
      error: error.message,
    });
  }
});

module.exports = router;
