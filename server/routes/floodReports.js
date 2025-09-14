const express = require("express");
const { body, query, validationResult } = require("express-validator");
const FloodReport = require("../models/FloodReport");
const User = require("../models/User");
const { auth, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const roleAuth = require("../middleware/roleAuth");
const weatherService = require("../services/weatherService");
const notificationService = require("../services/notificationService");
const newsService = require("../services/newsService");
const socialService = require("../services/socialService");
const router = express.Router();

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
      const reportedBy = req.user.userId;
      const mediaFiles = req.files ? req.files.map((file) => file.path) : [];

      // Fetch weather data for the reported location
      let weatherConditions = {};
      let weatherVerification = { status: "pending", summary: "N/A" };
      if (location && location.latitude && location.longitude) {
        try {
          const weatherData = await weatherService.getCurrentWeather(
            location.latitude,
            location.longitude
          );
          weatherConditions = weatherData; // Store full weather data

          // Basic weather verification logic
          const floodRisk = await weatherService.getFloodRiskAssessment(
            location.latitude,
            location.longitude,
            weatherData
          );
          weatherVerification = {
            status: floodRisk.status,
            summary: floodRisk.summary,
            snapshot: weatherData, // Store the raw weather data
          };
        } catch (weatherError) {
          console.warn("Could not fetch weather data:", weatherError.message);
          weatherVerification = { status: "error", summary: "Failed to fetch weather data" };
        }
      }

      // Fetch news data for the reported location and time
      let newsVerification = { status: "pending", summary: "N/A" };
      try {
        if (location && location.district && location.state) {
          const newsData = await newsService.getFloodNews(
            `${location.district} ${location.state} flood`,
            location.district,
            new Date(newReport.createdAt)
          );
          if (newsData && newsData.articles && newsData.articles.length > 0) {
            newsVerification = {
              status: "verified",
              summary: `${newsData.articles.length} relevant news articles found.`, // Updated message
              snapshot: newsData, // Store the raw news data
            };
          } else {
            newsVerification = {
              status: "not-matched",
              summary: "No relevant news found.",
              snapshot: newsData, // Store the raw news data
            };
          }
        }
      } catch (newsError) {
        console.warn("Could not fetch news data:", newsError.message);
        newsVerification = { status: "error", summary: "Failed to fetch news data" };
      }

      // Fetch social media data (stubbed for Instagram)
      let socialVerification = { status: "coming-soon", summary: "Coming soon - Optional" };
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
        socialVerification = { status: "error", summary: "Failed to fetch social media data" };
      }

      // Determine overall verification status
      let overallStatus = "pending";
      if (weatherVerification.status === "verified" || newsVerification.status === "verified") {
        overallStatus = "verified";
      } else if (weatherVerification.status === "not-matched" && newsVerification.status === "not-matched") {
        overallStatus = "not-matched";
      } else if (weatherVerification.status === "pending" && newsVerification.status === "pending") {
        overallStatus = "manual-review";
      }

      const newReport = new FloodReport({
        reportedBy,
        location: {
          type: "Point",
          coordinates: [location.longitude, location.latitude],
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
          overallStatus: overallStatus,
          weather: weatherVerification,
          news: newsVerification,
          social: socialVerification,
        },
        urgencyLevel: calculateUrgencyLevel(severity, waterLevel, {}), // Initial urgency
      });

      await newReport.save();

      // Send notifications to relevant rescuers/admins
      notificationService.sendNotificationToRescuers({
        type: "new_report",
        message: `New flood report in ${location.district} - ${severity} severity.`,
        link: `/reports/${newReport._id}`,
        location: newReport.location.coordinates,
        severity: newReport.severity,
      });

      res.status(201).json(newReport);
    } catch (error) {
      console.error("Error submitting flood report:", error);
      res.status(500).json({ message: "Server error" });
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
      const totalReports = await FloodReport.countDocuments(filter);
      res.status(200).json({
        reports: floodReports,
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { id } = req.params;
      const { status, reason } = req.body;
      const moderatorId = req.user.userId;
      const floodReport = await FloodReport.findById(id);
      if (!floodReport) {
        return res.status(404).json({ message: "Flood report not found" });
      }
      floodReport.verificationStatus = status;
      floodReport.moderatedBy = moderatorId;
      floodReport.moderationDate = new Date();
      if (reason) floodReport.moderationReason = reason;
      await floodReport.save();
      // Notify the user who reported it about the moderation decision
      notificationService.sendNotification({
        recipient: floodReport.reportedBy,
        type: "report_moderated",
        message: `Your flood report in ${floodReport.location.district} has been ${status}.`,
        link: `/reports/${floodReport._id}`,
        relatedEntity: {
          kind: "FloodReport",
          item: floodReport._id,
        },
      });
      res
        .status(200)
        .json({
          message: `Report ${id} status updated to ${status}`,
          floodReport,
        });
    } catch (error) {
      console.error("Error moderating flood report:", error);
      res.status(500).json({ message: "Server error" });
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
      res
        .status(201)
        .json({
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
