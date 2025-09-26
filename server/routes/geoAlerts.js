const express = require("express");
const router = express.Router();
const { body, query, validationResult } = require("express-validator");
const { auth } = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const Alert = require("../models/Alert");

// Validation middleware
const validateNearbyAlertRequest = [
  query("lat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be between -90 and 90"),
  query("lng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be between -180 and 180"),
  query("radius")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("Radius must be between 1 and 200 kilometers"),
  query("status")
    .optional()
    .isIn(["active", "resolved", "expired"])
    .withMessage("Status must be active, resolved, or expired"),
];

/**
 * @route   GET /api/alerts/nearby
 * @desc    Get alerts near a specific location
 * @access  Public
 */
router.get("/nearby", validateNearbyAlertRequest, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { lat, lng, radius = 50, status = "active" } = req.query;

    // Build base query based on status
    let baseQuery = {};
    if (status === "active") {
      baseQuery.isActive = true;
      baseQuery.validUntil = { $gte: new Date() }; // Only include alerts that haven't expired
    } else if (status === "expired") {
      baseQuery.$or = [
        { isActive: false },
        { validUntil: { $lt: new Date() } },
      ];
    } else if (status === "resolved") {
      baseQuery.isActive = false;
    }

    let alerts = [];

    // If coordinates are provided, try geospatial query first
    if (lat && lng) {
      try {
        // Query for alerts with location data
        const geoQuery = {
          ...baseQuery,
          "location.coordinates": { $exists: true, $ne: null },
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)],
              },
              $maxDistance: parseInt(radius) * 1000, // Convert km to meters
            },
          },
        };

        alerts = await Alert.find(geoQuery)
          .sort({ priority: -1, createdAt: -1 })
          .limit(50)
          .lean();
      } catch (geoError) {
        console.log(
          "Geospatial query failed, falling back to basic query:",
          geoError.message
        );
        // Fallback to basic query without geospatial filtering
        alerts = await Alert.find(baseQuery)
          .sort({ priority: -1, createdAt: -1 })
          .limit(100)
          .lean();
      }
    } else {
      // No coordinates provided, get all alerts matching status
      alerts = await Alert.find(baseQuery)
        .sort({ priority: -1, createdAt: -1 })
        .limit(100)
        .lean();
    }

    // Calculate distances for each alert if coordinates were provided
    const alertsWithDistance = alerts.map((alert) => {
      if (lat && lng && alert.location && alert.location.coordinates) {
        try {
          // Calculate distance using Haversine formula
          const distance = calculateDistance(
            parseFloat(lat),
            parseFloat(lng),
            alert.location.coordinates[1], // lat
            alert.location.coordinates[0] // lng
          );

          return {
            ...alert,
            distance: Math.round(distance), // Distance in meters
          };
        } catch (distanceError) {
          console.log("Error calculating distance for alert:", alert._id);
          return alert;
        }
      }
      return alert;
    });

    // Sort by distance if coordinates were provided
    const sortedAlerts =
      lat && lng
        ? alertsWithDistance
            .filter((alert) => alert.distance !== undefined)
            .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity))
        : alertsWithDistance;

    return res.json({
      success: true,
      count: sortedAlerts.length,
      alerts: sortedAlerts,
      location:
        lat && lng
          ? {
              lat: parseFloat(lat),
              lng: parseFloat(lng),
              radius: parseInt(radius),
            }
          : null,
    });
  } catch (err) {
    console.error("Error getting nearby alerts:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching nearby alerts",
      error: err.message,
    });
  }
});

/**
 * Helper function to calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Temporarily commenting out affected-area route due to issues
 *
 * @route   GET /api/alerts/affected-area
 * @desc    Get users in affected area for an alert
 * @access  Private (Admin only)
 */
/* 
// Will implement this route properly in a future update
router.get("/affected-area/:alertId", auth, roleAuth(["admin"]), async (req, res) => {
  try {
    const alertId = req.params.alertId;
    
    return res.json({
      success: true,
      message: "This endpoint is temporarily disabled for maintenance",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
*/

// Additional failsafe route for testing
router.get("/test", (req, res) => {
  res.json({ success: true, message: "GeoAlerts route working" });
});

module.exports = router;
