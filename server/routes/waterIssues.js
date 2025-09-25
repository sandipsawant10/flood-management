const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const { cloudinaryUpload } = require("../middleware/upload");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const WaterIssue = require("../models/WaterIssue");

const upload = multer({ storage: multer.memoryStorage() });

/**
 * @route   POST /api/water-issues
 * @desc    Create a new water issue report
 * @access  Private
 */
router.post("/", auth, upload.array("media", 5), async (req, res) => {
  try {
    let mediaUrls = [];

    // Upload images to Cloudinary if any
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => {
        return cloudinaryUpload(file.buffer, "water_issues");
      });
      mediaUrls = await Promise.all(uploadPromises);
    }

    // Create GeoJSON point from coordinates
    let locationObj = JSON.parse(JSON.stringify(req.body.location || {}));
    if (Array.isArray(req.body.location?.coordinates)) {
      locationObj.type = "Point";
      locationObj.coordinates = req.body.location.coordinates.map(Number);
    } else if (
      req.body.location?.coordinates?.[0] &&
      req.body.location?.coordinates?.[1]
    ) {
      locationObj.type = "Point";
      locationObj.coordinates = [
        Number(req.body.location.coordinates[0]),
        Number(req.body.location.coordinates[1]),
      ];
    }

    // Create water issue report
    const waterIssue = new WaterIssue({
      reportedBy: req.user.id,
      location: {
        type: "Point",
        coordinates: locationObj.coordinates || [0, 0],
        address: req.body.location?.address || "",
        district: req.body.location?.district || "",
        state: req.body.location?.state || "",
        landmark: req.body.location?.landmark || "",
        municipalWard: req.body.location?.municipalWard || "",
      },
      issueType: req.body.issueType,
      issueDetails: {
        // Parse issueDetails based on the type of water issue
        duration: req.body.issueDetails?.duration,
        frequency: req.body.issueDetails?.frequency,
        colorAbnormality: req.body.issueDetails?.colorAbnormality,
        odorAbnormality: req.body.issueDetails?.odorAbnormality === "true",
        tasteAbnormality: req.body.issueDetails?.tasteAbnormality === "true",
        infrastructureType: req.body.issueDetails?.infrastructureType,
        affectedPopulation: req.body.issueDetails?.affectedPopulation,
      },
      severity: req.body.severity,
      description: req.body.description,
      mediaFiles: mediaUrls,
      urgencyLevel: Number(req.body.urgencyLevel || 5),
      tags: req.body.tags
        ? Array.isArray(req.body.tags)
          ? req.body.tags
          : [req.body.tags]
        : [],
    });

    await waterIssue.save();

    // Prepare response
    return res.status(201).json({
      success: true,
      data: waterIssue,
      message: "Water issue report submitted successfully",
    });
  } catch (err) {
    console.error("Error submitting water issue report:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Error submitting water issue report",
    });
  }
});

/**
 * @route   GET /api/water-issues
 * @desc    Get all water issues with filtering, sorting, and pagination
 * @access  Public
 */
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      district,
      state,
      issueType,
      severity,
      status,
      isActive,
      verificationStatus,
      startDate,
      endDate,
      lat,
      lng,
      radius, // in kilometers
      municipalWard,
    } = req.query;

    // Build query
    const query = {};

    // Active/inactive filter
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    // District and state filters
    if (district) query["location.district"] = district;
    if (state) query["location.state"] = state;
    if (municipalWard) query["location.municipalWard"] = municipalWard;

    // Issue type filter
    if (issueType) {
      if (Array.isArray(issueType)) {
        query.issueType = { $in: issueType };
      } else {
        query.issueType = issueType;
      }
    }

    // Severity filter
    if (severity) {
      if (Array.isArray(severity)) {
        query.severity = { $in: severity };
      } else {
        query.severity = severity;
      }
    }

    // Status filter
    if (status) {
      if (Array.isArray(status)) {
        query.status = { $in: status };
      } else {
        query.status = status;
      }
    }

    // Verification status filter
    if (verificationStatus) {
      if (Array.isArray(verificationStatus)) {
        query.verificationStatus = { $in: verificationStatus };
      } else {
        query.verificationStatus = verificationStatus;
      }
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Geospatial filter
    if (lat && lng && radius) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
        },
      };
    }

    // Execute query with pagination and sorting
    const total = await WaterIssue.countDocuments(query);
    const issues = await WaterIssue.find(query)
      .populate("reportedBy", "name email trustScore")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    return res.json({
      success: true,
      data: {
        issues,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error("Error fetching water issues:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Error fetching water issues",
    });
  }
});

