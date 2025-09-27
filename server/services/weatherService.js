const axios = require("axios");

const OPENWEATHER_API_KEY = process.env.VITE_WEATHER_API_KEY;
const OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

// In-memory cache to reduce API calls and improve performance
const weatherCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Create axios instance with optimized settings for weather API
const weatherAxios = axios.create({
  timeout: 3000, // 3 second timeout for external API calls
  headers: {
    Accept: "application/json",
    "User-Agent": "FloodDisasterManagement/1.0",
  },
});

const weatherService = {
  getCurrentWeather: async (latitude, longitude) => {
    try {
      // Create cache key based on coordinates (rounded to 2 decimal places for efficiency)
      const cacheKey = `${Math.round(latitude * 100) / 100},${
        Math.round(longitude * 100) / 100
      }`;
      const now = Date.now();

      // Check cache first
      if (weatherCache.has(cacheKey)) {
        const cached = weatherCache.get(cacheKey);
        if (now - cached.timestamp < CACHE_DURATION) {
          console.log(`Using cached weather data for ${cacheKey}`);
          return cached.data;
        } else {
          // Remove expired cache entry
          weatherCache.delete(cacheKey);
        }
      }

      if (!OPENWEATHER_API_KEY) {
        console.warn(
          "OpenWeatherMap API key not configured. Using mock data for weather."
        );
        const mockData = {
          temperature: 25 + Math.random() * 10, // 25-35°C
          humidity: 60 + Math.random() * 30, // 60-90%
          precipitation: Math.random() * 5, // 0-5mm
          windSpeed: Math.random() * 20, // 0-20 km/h
          windDirection: Math.random() * 360,
          dailyPrecipitation: Math.random() * 20, // 0-20mm
          source: "Mock Data (API Key Missing)",
          timestamp: new Date().toISOString(),
        };

        // Cache mock data too
        weatherCache.set(cacheKey, { data: mockData, timestamp: now });
        return mockData;
      }

      console.log(
        `Fetching fresh weather data for coordinates: ${latitude}, ${longitude}`
      );

      const response = await weatherAxios.get(
        `${OPENWEATHER_BASE_URL}/weather`,
        {
          params: {
            lat: latitude,
            lon: longitude,
            appid: OPENWEATHER_API_KEY,
            units: "metric",
          },
        }
      );

      const data = response.data;
      const weather = data.main;
      const wind = data.wind || {};
      const clouds = data.clouds || {};

      const weatherData = {
        temperature: weather.temp,
        humidity: weather.humidity,
        pressure: weather.pressure,
        windSpeed: wind.speed || 0,
        windDirection: wind.deg || 0,
        description: data.weather[0]?.description || "Clear",
        icon: data.weather[0]?.icon || "01d",
        precipitation: data.rain?.["1h"] || data.snow?.["1h"] || 0, // Rain/snow in last hour
        dailyPrecipitation: 0, // Placeholder, needs separate API call for accurate data
        source: "OpenWeatherMap",
        timestamp: new Date().toISOString(),
      };

      // Cache the result
      weatherCache.set(cacheKey, { data: weatherData, timestamp: now });

      return weatherData;
    } catch (error) {
      console.error("Weather service error:", error.message);

      // Check if we have stale cached data as fallback
      const cacheKey = `${Math.round(latitude * 100) / 100},${
        Math.round(longitude * 100) / 100
      }`;
      if (weatherCache.has(cacheKey)) {
        console.log("Using stale cached data due to API error");
        const cached = weatherCache.get(cacheKey);
        return { ...cached.data, source: "Cached Data (API unavailable)" };
      }

      // Return mock data for development/testing only if no cache available
      const mockData = {
        temperature: 25 + Math.random() * 10, // 25-35°C
        humidity: 60 + Math.random() * 30, // 60-90%
        precipitation: Math.random() * 5, // 0-5mm
        windSpeed: Math.random() * 20, // 0-20 km/h
        windDirection: Math.random() * 360,
        dailyPrecipitation: Math.random() * 20, // 0-20mm
        source: "Mock Data (API unavailable)",
        timestamp: new Date().toISOString(),
      };

      return mockData;
    }
  },

  // Generate flood risk assessment based on weather
  getFloodRiskLevel: async (latitude, longitude, weatherData = null) => {
    try {
      // Use provided weather data or fetch if not provided
      const weather =
        weatherData ||
        (await weatherService.getCurrentWeather(latitude, longitude));

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
  getWeatherAlerts: async (latitude, longitude, weatherData = null) => {
    try {
      // Reuse weather data if provided to avoid duplicate API calls
      const riskAssessment = await weatherService.getFloodRiskLevel(
        latitude,
        longitude,
        weatherData
      );
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

  // Get comprehensive weather data with risk assessment and alerts
  getWeatherForecast: async (latitude, longitude) => {
    try {
      // Fetch weather data once
      const weather = await weatherService.getCurrentWeather(
        latitude,
        longitude
      );

      // Get risk assessment and alerts using the same weather data
      const [riskAssessment, alerts] = await Promise.all([
        weatherService.getFloodRiskLevel(latitude, longitude, weather),
        weatherService.getWeatherAlerts(latitude, longitude, weather),
      ]);

      return {
        weather,
        riskAssessment,
        alerts,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Weather forecast error:", error);
      throw error;
    }
  },

  // Clean up expired cache entries
  cleanupCache: () => {
    const now = Date.now();
    const expiredKeys = [];

    for (const [key, value] of weatherCache.entries()) {
      if (now - value.timestamp >= CACHE_DURATION) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => weatherCache.delete(key));
    console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
  },

  // Get cache statistics
  getCacheStats: () => ({
    size: weatherCache.size,
    entries: Array.from(weatherCache.keys()),
  }),
};

// Clean up cache every 10 minutes
setInterval(weatherService.cleanupCache, 10 * 60 * 1000);

module.exports = weatherService;
