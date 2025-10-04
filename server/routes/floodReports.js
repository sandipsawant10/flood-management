const express = require("express");
const { body, query, validationResult } = require("express-validator");
const FloodReport = require("../models/FloodReport");
const User = require("../models/User");
const { auth, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const roleAuth = require("../middleware/roleAuth");
const weatherService = require("../services/weatherService");
const NotificationService = require("../services/notificationService");
const notificationService = new NotificationService();
const newsService = require("../services/newsService");
const socialService = require("../services/socialService");
const router = express.Router();
// Public route: Get a single flood report by ID (for citizen portal)
router.get("/public/:id", async (req, res) => {
  try {
    const floodReport = await FloodReport.findById(req.params.id).populate(
      "reportedBy",
      "name trustScore role"
    );
    if (!floodReport) {
      return res.status(404).json({ message: "Flood report not found" });
    }
    res.status(200).json(floodReport);
  } catch (error) {
    console.error("Error fetching public single flood report:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get flood reports (public endpoint with optional filters)
router.get(
  "/",
  [
    query("status")
      .optional()
      .isIn(["verified", "pending"])
      .withMessage("Invalid report status"),
    query("severity")
      .optional()
      .isIn(["low", "medium", "high", "critical"])
      .withMessage("Invalid severity level"),
    query("district")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("District cannot be empty"),
    query("state")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("State cannot be empty"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .toInt()
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .toInt()
      .withMessage("Limit must be between 1 and 50"),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "severity", "waterLevel", "urgencyLevel", "newest"])
      .withMessage("Invalid sort by field"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Invalid sort order"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        status,
        severity,
        district,
        state,
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Build filter - only show verified reports for public access
      const filter = { verificationStatus: "verified" };

      if (status && status === "verified") filter.verificationStatus = status;
      if (severity) filter.severity = severity;
      if (district) filter["location.district"] = new RegExp(district, "i");
      if (state) filter["location.state"] = new RegExp(state, "i");

      // Handle "newest" sortBy alias
      const actualSortBy = sortBy === "newest" ? "createdAt" : sortBy;
      const sort = {};
      sort[actualSortBy] = sortOrder === "desc" ? -1 : 1;

      const floodReports = await FloodReport.find(filter)
        .populate("reportedBy", "name trustScore")
        .select("-verification -weatherConditions") // Hide sensitive verification data
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);

      const totalReports = await FloodReport.countDocuments(filter);

      res.status(200).json({
        reports: floodReports,
        currentPage: page,
        totalPages: Math.ceil(totalReports / limit),
        totalReports,
      });
    } catch (error) {
      console.error("Error fetching public flood reports:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Submit new flood report
router.post(
  "/",
  auth,
  upload.array("media", 5),
  [
    body("depth")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Depth must be a non-negative number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { location, severity, waterLevel, description, depth } = req.body;
      const reportedBy = req.user.id || req.user._id;
      const mediaFiles = req.files ? req.files.map((file) => file.path) : [];

      // Debug location data structure
      console.log("📍 LOCATION DEBUG:", {
        locationRaw: location,
        locationType: typeof location,
        locationKeys: location ? Object.keys(location) : "null",
        coordinates: location?.coordinates,
        latitude: location?.latitude,
        longitude: location?.longitude,
        lat: location?.lat,
        lng: location?.lng,
        fullBody: req.body,
      });

      // Initialize default values for fast response
      let weatherConditions = {};
      let weatherVerification = { status: "pending", summary: "Processing..." };
      let newsVerification = { status: "pending", summary: "Processing..." };

      // Run external API calls in parallel with shorter timeouts for faster response
      const apiCalls = [];

      if (location && location.latitude && location.longitude) {
        const weatherPromise = Promise.race([
          weatherService
            .getCurrentWeather(location.latitude, location.longitude)
            .then((weatherData) => {
              weatherConditions = weatherData;
              return weatherService.getFloodRiskLevel(
                location.latitude,
                location.longitude,
                weatherData
              );
            })
            .then((floodRisk) => ({
              type: "weather",
              status: floodRisk.level === "unknown" ? "error" : "verified",
              summary: `Weather risk: ${floodRisk.level}`,
              snapshot: weatherConditions,
            })),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Weather API timeout")), 3000)
          ),
        ]).catch((error) => ({
          type: "weather",
          status: "error",
          summary: "Weather check unavailable",
        }));

        apiCalls.push(weatherPromise);
      }

      if (location && location.district && location.state) {
        const newsPromise = Promise.race([
          newsService
            .getFloodNews(
              `${location.district} ${location.state} flood`,
              location.district,
              new Date()
            )
            .then((newsData) => ({
              type: "news",
              status: newsData.status || "not-matched",
              summary: newsData.summary || "No relevant news found.",
              snapshot: newsData,
            })),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("News API timeout")), 3000)
          ),
        ]).catch((error) => ({
          type: "news",
          status: "error",
          summary: "News check unavailable",
        }));

        apiCalls.push(newsPromise);
      }

      // Wait for API calls with overall timeout of 5 seconds max
      if (apiCalls.length > 0) {
        try {
          const results = await Promise.race([
            Promise.allSettled(apiCalls),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Overall API timeout")), 5000)
            ),
          ]);

          results.forEach((result) => {
            if (result.status === "fulfilled" && result.value) {
              if (result.value.type === "weather") {
                weatherVerification = result.value;
              } else if (result.value.type === "news") {
                newsVerification = result.value;
              }
            }
          });
        } catch (error) {
          console.warn("API calls timed out, using defaults:", error.message);
          weatherVerification = {
            status: "pending",
            summary: "API unavailable",
          };
          newsVerification = { status: "pending", summary: "API unavailable" };
        }
      }

      // Fetch social media data (stubbed for Instagram)
      let socialVerification = {
        status: "coming-soon",
        summary: "Coming soon - Optional",
      };
      try {
        // Only call if access token is available and feature is enabled
        // if (process.env.VITE_INSTAGRAM_ACCESS_TOKEN) {
        //   const socialData = await socialService.getInstagramPosts(location.latitude, location.longitude);
        //   socialVerification = {
        //     status: socialData.status,
        //     summary: socialData.summary,
        //     snapshot: socialData.snapshot,
        //   };
        // }
      } catch (socialError) {
        console.warn("Could not fetch social media data:", socialError.message);
        socialVerification = {
          status: "error",
          summary: "Failed to fetch social media data",
        };
      }

      // Determine overall verification status
      let overallStatus = "pending";
      if (
        weatherVerification.status === "verified" ||
        newsVerification.status === "verified"
      ) {
        overallStatus = "verified";
      } else if (
        weatherVerification.status === "not-matched" &&
        newsVerification.status === "not-matched"
      ) {
        overallStatus = "not-matched";
      } else if (
        weatherVerification.status === "pending" &&
        newsVerification.status === "pending"
      ) {
        overallStatus = "manual-review";
      }

      // Handle different coordinate formats and ensure they're valid numbers
      let longitude, latitude;

      // Try to extract coordinates from various possible formats
      // Check all possible coordinate sources
      const possibleSources = [
        // Standard coordinates array
        location?.coordinates,
        // FormData array (location[coordinates][] becomes req.body['location[coordinates]'])
        req.body["location[coordinates]"],
        // Direct lat/lng fields
        location?.longitude !== undefined && location?.latitude !== undefined
          ? [location.longitude, location.latitude]
          : null,
        location?.lng !== undefined && location?.lat !== undefined
          ? [location.lng, location.lat]
          : null,
        // Check if coordinates are in a different structure
        req.body.coordinates,
        // Direct coordinate fields in body
        req.body.longitude !== undefined && req.body.latitude !== undefined
          ? [req.body.longitude, req.body.latitude]
          : null,
      ];

      // Find the first valid coordinate pair
      for (const coords of possibleSources) {
        if (coords && Array.isArray(coords) && coords.length >= 2) {
          const lng = parseFloat(coords[0]);
          const lat = parseFloat(coords[1]);
          if (!isNaN(lng) && !isNaN(lat)) {
            longitude = lng;
            latitude = lat;
            break;
          }
        }
      }

      // Validate coordinates
      if (
        isNaN(longitude) ||
        isNaN(latitude) ||
        longitude === null ||
        latitude === null
      ) {
        console.error("❌ INVALID COORDINATES:", {
          longitude,
          latitude,
          location,
        });
        return res.status(400).json({
          message: "Invalid coordinates provided",
          error: "Latitude and longitude must be valid numbers",
        });
      }

      console.log("✅ VALID COORDINATES:", { longitude, latitude });

      const newReport = new FloodReport({
        reportedBy,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
          address: location.address,
          district: location.district,
          state: location.state,
          landmark: location.landmark,
        },
        severity,
        waterLevel,
        depth: depth || 0, // Ensure depth is set, default to 0 if not provided
        description,
        mediaFiles,
        weatherConditions,
        verification: {
          status: overallStatus,
          summary: `Weather: ${weatherVerification.summary}, News: ${newsVerification.summary}`,
          weather: weatherVerification,
          news: newsVerification,
          social: socialVerification,
        },
        urgencyLevel: calculateUrgencyLevel(severity, waterLevel, {}), // Initial urgency
      });

      await newReport.save();
      console.log("✅ Flood report saved to MongoDB:", newReport._id);

      // Send notifications to relevant rescuers/admins
      // TODO: Implement proper notification service for new flood reports
      // Currently commented out to prevent timeout issues
      // notificationService.sendNotificationToRescuers({...});

      res.status(201).json(newReport);
    } catch (error) {
      console.error("❌ FLOOD REPORT SUBMISSION ERROR:", {
        message: error.message,
        name: error.name,
        stack: error.stack?.split("\n").slice(0, 5).join("\n"),
        requestData: {
          severity: req.body.severity,
          waterLevel: req.body.waterLevel,
          location: req.body.location,
          hasFiles: req.files?.length > 0,
          userId: req.user?.id || req.user?._id,
        },
      });
      res.status(500).json({ message: "Server error", details: error.message });
    }
  }
);