/**
 * @route   GET /api/water-issues/:id
 * @desc    Get a single water issue by ID
 * @access  Public
 */
router.get("/:id", async (req, res) => {
  try {
    const issue = await WaterIssue.findById(req.params.id)
      .populate("reportedBy", "name email trustScore")
      .populate("verifiedBy", "name role")
      .populate("resolution.assignedTo", "name role");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Water issue not found",
      });
    }

    return res.json({
      success: true,
      data: issue,
    });
  } catch (err) {
    console.error("Error fetching water issue details:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Error fetching water issue details",
    });
  }
});

/**
 * @route   PUT /api/water-issues/:id
 * @desc    Update a water issue
 * @access  Private (Admin, Municipal, Reporter)
 */
router.put("/:id", auth, async (req, res) => {
  try {
    const issue = await WaterIssue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Water issue not found",
      });
    }

    // Check permissions - only allow update by the reporter or admin/municipal users
    const isReporter = issue.reportedBy.toString() === req.user.id;
    const isAdmin = req.user.role === "admin" || req.user.role === "municipal";

    if (!isReporter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this report",
      });
    }

    // Determine what fields can be updated based on user role
    const allowedUpdates = {};

    // Reporter can update basic details
    if (isReporter) {
      ["description", "severity", "issueDetails"].forEach((field) => {
        if (req.body[field] !== undefined) {
          allowedUpdates[field] = req.body[field];
        }
      });
    }

    // Admins can update everything including status
    if (isAdmin) {
      const adminUpdatableFields = [
        "status",
        "verificationStatus",
        "verificationNotes",
        "resolution",
        "municipalityResponse",
        "isActive",
        "tags",
        "waterQualityTest",
      ];

      adminUpdatableFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          allowedUpdates[field] = req.body[field];
        }
      });

      // If status is being changed to resolved, set resolvedAt
      if (
        req.body.status === "resolved" &&
        (!issue.resolution || !issue.resolution.resolvedAt)
      ) {
        allowedUpdates.resolution = {
          ...(issue.resolution || {}),
          ...(req.body.resolution || {}),
          resolvedAt: new Date(),
        };
      }

      // If setting verification status
      if (req.body.verificationStatus) {
        allowedUpdates.verifiedBy = req.user.id;
      }
    }

    // Apply the updates
    Object.keys(allowedUpdates).forEach((key) => {
      issue[key] = allowedUpdates[key];
    });

    await issue.save();

    return res.json({
      success: true,
      data: issue,
      message: "Water issue updated successfully",
    });
  } catch (err) {
    console.error("Error updating water issue:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Error updating water issue",
    });
  }
});

/**
 * @route   POST /api/water-issues/:id/vote
 * @desc    Vote on a water issue (upvote/downvote)
 * @access  Private
 */
router.post("/:id/vote", auth, async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'

    if (vote !== "up" && vote !== "down") {
      return res.status(400).json({
        success: false,
        message: 'Vote must be either "up" or "down"',
      });
    }

    const issue = await WaterIssue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Water issue not found",
      });
    }

    // Check if user has already voted
    const existingVoteIndex = issue.communityVotes.voters.findIndex(
      (v) => v.user.toString() === req.user.id
    );

    if (existingVoteIndex > -1) {
      const existingVote = issue.communityVotes.voters[existingVoteIndex].vote;

      // If same vote, remove vote
      if (existingVote === vote) {
        if (vote === "up") issue.communityVotes.upvotes--;
        else issue.communityVotes.downvotes--;

        issue.communityVotes.voters.splice(existingVoteIndex, 1);
      }
      // If different vote, update the vote
      else {
        if (vote === "up") {
          issue.communityVotes.upvotes++;
          issue.communityVotes.downvotes--;
        } else {
          issue.communityVotes.upvotes--;
          issue.communityVotes.downvotes++;
        }

        issue.communityVotes.voters[existingVoteIndex].vote = vote;
      }
    }
    // New vote
    else {
      if (vote === "up") issue.communityVotes.upvotes++;
      else issue.communityVotes.downvotes++;

      issue.communityVotes.voters.push({
        user: req.user.id,
        vote,
      });
    }

    await issue.save();

    return res.json({
      success: true,
      data: {
        upvotes: issue.communityVotes.upvotes,
        downvotes: issue.communityVotes.downvotes,
      },
      message: `Successfully ${vote}voted the water issue report`,
    });
  } catch (err) {
    console.error("Error voting on water issue:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Error voting on water issue",
    });
  }
});

