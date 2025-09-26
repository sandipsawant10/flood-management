const express = require("express");
const weatherService = require("../services/weatherService");
const router = express.Router();

// Get weather forecast (public endpoint for prefetching)
router.get("/forecast", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    // For now, return current weather as forecast
    // TODO: Implement actual forecast service
    const weather = await weatherService.getCurrentWeather(
      parseFloat(lat),
      parseFloat(lon)
    );

    res.json({
      success: true,
      forecast: weather,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch weather forecast",
      error: error.message,
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

module.exports = router;
