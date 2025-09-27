const express = require("express");
const router = express.Router();
const { authorize } = require("../middleware/auth");
const emergencyService = require("../services/emergencyService");
const Emergency = require("../models/Emergency");

// Cache emergency contacts for better performance
let cachedContacts = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * @route   GET /api/emergency-services/contacts
 * @desc    Get emergency service contacts
 * @access  Public
 */
router.get("/contacts", (req, res) => {
  const startTime = Date.now();

  try {
    // Check if cached data is still valid
    const now = Date.now();
    if (
      cachedContacts &&
      cacheTimestamp &&
      now - cacheTimestamp < CACHE_DURATION
    ) {
      const responseTime = Date.now() - startTime;
      console.log(`Emergency contacts served from cache in ${responseTime}ms`);
      return res.json(cachedContacts);
    }

    // Get fresh contacts and cache them
    const contacts = emergencyService.getEmergencyContacts();
    cachedContacts = contacts;
    cacheTimestamp = now;

    const responseTime = Date.now() - startTime;
    console.log(`Emergency contacts generated fresh in ${responseTime}ms`);

    res.json(contacts);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(
      `Error fetching emergency contacts after ${responseTime}ms:`,
      error
    );
    res.status(500).json({ message: "Error fetching emergency contacts" });
  }
});

/**
 * @route   POST /api/emergency-services/report
 * @desc    Report an emergency to emergency services
 * @access  Private
 */
router.post("/report", authorize(), async (req, res) => {
  try {
    const {
      type,
      severity,
      coordinates,
      address,
      description,
      estimatedPeopleAffected,
      isPublic,
      servicesToNotify,
      weatherConditions,
      radius,
    } = req.body;

    // Validate required fields
    if (!type || !severity || !coordinates || !description) {
      return res
        .status(400)
        .json({ message: "Missing required emergency details" });
    }

    const userId = req.user._id;

    const emergencyData = {
      type,
      severity,
      coordinates,
      address,
      description,
      userId,
      estimatedPeopleAffected,
      isPublic,
      weatherConditions,
      radius,
    };

    const result = await emergencyService.reportEmergency(
      emergencyData,
      servicesToNotify || ["ndrf"]
    );

    res.status(201).json(result);
  } catch (error) {
    console.error("Error reporting emergency:", error);
    res
      .status(500)
      .json({ message: "Failed to report emergency", error: error.message });
  }
});

/**
 * @route   GET /api/emergency-services/status/:emergencyId
 * @desc    Get emergency status updates from external services
 * @access  Private
 */
router.get("/status/:emergencyId", authorize(), async (req, res) => {
  try {
    const { emergencyId } = req.params;

    // Check if emergency exists
    const emergency = await Emergency.findById(emergencyId);
    if (!emergency) {
      return res.status(404).json({ message: "Emergency not found" });
    }

    // Check if user is authorized to view this emergency
    if (
      req.user.role !== "admin" &&
      req.user.role !== "rescuer" &&
      emergency.reportedBy.toString() !== req.user._id.toString() &&
      !emergency.isPublic
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this emergency" });
    }

    const statusUpdates = await emergencyService.getEmergencyStatusUpdates(
      emergencyId
    );
    res.json(statusUpdates);
  } catch (error) {
    console.error("Error fetching emergency status:", error);
    res.status(500).json({
      message: "Failed to get emergency status updates",
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/emergency-services/sync/:emergencyId
 * @desc    Sync emergency status with external services
 * @access  Private (Admin/Rescuer)
 */
router.put(
  "/sync/:emergencyId",
  authorize(["admin", "rescuer"]),
  async (req, res) => {
    try {
      const { emergencyId } = req.params;

      const result = await emergencyService.syncEmergencyStatus(emergencyId);
      res.json(result);
    } catch (error) {
      console.error("Error syncing emergency status:", error);
      res.status(500).json({
        message: "Failed to sync emergency status",
        error: error.message,
      });
    }
  }
);

/**
 * @route   GET /api/emergency-services/resources
 * @desc    Get nearby emergency resources
 * @access  Public
 */
router.get("/resources", async (req, res) => {
  try {
    const { longitude, latitude, radius, types } = req.query;

    // Validate coordinates
    if (!longitude || !latitude) {
      return res
        .status(400)
        .json({ message: "Longitude and latitude are required" });
    }

    const coordinates = [parseFloat(longitude), parseFloat(latitude)];
    const searchRadius = radius ? parseInt(radius) : 5000; // Default 5km
    const resourceTypes = types
      ? types.split(",")
      : ["hospital", "shelter", "police", "fire_station"];

    const resources = await emergencyService.getNearbyEmergencyResources(
      coordinates,
      searchRadius,
      resourceTypes
    );

    res.json(resources);
  } catch (error) {
    console.error("Error fetching emergency resources:", error);
    res.status(500).json({
      message: "Failed to get emergency resources",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/emergency-services/webhook
 * @desc    Webhook endpoint for emergency service updates
 * @access  Public (secured by API key)
 */
router.post("/webhook", async (req, res) => {
  try {
    // Validate API key from headers
    const apiKey = req.headers["x-api-key"];
    if (!apiKey || apiKey !== process.env.EMERGENCY_WEBHOOK_API_KEY) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await emergencyService.processServiceWebhook(req.body);
    res.json(result);
  } catch (error) {
    console.error("Error processing webhook:", error);
    res
      .status(500)
      .json({ message: "Failed to process webhook", error: error.message });
  }
});

module.exports = router;