/**
 * @route   POST /api/water-issues/:id/verify
 * @desc    Verify a water issue report (admin/municipal only)
 * @access  Private (Admin, Municipal)
 */
router.post(
  "/:id/verify",
  auth,
  roleAuth(["admin", "municipal"]),
  async (req, res) => {
    try {
      const { verificationStatus, verificationNotes } = req.body;

      const issue = await WaterIssue.findById(req.params.id);

      if (!issue) {
        return res.status(404).json({
          success: false,
          message: "Water issue not found",
        });
      }

      issue.verificationStatus = verificationStatus;
      issue.verificationNotes = verificationNotes;
      issue.verifiedBy = req.user.id;

      await issue.save();

      return res.json({
        success: true,
        data: issue,
        message: "Water issue verification status updated",
      });
    } catch (err) {
      console.error("Error verifying water issue:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Error verifying water issue",
      });
    }
  }
);

/**
 * @route   POST /api/water-issues/:id/municipality-response
 * @desc    Add a municipality response to a water issue
 * @access  Private (Admin, Municipal)
 */
router.post(
  "/:id/municipality-response",
  auth,
  roleAuth(["admin", "municipal"]),
  async (req, res) => {
    try {
      const {
        message,
        estimatedFixTime,
        actionTaken,
        contactPerson,
        contactNumber,
      } = req.body;

      const issue = await WaterIssue.findById(req.params.id);

      if (!issue) {
        return res.status(404).json({
          success: false,
          message: "Water issue not found",
        });
      }

      issue.municipalityResponse = {
        respondedAt: new Date(),
        message,
        estimatedFixTime: estimatedFixTime
          ? new Date(estimatedFixTime)
          : undefined,
        actionTaken,
        contactPerson,
        contactNumber,
      };

      // Update status to acknowledged if it's still in reported state
      if (issue.status === "reported") {
        issue.status = "acknowledged";
      }

      await issue.save();

      return res.json({
        success: true,
        data: issue,
        message: "Municipality response added successfully",
      });
    } catch (err) {
      console.error("Error adding municipality response:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Error adding municipality response",
      });
    }
  }
);

/**
 * @route   GET /api/water-issues/stats
 * @desc    Get statistics for water issues
 * @access  Public
 */
router.get("/stats/summary", async (req, res) => {
  try {
    const { district, state, startDate, endDate } = req.query;

    const matchCriteria = {};

    // Apply filters
    if (district) matchCriteria["location.district"] = district;
    if (state) matchCriteria["location.state"] = state;

    // Date filters
    if (startDate || endDate) {
      matchCriteria.createdAt = {};
      if (startDate) matchCriteria.createdAt.$gte = new Date(startDate);
      if (endDate) matchCriteria.createdAt.$lte = new Date(endDate);
    }

    const stats = await WaterIssue.aggregate([
      { $match: matchCriteria },
      {
        $facet: {
          // Count by issue type
          byIssueType: [
            { $group: { _id: "$issueType", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          // Count by status
          byStatus: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          // Count by severity
          bySeverity: [
            { $group: { _id: "$severity", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }, // Sort by severity level
          ],
          // Count by verification status
          byVerificationStatus: [
            { $group: { _id: "$verificationStatus", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          // Overall counts
          overview: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                resolved: {
                  $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
                },
                verified: {
                  $sum: {
                    $cond: [{ $eq: ["$verificationStatus", "verified"] }, 1, 0],
                  },
                },
                pending: {
                  $sum: { $cond: [{ $eq: ["$status", "reported"] }, 1, 0] },
                },
                active: {
                  $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                },
              },
            },
          ],
          // Timeline of reports
          timeline: [
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    return res.json({
      success: true,
      data: stats[0],
    });
  } catch (err) {
    console.error("Error fetching water issue statistics:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Error fetching water issue statistics",
    });
  }
});

/**
 * @route   DELETE /api/water-issues/:id
 * @desc    Delete a water issue (admin only)
 * @access  Private (Admin)
 */
router.delete("/:id", auth, roleAuth(["admin"]), async (req, res) => {
  try {
    const issue = await WaterIssue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Water issue not found",
      });
    }

    await issue.remove();

    return res.json({
      success: true,
      message: "Water issue deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting water issue:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Error deleting water issue",
    });
  }
});

module.exports = router;
