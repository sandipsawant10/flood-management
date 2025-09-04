const express = require("express");
const router = express.Router();

// Get emergency contacts
router.get("/contacts", (req, res) => {
  const emergencyContacts = [
    { name: "Police", number: "100", type: "police" },
    { name: "Fire Services", number: "101", type: "fire" },
    { name: "Medical Emergency", number: "108", type: "medical" },
    { name: "Disaster Management", number: "1070", type: "disaster" },
  ];

  res.json({
    success: true,
    contacts: emergencyContacts,
  });
});

// Get nearby resources
router.get("/resources", (req, res) => {
  const { lat, lng, radius = 10 } = req.query;

  // Mock nearby resources (replace with actual database query)
  const resources = [
    {
      id: 1,
      name: "City General Hospital",
      type: "hospital",
      distance: 1.2,
      phone: "+91-11-12345678",
    },
    {
      id: 2,
      name: "Community Shelter",
      type: "shelter",
      distance: 0.8,
      capacity: 200,
    },
  ];

  res.json({
    success: true,
    resources,
  });
});

module.exports = router;
