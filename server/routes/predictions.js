const express = require("express");
const router = express.Router();

// Get flood predictions
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Flood prediction API coming soon",
    predictions: [],
  });
});

module.exports = router;
