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

    let query = { status };

    // If coordinates are provided, use them for geo-filtering
    if (lat && lng) {
      // Find alerts with targetArea containing the point or within radius
      query.$or = [
        // Circle areas that contain the point
        {
          "targetArea.type": "Circle",
          $expr: {
            $lte: [
              {
                $sqrt: {
                  $add: [
                    {
                      $pow: [
                        {
                          $subtract: [
                            { $arrayElemAt: ["$targetArea.coordinates", 0] },
                            parseFloat(lat),
                          ],
                        },
                        2,
                      ],
                    },
                    {
                      $pow: [
                        {
                          $subtract: [
                            { $arrayElemAt: ["$targetArea.coordinates", 1] },
                            parseFloat(lng),
                          ],
                        },
                        2,
                      ],
                    },
                  ],
                },
              },
              { $divide: ["$targetArea.radius", 111000] }, // Convert meters to rough degrees
            ],
          },
        },
        // For alerts with defined center point, check if within radius
        {
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(lng), parseFloat(lat)],
              },
              $maxDistance: parseInt(radius) * 1000, // Convert km to meters
            },
          },
        },
      ];
    }

    // Execute query with limit for performance
    const alerts = await Alert.find(query)
      .sort({ severity: 1, createdAt: -1 })
      .limit(100)
      .lean();

    // Calculate distances for each alert
    const alertsWithDistance = alerts.map((alert) => {
      if (lat && lng && alert.location && alert.location.coordinates) {
        // Calculate distance using Haversine formula
        const distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          alert.location.coordinates[1], // lat
          alert.location.coordinates[0] // lng
        );

        return {
          ...alert,
          distance: distance,
        };
      }
      return alert;
    });

    // Sort by distance if coordinates were provided
    const sortedAlerts =
      lat && lng
        ? alertsWithDistance.sort(
            (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
          )
        : alertsWithDistance;

    return res.json({
      success: true,
      count: sortedAlerts.length,
      alerts: sortedAlerts,
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
