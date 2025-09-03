const axios = require("axios");

const weatherService = {
  // Get current weather using Open-Meteo (free, no API key)
  getCurrentWeather: async (latitude, longitude) => {
    try {
      console.log(
        `Fetching weather for coordinates: ${latitude}, ${longitude}`
      );

      const response = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_direction_10m&daily=precipitation_sum&timezone=auto`,
        { timeout: 5000 }
      );

      const current = response.data.current;
      const daily = response.data.daily;

      return {
        temperature: Math.round(current.temperature_2m * 10) / 10, // Round to 1 decimal
        humidity: Math.round(current.relative_humidity_2m),
        precipitation: current.precipitation || 0,
        windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
        windDirection: current.wind_direction_10m || 0,
        dailyPrecipitation: daily.precipitation_sum?.[0] || 0,
        source: "Open-Meteo",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Weather service error:", error.message);

      // Return mock data for development/testing
      return {
        temperature: 25 + Math.random() * 10, // 25-35°C
        humidity: 60 + Math.random() * 30, // 60-90%
        precipitation: Math.random() * 5, // 0-5mm
        windSpeed: Math.random() * 20, // 0-20 km/h
        windDirection: Math.random() * 360,
        dailyPrecipitation: Math.random() * 20, // 0-20mm
        source: "Mock Data (API unavailable)",
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Generate flood risk assessment based on weather
  getFloodRiskLevel: async (latitude, longitude) => {
    try {
      const weather = await this.getCurrentWeather(latitude, longitude);

      if (!weather)
        return { level: "unknown", reason: "Weather data unavailable" };

      const { precipitation, dailyPrecipitation, temperature, humidity } =
        weather;

      // Risk assessment algorithm
      let riskScore = 0;
      let reasons = [];

      // Current precipitation risk
      if (precipitation > 10) {
        riskScore += 3;
        reasons.push("Heavy current rainfall");
      } else if (precipitation > 5) {
        riskScore += 2;
        reasons.push("Moderate current rainfall");
      } else if (precipitation > 0) {
        riskScore += 1;
        reasons.push("Light rainfall detected");
      }

      // Daily precipitation accumulation
      if (dailyPrecipitation > 50) {
        riskScore += 4;
        reasons.push("Very high daily rainfall accumulation");
      } else if (dailyPrecipitation > 25) {
        riskScore += 3;
        reasons.push("High daily rainfall accumulation");
      } else if (dailyPrecipitation > 10) {
        riskScore += 2;
        reasons.push("Moderate daily rainfall accumulation");
      }

      // High humidity increases risk
      if (humidity > 90) {
        riskScore += 1;
        reasons.push("Very high humidity");
      }

      // Temperature effects (extreme cold/heat can affect drainage)
      if (temperature < 5 || temperature > 40) {
        riskScore += 1;
        reasons.push("Extreme temperature conditions");
      }

      // Determine risk level
      let level;
      if (riskScore >= 7) {
        level = "critical";
      } else if (riskScore >= 5) {
        level = "high";
      } else if (riskScore >= 3) {
        level = "medium";
      } else if (riskScore >= 1) {
        level = "low";
      } else {
        level = "minimal";
        reasons = ["No significant weather-related flood risk detected"];
      }

      return {
        level,
        score: riskScore,
        reasons,
        weather,
        assessmentTime: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Flood risk assessment error:", error);
      return {
        level: "unknown",
        reason: "Unable to assess flood risk",
        error: error.message,
      };
    }
  },

  // Get weather alerts (basic implementation)
  getWeatherAlerts: async (latitude, longitude) => {
    try {
      const riskAssessment = await this.getFloodRiskLevel(latitude, longitude);
      const alerts = [];

      if (riskAssessment.level === "critical") {
        alerts.push({
          type: "flood_warning",
          severity: "critical",
          title: "Critical Flood Risk",
          message:
            "Extremely high flood risk due to weather conditions. Take immediate precautions.",
          reasons: riskAssessment.reasons,
        });
      } else if (riskAssessment.level === "high") {
        alerts.push({
          type: "flood_watch",
          severity: "high",
          title: "High Flood Risk",
          message:
            "High flood risk detected. Monitor conditions closely and be prepared to take action.",
          reasons: riskAssessment.reasons,
        });
      } else if (riskAssessment.level === "medium") {
        alerts.push({
          type: "flood_advisory",
          severity: "medium",
          title: "Moderate Flood Risk",
          message:
            "Moderate flood risk due to current weather conditions. Stay informed.",
          reasons: riskAssessment.reasons,
        });
      }

      return alerts;
    } catch (error) {
      console.error("Weather alerts error:", error);
      return [];
    }
  },
};

module.exports = weatherService;
