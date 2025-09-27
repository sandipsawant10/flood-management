const express = require("express");
const weatherService = require("../services/weatherService");
const router = express.Router();

// Get weather forecast (public endpoint for prefetching) - OPTIMIZED
router.get("/forecast", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // Use the new optimized method that fetches all weather data efficiently
    const forecast = await weatherService.getWeatherForecast(
      parseFloat(lat),
      parseFloat(lon)
    );

    res.json({
      success: true,
      ...forecast,
    });
  } catch (error) {
    console.error("Weather forecast error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch weather forecast",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
});

// Get current weather for coordinates
router.get("/current/:lat/:lng", async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const weather = await weatherService.getCurrentWeather(
      parseFloat(lat),
      parseFloat(lng)
    );

    res.json({
      success: true,
      weather,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch weather data",
      error: error.message,
    });
  }
});

// Get flood risk assessment
router.get("/flood-risk/:lat/:lng", async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const riskAssessment = await weatherService.getFloodRiskLevel(
      parseFloat(lat),
      parseFloat(lng)
    );

    res.json({
      success: true,
      riskAssessment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to assess flood risk",
      error: error.message,
    });
  }
});

// Get weather alerts
router.get("/alerts/:lat/:lng", async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const alerts = await weatherService.getWeatherAlerts(
      parseFloat(lat),
      parseFloat(lng)
    );

    res.json({
      success: true,
      alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch weather alerts",
      error: error.message,
    });
  }
});

// Get cache statistics (development only)
router.get("/cache-stats", (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(404).json({ message: "Not found" });
  }

  res.json({
    success: true,
    cache: weatherService.getCacheStats(),
  });
});

module.exports = router;
