const express = require("express");
const router = express.Router();

// Get disaster-prone areas (public endpoint for prefetching)
router.get("/disaster-prone-areas", async (req, res) => {
  try {
    // TODO: Implement actual disaster-prone areas data from database
    // For now, return mock data for demonstration
    const disasterProneAreas = [
      {
        id: 1,
        name: "Mumbai Coastal Region",
        state: "Maharashtra",
        district: "Mumbai",
        riskLevel: "high",
        floodTypes: ["coastal", "urban"],
        coordinates: { lat: 19.076, lng: 72.8777 },
      },
      {
        id: 2,
        name: "Kerala Backwaters",
        state: "Kerala",
        district: "Alappuzha",
        riskLevel: "medium",
        floodTypes: ["riverine", "coastal"],
        coordinates: { lat: 9.4981, lng: 76.3388 },
      },
    ];

    res.json({
      success: true,
      count: disasterProneAreas.length,
      areas: disasterProneAreas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching disaster-prone areas",
      error: error.message,
    });
  }
});

// Get evacuation centers (public endpoint for prefetching)
router.get("/evacuation-centers", async (req, res) => {
  try {
    // TODO: Implement actual evacuation centers data from database
    // For now, return mock data for demonstration
    const evacuationCenters = [
      {
        id: 1,
        name: "Mumbai Municipal Corporation Center",
        address: "BKC, Mumbai, Maharashtra",
        state: "Maharashtra",
        district: "Mumbai",
        capacity: 500,
        facilities: ["medical", "food", "shelter"],
        coordinates: { lat: 19.0596, lng: 72.8656 },
        contactNumber: "+91-22-1234-5678",
      },
      {
        id: 2,
        name: "Kerala State Relief Center",
        address: "Kochi, Kerala",
        state: "Kerala",
        district: "Ernakulam",
        capacity: 300,
        facilities: ["medical", "food", "shelter", "childcare"],
        coordinates: { lat: 9.9312, lng: 76.2673 },
        contactNumber: "+91-484-1234-5678",
      },
    ];

    res.json({
      success: true,
      count: evacuationCenters.length,
      centers: evacuationCenters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error fetching evacuation centers",
      error: error.message,
    });
  }
});

module.exports = router;
