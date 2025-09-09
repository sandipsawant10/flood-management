const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

// Get emergency data
router.get("/data", auth, (req, res) => {
  // Mock emergency data
  const emergencyData = {
    hospitals: [
      {
        id: 1,
        name: "City General Hospital",
        type: "hospital",
        distance: 1.2,
        phone: "+91-11-12345678",
      },
    ],
    shelters: [
      {
        id: 2,
        name: "Community Shelter",
        type: "shelter",
        distance: 0.8,
        capacity: 200,
      },
    ],
  };

  res.json(emergencyData);
});

// Get active incidents
router.get("/incidents", auth, (req, res) => {
  // Mock active incidents
  const incidents = [
    {
      id: 1,
      type: "flood",
      severity: "high",
      location: "Downtown Area",
      timestamp: new Date().toISOString(),
    },
  ];

  res.json(incidents);
});

// Get emergency contacts
router.get("/contacts", auth, (req, res) => {
  const emergencyContacts = [
    { name: "Police", number: "100", type: "police" },
    { name: "Fire Services", number: "101", type: "fire" },
    { name: "Medical Emergency", number: "108", type: "medical" },
    { name: "Disaster Management", number: "1070", type: "disaster" },
  ];

  res.json(emergencyContacts);
});

module.exports = router;