// Get flood reports with optional filters (for admin/moderation)
router.get(
  "/admin",
  auth,
  roleAuth(["admin", "municipality"]),
  [
    query("status")
      .optional()
      .isIn(["pending", "verified", "rejected", "disputed"])
      .withMessage("Invalid report status"),
    query("severity")
      .optional()
      .isIn(["low", "medium", "high", "critical"])
      .withMessage("Invalid severity level"),
    query("district")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("District cannot be empty"),
    query("state")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("State cannot be empty"),
    query("startDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Invalid start date"),
    query("endDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Invalid end date"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .toInt()
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .toInt()
      .withMessage("Limit must be between 1 and 100"),
    query("sortBy")
      .optional()
      .isIn(["createdAt", "severity", "waterLevel", "urgencyLevel"])
      .withMessage("Invalid sort by field"),
    query("sortOrder")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Invalid sort order"),
    query("minDepth")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Min depth must be a non-negative number"),
    query("maxDepth")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Max depth must be a non-negative number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        status,
        severity,
        district,
        state,
        startDate,
        endDate,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        minDepth,
        maxDepth,
      } = req.query;
      const filter = {};
      if (status) filter.verificationStatus = status;
      if (severity) filter.severity = severity;
      if (district) filter["location.district"] = new RegExp(district, "i");
      if (state) filter["location.state"] = new RegExp(state, "i");
      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = startDate;
        if (endDate) filter.createdAt.$lte = endDate;
      }
      if (minDepth || maxDepth) {
        filter.depth = {};
        if (minDepth) filter.depth.$gte = parseFloat(minDepth);
        if (maxDepth) filter.depth.$lte = parseFloat(maxDepth);
      }
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
      const floodReports = await FloodReport.find(filter)
        .populate("reportedBy", "name trustScore role")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);

      // Add 'status' field to each report for frontend compatibility
      const reportsWithStatus = floodReports.map((report) => {
        const r = report.toObject();
        r.status = r.verificationStatus;
        return r;
      });

      const totalReports = await FloodReport.countDocuments(filter);
      res.status(200).json({
        reports: reportsWithStatus,
        currentPage: page,
        totalPages: Math.ceil(totalReports / limit),
        totalReports,
      });
    } catch (error) {
      console.error("Error fetching flood reports:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Moderate a flood report (update status)
router.put(
  "/:id/status",
  auth,
  roleAuth(["admin", "municipality"]),
  [
    body("status")
      .isIn(["verified", "rejected", "disputed"])
      .withMessage("Invalid status for moderation"),
  ],
  async (req, res) => {
    try {
      console.log("[MODERATE REPORT] Params:", req.params);
      console.log("[MODERATE REPORT] Body:", req.body);
      console.log("[MODERATE REPORT] User:", req.user);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.error("[MODERATE REPORT] Validation errors:", errors.array());
        return res.status(400).json({ errors: errors.array() });
      }
      const { id } = req.params;
      const { status, reason } = req.body;
      const moderatorId = req.user.userId;
      const floodReport = await FloodReport.findById(id);
      if (!floodReport) {
        console.error(`[MODERATE REPORT] Flood report not found for id: ${id}`);
        return res.status(404).json({ message: "Flood report not found" });
      }
      floodReport.verificationStatus = status;
      floodReport.moderatedBy = moderatorId;
      floodReport.moderationDate = new Date();
      if (reason) floodReport.moderationReason = reason;
      await floodReport.save();
      // Notify the user who reported it about the moderation decision
      try {
        await notificationService.createInAppNotification({
          recipient: floodReport.reportedBy,
          title: `Flood Report Moderated`,
          message: `Your flood report in ${floodReport.location.district} has been ${status}.`,
          type: "info",
          link: `/reports/${floodReport._id}`,
          relatedItem: {
            type: "floodReport",
            id: floodReport._id,
          },
        });
      } catch (notifyErr) {
        console.error("[MODERATE REPORT] Notification error:", notifyErr);
      }
      res.status(200).json({
        message: `Report ${id} status updated to ${status}`,
        floodReport,
      });
    } catch (error) {
      console.error("[MODERATE REPORT] Unhandled error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// Update a flood report (e.g., add more info, media) - potentially by reporter or admin
router.put(
  "/:id",
  auth,
  roleAuth(["admin", "municipality"]),
  upload.array("media", 5),
  [
    body("severity")
      .optional()
      .isIn(["low", "medium", "high", "critical"])
      .withMessage("Valid severity required"),
    body("waterLevel")
      .optional()
      .isIn([
        "ankle-deep",
        "knee-deep",
        "waist-deep",
        "chest-deep",
        "above-head",
      ])
      .withMessage("Valid water level required"),
    body("depth")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Depth must be a non-negative number"),
    body("description")
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Description must be 10-1000 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { id } = req.params;
      const updateFields = req.body;
      const floodReport = await FloodReport.findById(id);
      if (!floodReport) {
        return res.status(404).json({ message: "Flood report not found" });
      }
      // Only allow reporter or admin/official to update
      if (
        floodReport.reportedBy.toString() !== req.user.userId &&
        !req.user.roles.includes("admin") &&
        !req.user.roles.includes("official")
      ) {
        return res
          .status(403)
          .json({ message: "Unauthorized to update this report" });
      }
      // Handle media files if new ones are uploaded
      if (req.files && req.files.length > 0) {
        const newMediaFiles = req.files.map(
          (file) => file.secure_url || file.path
        );
        floodReport.mediaFiles = [...floodReport.mediaFiles, ...newMediaFiles];
      }
      // Update allowed fields
      const allowedFields = [
        "severity",
        "waterLevel",
        "depth", // Add depth to allowed fields
        "description",
        "impact",
        "weatherConditions",
        "tags",
      ];
      for (const field of allowedFields) {
        if (updateFields[field] !== undefined) {
          // Special handling for JSON fields if they come as strings
          if (
            ["impact", "weatherConditions", "tags"].includes(field) &&
            typeof updateFields[field] === "string"
          ) {
            try {
              floodReport[field] = JSON.parse(updateFields[field]);
            } catch (e) {
              console.log(`Invalid ${field} JSON:`, e.message);
            }
          } else {
            floodReport[field] = updateFields[field];
          }
        }
      }
      await floodReport.save();
      res.status(200).json(floodReport);
    } catch (error) {
      console.error("Error updating flood report:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get a single flood report by ID
router.get(
  "/:id",
  auth,
  roleAuth(["admin", "municipality"]),
  async (req, res) => {
    try {
      const floodReport = await FloodReport.findById(req.params.id).populate(
        "reportedBy",
        "name trustScore role"
      );
      if (!floodReport) {
        return res.status(404).json({ message: "Flood report not found" });
      }
      res.status(200).json(floodReport);
    } catch (error) {
      console.error("Error fetching single flood report:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Helper function to calculate urgency level (can be expanded)
const calculateUrgencyLevel = (severity, waterLevel, impact) => {
  let urgency = 0;
  switch (severity) {
    case "low":
      urgency += 1;
      break;
    case "medium":
      urgency += 3;
      break;
    case "high":
      urgency += 5;
      break;
    case "critical":
      urgency += 7;
      break;
  }
  switch (waterLevel) {
    case "ankle-deep":
      urgency += 1;
      break;
    case "knee-deep":
      urgency += 2;
      break;
    case "waist-deep":
      urgency += 3;
      break;
    case "chest-deep":
      urgency += 4;
      break;
    case "above-head":
      urgency += 5;
      break;
  }
  if (impact && impact.infrastructuralDamage) urgency += 2;
  if (impact && impact.displacedPeople > 0) urgency += 3;
  if (impact && impact.casualties > 0) urgency += 5;
  return Math.min(urgency, 15); // Cap urgency at a max value
};

// Admin route to generate mock flood reports
router.post(
  "/admin/generate-mock-reports",
  auth,
  roleAuth(["admin"]),
  [
    body("count")
      .isInt({ min: 1, max: 100 })
      .withMessage("Count must be a number between 1 and 100"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { count } = req.body;
    const mockReports = [];
    const cities = [
      "Quezon City",
      "Manila",
      "Davao City",
      "Cebu City",
      "Makati",
    ];
    const districts = [
      "District A",
      "District B",
      "District C",
      "District D",
      "District E",
    ];
    const severities = ["low", "medium", "high", "critical"];
    const waterLevels = [
      "ankle-deep",
      "knee-deep",
      "waist-deep",
      "chest-deep",
      "above-head",
    ];
    const verificationStatuses = ["pending", "verified", "rejected"];
    const descriptions = [
      "Heavy rainfall caused localized flooding in low-lying areas.",
      "Flash flood observed near the river bank, rapidly rising water levels.",
      "Residential areas affected by stagnant water, minor damage reported.",
      "Major roads impassable due to deep floodwaters, evacuation ongoing.",
      "Water level rising consistently, power outages in several blocks.",
      "Community clean-up operations started as floodwaters recede.",
      "Emergency services deployed to assist trapped residents.",
      "Agricultural lands submerged, significant crop damage expected.",
      "Bridge collapsed due to strong currents, isolating communities.",
      "Schools closed as classrooms are inundated with floodwaters.",
    ];
    try {
      const users = await User.find({ role: { $in: ["user", "rescuer"] } });
      if (users.length === 0) {
        return res
          .status(400)
          .json({ message: "No users found to assign to mock reports." });
      }
      for (let i = 0; i < count; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        const randomDistrict =
          districts[Math.floor(Math.random() * districts.length)];
        const randomSeverity =
          severities[Math.floor(Math.random() * severities.length)];
        const randomWaterLevel =
          waterLevels[Math.floor(Math.random() * waterLevels.length)];
        const randomVerificationStatus =
          verificationStatuses[
            Math.floor(Math.random() * verificationStatuses.length)
          ];
        const randomDescription =
          descriptions[Math.floor(Math.random() * descriptions.length)];
        const newReport = new FloodReport({
          reportedBy: randomUser._id,
          location: {
            latitude: parseFloat((Math.random() * (15 - 14) + 14).toFixed(6)), // Example lat for Philippines
            longitude: parseFloat(
              (Math.random() * (121 - 120) + 120).toFixed(6)
            ), // Example lon for Philippines
            address: `Mock Address ${i}, ${randomDistrict}, ${randomCity}`,
            district: randomDistrict,
            city: randomCity,
            state: "Metro Manila", // Assuming for now
            country: "Philippines",
            zipCode: "1000",
          },
          severity: randomSeverity,
          waterLevel: randomWaterLevel,
          description: randomDescription,
          mediaFiles: [], // No mock media for simplicity
          weatherConditions: {
            temperature: Math.floor(Math.random() * (35 - 25) + 25),
            condition: "Rainy",
          },
          impact: {
            infrastructuralDamage: Math.random() > 0.5,
            displacedPeople: Math.floor(Math.random() * 100),
            casualties: Math.floor(Math.random() * 5),
          },
          verificationStatus: randomVerificationStatus,
          urgencyLevel: calculateUrgencyLevel(
            randomSeverity,
            randomWaterLevel,
            {
              infrastructuralDamage: Math.random() > 0.5,
              displacedPeople: Math.floor(Math.random() * 100),
              casualties: Math.floor(Math.random() * 5),
            }
          ),
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ), // Up to 30 days ago
          updatedAt: new Date(),
        });
        mockReports.push(newReport);
      }
      await FloodReport.insertMany(mockReports);
      res.status(201).json({
        message: `${count} mock flood reports generated successfully.`,
        generatedCount: mockReports.length,
      });
    } catch (error) {
      console.error("Error generating mock flood reports:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
