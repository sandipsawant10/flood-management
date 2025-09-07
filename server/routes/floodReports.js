const express = require("express");
const { body, query, validationResult } = require("express-validator");
const FloodReport = require("../models/FloodReport");
const User = require("../models/User");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const weatherService = require("../services/weatherService");
const router = express.Router();

// Submit new flood report
router.post(
  "/",
  auth,
  upload.array("media", 5),
  [
    body("location.coordinates")
      .isArray({ min: 2, max: 2 })
      .withMessage("Valid coordinates required"),
    body("location.district")
      .trim()
      .notEmpty()
      .withMessage("District is required"),
    body("location.state").trim().notEmpty().withMessage("State is required"),
    body("severity")
      .isIn(["low", "medium", "high", "critical"])
      .withMessage("Valid severity required"),
    body("waterLevel")
      .isIn([
        "ankle-deep",
        "knee-deep",
        "waist-deep",
        "chest-deep",
        "above-head",
      ])
      .withMessage("Valid water level required"),
    body("description")
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

      const {
        location,
        severity,
        waterLevel,
        description,
        impact,
        weatherConditions,
        tags,
      } = req.body;

      // Get media file URLs from upload middleware
      const mediaFiles = req.files
        ? req.files.map((file) => file.secure_url || file.path)
        : [];

      // Parse JSON strings if they exist
      let parsedImpact = {};
      let parsedWeatherConditions = {};
      let parsedTags = [];

      try {
        if (impact && typeof impact === "string") {
          parsedImpact = JSON.parse(impact);
        } else if (impact && typeof impact === "object") {
          parsedImpact = impact;
        }
      } catch (e) {
        console.log("Invalid impact JSON:", e.message);
      }

      try {
        if (weatherConditions && typeof weatherConditions === "string") {
          parsedWeatherConditions = JSON.parse(weatherConditions);
        } else if (weatherConditions && typeof weatherConditions === "object") {
          parsedWeatherConditions = weatherConditions;
        }
      } catch (e) {
        console.log("Invalid weather conditions JSON:", e.message);
      }

      try {
        if (tags && typeof tags === "string") {
          parsedTags = JSON.parse(tags);
        } else if (Array.isArray(tags)) {
          parsedTags = tags;
        }
      } catch (e) {
        console.log("Invalid tags JSON:", e.message);
      }

      // Calculate urgency level
      const urgencyLevel = calculateUrgencyLevel(
        severity,
        waterLevel,
        parsedImpact
      );

      // Create flood report
      const floodReport = new FloodReport({
        reportedBy: req.user.userId,
        location: {
          type: "Point",
          coordinates: location.coordinates,
          address: location.address || "",
          district: location.district,
          state: location.state,
          landmark: location.landmark || "",
        },
        severity,
        waterLevel,
        description,
        mediaFiles,
        impact: parsedImpact,
        weatherConditions: parsedWeatherConditions,
        tags: parsedTags,
        urgencyLevel,
      });

      // Try to get weather data from API, but don't fail if unavailable
      try {
        const weather = await weatherService.getCurrentWeather(
          location.coordinates[1], // latitude
          location.coordinates[0] // longitude
        );

        if (weather && weather.temperature !== undefined) {
          // Merge API weather data with user-provided data
          floodReport.weatherConditions = {
            ...parsedWeatherConditions, // User provided data takes precedence
            temperature:
              parsedWeatherConditions.temperature || weather.temperature,
            humidity: parsedWeatherConditions.humidity || weather.humidity,
            precipitation:
              parsedWeatherConditions.precipitation || weather.precipitation,
            windSpeed: parsedWeatherConditions.windSpeed || weather.windSpeed,
            source: weather.source || "API",
          };
        }
      } catch (weatherError) {
        console.log(
          "Weather data unavailable, continuing without it:",
          weatherError.message
        );
        // Keep user-provided weather data if API fails
        floodReport.weatherConditions = parsedWeatherConditions;
      }

      // AI validation simulation (you can implement actual AI validation later)
      try {
        const aiResult = await simulateAIValidation({
          description,
          mediaFiles,
          location,
          severity,
        });

        floodReport.aiConfidence = aiResult.confidence;
        floodReport.predictedSeverity = aiResult.predictedSeverity;

        if (aiResult.confidence < 0.3) {
          floodReport.verificationStatus = "disputed";
        }
      } catch (aiError) {
        console.log("AI validation failed:", aiError.message);
        // Set default confidence
        floodReport.aiConfidence = 0.7;
        floodReport.predictedSeverity = severity;
      }

      // Save the flood report
      await floodReport.save();

      // Populate the reportedBy field for response
      await floodReport.populate("reportedBy", "name trustScore role");

      // Update user report count
      await User.findByIdAndUpdate(req.user.userId, {
        $inc: { reportsSubmitted: 1 },
      });

      // Emit real-time notification to nearby users if socket.io is available
      if (req.io) {
        const locationKey = `location-${location.district}-${location.state}`;
        req.io.to(locationKey).emit("new-flood-report", {
          id: floodReport._id,
          location: floodReport.location,
          severity: floodReport.severity,
          waterLevel: floodReport.waterLevel,
          description: floodReport.description,
          reportedBy: floodReport.reportedBy.name,
          timestamp: floodReport.createdAt,
          urgencyLevel: floodReport.urgencyLevel,
        });

        // Trigger automated alert if severity is high/critical
        if (["high", "critical"].includes(severity)) {
          req.io.to(locationKey).emit("flood-alert", {
            type: "emergency",
            severity: severity,
            message: `${severity.toUpperCase()} severity flood reported in ${
              location.district
            }, ${location.state}`,
            reportId: floodReport._id,
            location: floodReport.location,
            urgencyLevel: floodReport.urgencyLevel,
          });
        }
      }

      // Return success response
      res.status(201).json({
        success: true,
        message: "Flood report submitted successfully",
        report: {
          id: floodReport._id,
          severity: floodReport.severity,
          waterLevel: floodReport.waterLevel,
          location: floodReport.location,
          description: floodReport.description,
          verificationStatus: floodReport.verificationStatus,
          urgencyLevel: floodReport.urgencyLevel,
          createdAt: floodReport.createdAt,
          reportedBy: {
            name: floodReport.reportedBy.name,
            trustScore: floodReport.reportedBy.trustScore,
          },
          weatherConditions: floodReport.weatherConditions,
          aiConfidence: floodReport.aiConfidence,
        },
      });
    } catch (error) {
      console.error("Submit report error:", error);
      res.status(500).json({
        success: false,
        message: "Server error submitting report",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// Get flood reports with filtering and pagination
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).toInt(),
    query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
    query("severity").optional().isIn(["low", "medium", "high", "critical"]),
    query("district").optional().trim(),
    query("state").optional().trim(),
    query("status")
      .optional()
      .isIn(["pending", "verified", "disputed", "false"]),
    query("lat").optional().isFloat(),
    query("lng").optional().isFloat(),
    query("radius").optional().isFloat({ min: 0.1, max: 100 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const page = req.query.page || 1;
      const limit = req.query.limit || 20;
      const skip = (page - 1) * limit;

      // Build query filters
      const filters = { isActive: true };

      if (req.query.severity) {
        filters.severity = req.query.severity;
      }

      if (req.query.district) {
        filters["location.district"] = new RegExp(req.query.district, "i");
      }

      if (req.query.state) {
        filters["location.state"] = new RegExp(req.query.state, "i");
      }

      if (req.query.status) {
        filters.verificationStatus = req.query.status;
      }

      // Geospatial query for nearby reports
      if (req.query.lat && req.query.lng) {
        const radius = req.query.radius || 10; // Default 10km radius
        filters.location = {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [
                parseFloat(req.query.lng),
                parseFloat(req.query.lat),
              ],
            },
            $maxDistance: radius * 1000, // Convert km to meters
          },
        };
      }

      // Execute query with pagination
      const reports = await FloodReport.find(filters)
        .populate("reportedBy", "name trustScore role location")
        .populate("verifiedBy", "name role")
        .sort({ createdAt: -1, urgencyLevel: -1 }) // Sort by newest and highest urgency first
        .skip(skip)
        .limit(limit);

      const total = await FloodReport.countDocuments(filters);

      // Calculate statistics
      const stats = await FloodReport.aggregate([
        { $match: filters },
        {
          $group: {
            _id: null,
            totalReports: { $sum: 1 },
            severityBreakdown: {
              $push: "$severity",
            },
            avgUrgency: { $avg: "$urgencyLevel" },
            verifiedReports: {
              $sum: {
                $cond: [{ $eq: ["$verificationStatus", "verified"] }, 1, 0],
              },
            },
          },
        },
      ]);

      res.json({
        success: true,
        reports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        stats: stats[0] || {
          totalReports: 0,
          severityBreakdown: [],
          avgUrgency: 0,
          verifiedReports: 0,
        },
      });
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({
        success: false,
        message: "Server error fetching reports",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// Get single flood report by ID
router.get("/:id", async (req, res) => {
  try {
    const report = await FloodReport.findById(req.params.id)
      .populate("reportedBy", "name trustScore role location createdAt")
      .populate("verifiedBy", "name role")
      .populate("communityVotes.voters.user", "name trustScore");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Increment view count (optional)
    report.views = (report.views || 0) + 1;
    await report.save();

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching report",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Vote on flood report (community validation)
router.post(
  "/:id/vote",
  auth,
  [body("vote").isIn(["up", "down"]).withMessage("Vote must be up or down")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const report = await FloodReport.findById(req.params.id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        });
      }

      // Check if user already voted
      const existingVoteIndex = report.communityVotes.voters.findIndex(
        (voter) => voter.user.toString() === req.user.userId
      );

      if (existingVoteIndex !== -1) {
        // Update existing vote
        const existingVote = report.communityVotes.voters[existingVoteIndex];

        if (existingVote.vote !== req.body.vote) {
          // Change vote direction
          if (existingVote.vote === "up") {
            report.communityVotes.upvotes -= 1;
            report.communityVotes.downvotes += 1;
          } else {
            report.communityVotes.downvotes -= 1;
            report.communityVotes.upvotes += 1;
          }
          existingVote.vote = req.body.vote;
        } else {
          return res.status(400).json({
            success: false,
            message: "You have already voted this way on this report",
          });
        }
      } else {
        // New vote
        if (req.body.vote === "up") {
          report.communityVotes.upvotes += 1;
        } else {
          report.communityVotes.downvotes += 1;
        }

        report.communityVotes.voters.push({
          user: req.user.userId,
          vote: req.body.vote,
          votedAt: new Date(),
        });
      }

      await report.save();

      // Update reporter's trust score based on community feedback
      const totalVotes =
        report.communityVotes.upvotes + report.communityVotes.downvotes;
      if (totalVotes >= 5) {
        // Minimum votes threshold
        const positiveRatio = report.communityVotes.upvotes / totalVotes;
        const reporter = await User.findById(report.reportedBy);

        if (reporter) {
          if (positiveRatio >= 0.8) {
            reporter.trustScore = Math.min(1000, reporter.trustScore + 5);
          } else if (positiveRatio <= 0.2) {
            reporter.trustScore = Math.max(0, reporter.trustScore - 10);
          }
          await reporter.save();
        }
      }

      res.json({
        success: true,
        message: "Vote recorded successfully",
        votes: {
          upvotes: report.communityVotes.upvotes,
          downvotes: report.communityVotes.downvotes,
          totalVotes:
            report.communityVotes.upvotes + report.communityVotes.downvotes,
        },
      });
    } catch (error) {
      console.error("Vote error:", error);
      res.status(500).json({
        success: false,
        message: "Server error recording vote",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// Verify flood report (officials only)
router.put(
  "/:id/verify",
  auth,
  [
    body("status")
      .isIn(["verified", "disputed", "false"])
      .withMessage("Valid status required"),
    body("notes").optional().trim().isLength({ max: 500 }),
  ],
  async (req, res) => {
    try {
      // Check if user has verification permissions
      const user = await User.findById(req.user.userId);
      if (!["official", "admin"].includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions to verify reports",
        });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const report = await FloodReport.findById(req.params.id);
      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        });
      }

      const previousStatus = report.verificationStatus;
      report.verificationStatus = req.body.status;
      report.verifiedBy = req.user.userId;
      report.verificationNotes = req.body.notes || "";
      report.verifiedAt = new Date();

      await report.save();

      // Update reporter's trust score and verified reports count
      const reporter = await User.findById(report.reportedBy);
      if (reporter) {
        if (req.body.status === "verified" && previousStatus !== "verified") {
          reporter.trustScore = Math.min(1000, reporter.trustScore + 15);
          reporter.verifiedReports += 1;
        } else if (req.body.status === "false") {
          reporter.trustScore = Math.max(0, reporter.trustScore - 25);
        }
        await reporter.save();
      }

      res.json({
        success: true,
        message: "Report verification updated successfully",
        report: {
          id: report._id,
          verificationStatus: report.verificationStatus,
          verifiedBy: user.name,
          verificationNotes: report.verificationNotes,
          verifiedAt: report.verifiedAt,
        },
      });
    } catch (error) {
      console.error("Verify report error:", error);
      res.status(500).json({
        success: false,
        message: "Server error verifying report",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  }
);

// Helper function to calculate urgency level
function calculateUrgencyLevel(severity, waterLevel, impact) {
  let urgency = 5; // Base level

  // Severity impact
  const severityWeights = { low: 1, medium: 2, high: 3, critical: 4 };
  urgency += severityWeights[severity] || 0;

  // Water level impact
  const waterLevelWeights = {
    "ankle-deep": 1,
    "knee-deep": 2,
    "waist-deep": 3,
    "chest-deep": 4,
    "above-head": 5,
  };
  urgency += waterLevelWeights[waterLevel] || 0;

  // Impact factors
  if (impact && typeof impact === "object") {
    if (impact.affectedPeople > 100) urgency += 1;
    if (impact.affectedPeople > 1000) urgency += 1;
    if (impact.blockedRoads && impact.blockedRoads.length > 0) urgency += 1;
    if (impact.damagedProperties > 10) urgency += 1;
  }

  return Math.min(10, Math.max(1, urgency));
}

// Simulate AI validation (replace with actual AI service later)
async function simulateAIValidation({
  description,
  mediaFiles,
  location,
  severity,
}) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple keyword-based validation simulation
      const floodKeywords = [
        "flood",
        "water",
        "rain",
        "submerged",
        "overflow",
        "inundated",
      ];
      const hasFloodKeywords = floodKeywords.some((keyword) =>
        description.toLowerCase().includes(keyword)
      );

      let confidence = 0.5;

      if (hasFloodKeywords) confidence += 0.3;
      if (mediaFiles && mediaFiles.length > 0) confidence += 0.2;
      if (location && location.coordinates) confidence += 0.1;

      // Add some randomness
      confidence += (Math.random() - 0.5) * 0.2;
      confidence = Math.max(0, Math.min(1, confidence));

      resolve({
        confidence,
        predictedSeverity: severity,
        validationNotes: hasFloodKeywords
          ? "Contains relevant flood indicators"
          : "Limited flood indicators detected",
      });
    }, 500); // Simulate API delay
  });
}

// Debug route: Get all flood reports
router.get("/debug/all", async (req, res) => {
  try {
    const reports = await FloodReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
