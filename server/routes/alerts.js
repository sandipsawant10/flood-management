const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");
const User = require("../models/User");
const { auth } = require("../middleware/auth");
const notificationService = require("../services/notificationService");

// Cache for alerts - 2 minute expiry for active alerts due to real-time nature
const alertsCache = new Map();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for alerts (more frequent than emergency contacts)

// Helper function to invalidate alerts cache
const invalidateAlertsCache = () => {
  console.log("Invalidating alerts cache due to data modification");
  alertsCache.clear();
};

// Get active alerts (public endpoint for prefetching)
router.get("/active", async (req, res) => {
  const startTime = Date.now();

  try {
    const { limit = "50" } = req.query;
    const cacheKey = `active_alerts_${limit}`;

    // Check cache first (shorter cache for active alerts)
    const cached = alertsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(
        `Active alerts cache hit, response time: ${Date.now() - startTime}ms`
      );
      return res.json(cached.data);
    }

    console.log("Active alerts cache miss, fetching from database...");
    const dbQueryStart = Date.now();

    // Use isActive field instead of status for better performance (indexed field)
    const alerts = await Alert.find({ isActive: true })
      .sort({ priority: -1, createdAt: -1 })
      .select(
        "title message alertType severity priority targetArea validFrom validUntil createdAt updatedAt"
      )
      .limit(parseInt(limit))
      .lean(); // Use lean() for better performance

    const dbQueryTime = Date.now() - dbQueryStart;
    console.log(
      `Active alerts database query completed in ${dbQueryTime}ms, found ${alerts.length} alerts`
    );

    const response = {
      success: true,
      count: alerts.length,
      alerts,
      cached: false,
      queryTime: dbQueryTime,
    };

    // Cache the result
    alertsCache.set(cacheKey, {
      data: { ...response, cached: true },
      timestamp: Date.now(),
    });

    const totalTime = Date.now() - startTime;
    console.log(
      `Active alerts endpoint completed in ${totalTime}ms (DB: ${dbQueryTime}ms)`
    );

    res.set("X-Response-Time", `${totalTime}ms`);
    res.json(response);
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(
      `Active alerts endpoint error after ${errorTime}ms:`,
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Server error fetching active alerts",
      error: error.message,
    });
  }
});

// Get all alerts
router.get("/", auth, async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      status = "active",
      severity,
      district,
      state,
      limit = "50",
    } = req.query;

    // Create cache key from query parameters
    const cacheKey = `alerts_${status || "all"}_${severity || "all"}_${
      district || "all"
    }_${state || "all"}_${limit}`;

    // Check cache first
    const cached = alertsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(
        `Alerts cache hit for key: ${cacheKey}, response time: ${
          Date.now() - startTime
        }ms`
      );
      return res.json(cached.data);
    }

    console.log(
      `Alerts cache miss for key: ${cacheKey}, fetching from database...`
    );

    let query = {};
    if (status && status !== "all") query.status = status;
    if (severity) query.severity = severity;
    if (district) query["targetArea.districts"] = district;
    if (state) query["targetArea.states"] = state;

    const dbQueryStart = Date.now();

    // Optimize query: limit results and only populate essential user fields
    const alerts = await Alert.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select(
        "title message alertType severity priority targetArea validFrom validUntil instructions isActive createdAt updatedAt issuedBy"
      )
      .populate("issuedBy", "name role")
      .lean(); // Use lean() for better performance

    const dbQueryTime = Date.now() - dbQueryStart;
    console.log(
      `Database query completed in ${dbQueryTime}ms, found ${alerts.length} alerts`
    );

    const response = {
      success: true,
      count: alerts.length,
      alerts,
      cached: false,
      queryTime: dbQueryTime,
    };

    // Cache the result
    alertsCache.set(cacheKey, {
      data: { ...response, cached: true },
      timestamp: Date.now(),
    });

    // Clean up old cache entries periodically
    if (alertsCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of alertsCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
          alertsCache.delete(key);
        }
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(
      `Alerts endpoint completed in ${totalTime}ms (DB: ${dbQueryTime}ms)`
    );

    res.set("X-Response-Time", `${totalTime}ms`);
    res.json(response);
  } catch (error) {
    const errorTime = Date.now() - startTime;
    console.error(`Alerts endpoint error after ${errorTime}ms:`, error.message);

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

    // Invalidate cache since new alert was created
    invalidateAlertsCache();

    // Find users in the target area to notify
    const targetUsers = await User.find({
      "location.state": alert.targetArea.state,
      ...(alert.targetArea.district && {
        "location.district": alert.targetArea.district,
      }),
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

    // Invalidate cache since alert was updated
    invalidateAlertsCache();

    // If alert was updated to active status or severity increased, notify users
    if (
      req.body.status === "active" ||
      (req.body.severity && ["high", "critical"].includes(req.body.severity))
    ) {
      // Find users in the target area to notify
      const targetUsers = await User.find({
        "location.state": alert.targetArea.state,
        ...(alert.targetArea.district && {
          "location.district": alert.targetArea.district,
        }),
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

    // Invalidate cache since alert was deleted
    invalidateAlertsCache();

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
