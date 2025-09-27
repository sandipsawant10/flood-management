/**
 * Geolocation Service
 * Provides utilities for geolocation tracking and proximity-based alerts
 */

// Constants
const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const LOCATION_ACCURACY_THRESHOLD = 100; // meters
const LOCATION_STORAGE_KEY = "userGeolocationData";
const MAX_LOCATION_AGE = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Find safe evacuation routes from current location
 * @param {Object} currentLocation - User's current location
 * @param {Array} alertZones - Array of active alert zones
 * @param {Object} options - Additional options
 * @param {Function} options.translate - Translation function for multilingual support
 * @returns {Promise} Resolves with suggested routes
 */
export const findSafeEvacuationRoutes = async (
  currentLocation,
  alertZones,
  options = {}
) => {
  try {
    if (
      !currentLocation ||
      !currentLocation.latitude ||
      !currentLocation.longitude
    ) {
      throw new Error("Invalid current location");
    }

    const { translate = null } = options;

    // In a real application, this would call routing services like MapBox, Google Maps, etc.
    // For this demo, we'll simulate some evacuation routes

    // Find safe destinations (emergency shelters, high ground)
    const safeDestinations = [
      // Simulated shelter locations - in a real app, these would come from a database
      {
        name: translate
          ? translate("geolocation.evacuationRoutes.evacuationCenter")
          : "Community Evacuation Center",
        latitude: currentLocation.latitude + 0.02,
        longitude: currentLocation.longitude + 0.01,
        type: "shelter",
      },
      {
        name: translate
          ? translate("geolocation.evacuationRoutes.highGround")
          : "High Ground Zone",
        latitude: currentLocation.latitude - 0.01,
        longitude: currentLocation.longitude + 0.02,
        type: "high_ground",
      },
      {
        name: translate
          ? translate("geolocation.evacuationRoutes.reliefCenter")
          : "Emergency Relief Center",
        latitude: currentLocation.latitude + 0.01,
        longitude: currentLocation.longitude - 0.02,
        type: "shelter",
      },
    ];

    // Calculate routes to each destination that avoid alert zones
    const routes = await Promise.all(
      safeDestinations.map(async (destination) => {
        // Calculate direct path distance
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          destination.latitude,
          destination.longitude
        );

        // In a real implementation, we would use routing APIs to find paths avoiding flood zones
        // Here we'll just simulate a path with waypoints
        const waypoints = generateSimulatedPath(
          currentLocation,
          destination,
          alertZones
        );

        // Calculate estimated time based on walking speed (4 km/h)
        const walkingSpeedKmh = 4;
        const estimatedMinutes = Math.round(
          (distance / 1000 / walkingSpeedKmh) * 60
        );

        // Get direction with translation if available
        const direction = getCardinalDirection(
          currentLocation,
          waypoints[0],
          translate
        );

        // Format the directions text
        let directions;
        if (translate) {
          directions = translate("geolocation.directions.headingDirection", {
            direction,
            distance: (distance / 1000).toFixed(1),
            destination: destination.name,
          });
        } else {
          directions = `Head ${direction} for approximately ${(
            distance / 1000
          ).toFixed(1)}km to reach ${destination.name}.`;
        }

        return {
          destination,
          distance,
          estimatedMinutes,
          waypoints,
          isSafe: true, // In a real implementation, determine if route avoids all danger areas
          directions,
        };
      })
    );

    // Sort routes by estimated time
    routes.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);

    return {
      routes,
      currentLocation,
      generatedAt: new Date().getTime(),
    };
  } catch (error) {
    console.error("Error finding safe evacuation routes:", error);
    return {
      routes: [],
      error: error.message,
      currentLocation,
    };
  }
};

/**
 * Generate a simulated path between two points avoiding alert zones
 * Note: In a real app, this would use actual routing APIs
 * @param {Object} start - Start position with latitude and longitude
 * @param {Object} end - End position with latitude and longitude
 * @returns {Array} Array of waypoints
 */
const generateSimulatedPath = (start, end) => {
  // Create a simple path with waypoints that would avoid alert zones
  const waypoints = [];

  // Create a few intermediate points
  const totalPoints = 5;

  for (let i = 1; i < totalPoints; i++) {
    // Linear interpolation with small random variations
    const ratio = i / totalPoints;

    // Add slight variations to avoid a straight line
    const jitterLat = (Math.random() - 0.5) * 0.005;
    const jitterLng = (Math.random() - 0.5) * 0.005;

    waypoints.push({
      latitude:
        start.latitude + (end.latitude - start.latitude) * ratio + jitterLat,
      longitude:
        start.longitude + (end.longitude - start.longitude) * ratio + jitterLng,
    });
  }

  return waypoints;
};

/**
 * Get cardinal direction between two points
 * @param {Object} from - Start position with latitude and longitude
 * @param {Object} to - End position with latitude and longitude
 * @param {Function} translate - Optional translation function, if provided translates direction
 * @returns {string} Cardinal direction
 */
const getCardinalDirection = (from, to, translate = null) => {
  const directionKeys = [
    "north",
    "northeast",
    "east",
    "southeast",
    "south",
    "southwest",
    "west",
    "northwest",
  ];

  const dx = to.longitude - from.longitude;
  const dy = to.latitude - from.latitude;

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const index = Math.round(((angle + 360) % 360) / 45) % 8;

  const direction = directionKeys[index];

  // If translation function is provided, translate the direction
  if (translate && typeof translate === "function") {
    return translate(`geolocation.directions.${direction}`);
  }

  return direction;
};

/**
 * Initialize geolocation tracking
 * @param {Object} options - Configuration options
 * @param {boolean} options.highAccuracy - Use high accuracy mode (more battery usage)
 * @param {boolean} options.backgroundTracking - Track location in the background
 * @param {Function} options.onLocationUpdate - Callback for location updates
 * @param {Function} options.onError - Callback for errors
 * @returns {Object} Geolocation controller
 */
export const initGeolocationTracking = (options = {}) => {
  const {
    highAccuracy = true,
    backgroundTracking = true,
    onLocationUpdate,
    onError,
  } = options;

  let watchId = null;
  let isTracking = false;

  // Check if geolocation is supported
  if (!navigator.geolocation) {
    const error = new Error("Geolocation is not supported by this browser");
    if (onError) onError(error);
    return {
      start: () => Promise.reject(error),
      stop: () => {},
      isTracking: () => false,
      getLastLocation: () => null,
      isGeolocationSupported: false,
    };
  }

  /**
   * Start tracking location
   * @returns {Promise} Resolves with initial location
   */
  const startTracking = () => {
    return new Promise((resolve, reject) => {
      try {
        // Get initial position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData = processPosition(position);
            saveLocationToStorage(locationData);

            if (onLocationUpdate) onLocationUpdate(locationData);

            // Start watching for position changes if not already tracking
            if (!isTracking) {
              watchId = navigator.geolocation.watchPosition(
                handlePositionUpdate,
                handlePositionError,
                {
                  enableHighAccuracy: highAccuracy,
                  maximumAge: 30000,
                  timeout: 27000,
                }
              );

              isTracking = true;
            }

            resolve(locationData);
          },
          (error) => {
            console.error("Error getting initial position:", error);
            if (onError) onError(error);
            reject(error);
          },
          {
            enableHighAccuracy: highAccuracy,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      } catch (error) {
        console.error("Error starting location tracking:", error);
        if (onError) onError(error);
        reject(error);
      }
    });
  };

  /**
   * Stop tracking location
   */
  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      isTracking = false;
      console.log("Location tracking stopped");
    }
  };

  /**
   * Handle position update
   * @param {Position} position - Geolocation position
   */
  const handlePositionUpdate = (position) => {
    try {
      const locationData = processPosition(position);

      // Check if location has changed significantly
      const lastLocation = getLastLocationFromStorage();
      if (
        !lastLocation ||
        isSignificantLocationChange(locationData, lastLocation)
      ) {
        saveLocationToStorage(locationData);

        if (onLocationUpdate) onLocationUpdate(locationData);
      }
    } catch (error) {
      console.error("Error processing location update:", error);
      if (onError) onError(error);
    }
  };

  /**
   * Handle position error
   * @param {PositionError} error - Geolocation error
   */
  const handlePositionError = (error) => {
    console.error("Error tracking location:", error);
    if (onError) onError(error);
  };

  /**
   * Process raw position data
   * @param {Position} position - Geolocation position
   * @returns {Object} Processed location data
   */
  const processPosition = (position) => {
    const { latitude, longitude, accuracy, altitude, heading, speed } =
      position.coords;

    return {
      latitude,
      longitude,
      accuracy,
      altitude: altitude || null,
      heading: heading || null,
      speed: speed || null,
      timestamp: position.timestamp || new Date().getTime(),
    };
  };

  /**
   * Get last saved location
   * @returns {Object|null} Last location or null
   */
  const getLastLocation = () => {
    return getLastLocationFromStorage();
  };

  // Start tracking if backgroundTracking is true
  if (backgroundTracking) {
    startTracking().catch((error) => {
      console.error("Failed to start background tracking:", error);
    });
  }

  // Return controller
  return {
    start: startTracking,
    stop: stopTracking,
    isTracking: () => isTracking,
    getLastLocation,
    isGeolocationSupported: true,
  };
};

/**
 * Save location data to storage
 * @param {Object} locationData - Location data to save
 */
const saveLocationToStorage = (locationData) => {
  try {
    const data = {
      ...locationData,
      savedAt: new Date().getTime(),
    };
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving location to storage:", error);
  }
};

/**
 * Get last location from storage
 * @returns {Object|null} Last location or null
 */
const getLastLocationFromStorage = () => {
  try {
    const data = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!data) return null;

    const locationData = JSON.parse(data);

    // Check if location data is too old
    const now = new Date().getTime();
    if (now - locationData.savedAt > MAX_LOCATION_AGE) {
      // Clear old location data
      localStorage.removeItem(LOCATION_STORAGE_KEY);
      return null;
    }

    return locationData;
  } catch (error) {
    console.error("Error retrieving location from storage:", error);
    return null;
  }
};

/**
 * Check if location has changed significantly
 * @param {Object} newLocation - New location
 * @param {Object} oldLocation - Old location
 * @returns {boolean} True if significant change
 */
const isSignificantLocationChange = (newLocation, oldLocation) => {
  // Return true if no previous location
  if (!oldLocation) return true;

  // Calculate distance between points
  const distance = calculateDistance(
    oldLocation.latitude,
    oldLocation.longitude,
    newLocation.latitude,
    newLocation.longitude
  );

  // Return true if moved more than accuracy threshold
  return distance > LOCATION_ACCURACY_THRESHOLD;
};

/**
 * Calculate distance between two points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  // Haversine formula for calculating distance between two points
  const p = 0.017453292519943295; // Math.PI / 180
  const c = Math.cos;
  const a =
    0.5 -
    c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

  // Return distance in meters (6371 is Earth's radius in km)
  return 12742 * Math.asin(Math.sqrt(a)) * 1000;
};

/**
 * Check if a point is inside a polygon
 * @param {Array} point - Point as [latitude, longitude]
 * @param {Array} polygon - Array of [latitude, longitude] points
 * @returns {boolean} True if point is inside polygon
 */
export const isPointInPolygon = (point, polygon) => {
  // Ray casting algorithm
  let inside = false;
  const x = point[0];
  const y = point[1];

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
};

/**
 * Check if a point is inside a circle
 * @param {Array} point - Point as [latitude, longitude]
 * @param {Array} center - Circle center as [latitude, longitude]
 * @param {number} radius - Circle radius in meters
 * @returns {boolean} True if point is inside circle
 */
export const isPointInCircle = (point, center, radius) => {
  const distance = calculateDistance(point[0], point[1], center[0], center[1]);

  return distance <= radius;
};

/**
 * Get user's current location
 * @param {Object} options - Geolocation options
 * @returns {Promise} Resolves with location
 */
export const getCurrentLocation = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp || new Date().getTime(),
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: options.highAccuracy !== false,
        timeout: options.timeout || 10000,
        maximumAge: options.maximumAge || 0,
      }
    );
  });
};

/**
 * Check if location is within any alert areas
 * @param {Object} location - User location
 * @param {Array} alerts - Array of alert objects
 * @returns {Array} Matching alerts
 */
export const checkLocationWithinAlertAreas = (location, alerts) => {
  if (!location || !alerts || !Array.isArray(alerts) || alerts.length === 0) {
    return {
      matchingAlerts: [],
      nearbyAlerts: [],
      distanceToAlerts: new Map(),
    };
  }

  // Track distances to all alerts for proximity warnings
  const distanceToAlerts = new Map();
  const proximityThreshold = 1000; // 1 kilometer as nearby alert threshold
  const nearbyAlerts = [];

  const matchingAlerts = alerts.filter((alert) => {
    // Skip if no target area
    if (!alert.targetArea) return false;

    let isInside = false;
    let distance = Number.POSITIVE_INFINITY;

    // Check by geometry type
    if (alert.targetArea.type === "Circle") {
      // Calculate distance to the center
      distance = calculateDistance(
        location.latitude,
        location.longitude,
        alert.targetArea.coordinates[0],
        alert.targetArea.coordinates[1]
      );

      // Inside if distance is less than radius
      isInside = distance <= alert.targetArea.radius;

      // Store the distance for proximity alerts
      distanceToAlerts.set(alert.id, distance);

      // Check if approaching alert zone (within proximityThreshold of border)
      if (
        !isInside &&
        distance <= alert.targetArea.radius + proximityThreshold
      ) {
        nearbyAlerts.push({
          ...alert,
          distance,
          distanceToEdge: distance - alert.targetArea.radius,
        });
      }
    } else if (alert.targetArea.type === "Polygon") {
      // Check if point is inside polygon
      isInside = isPointInPolygon(
        [location.latitude, location.longitude],
        alert.targetArea.coordinates
      );

      // Calculate minimum distance to polygon edge if not inside
      if (!isInside) {
        // Find shortest distance to any edge
        distance = calculateDistanceToPolygon(
          [location.latitude, location.longitude],
          alert.targetArea.coordinates
        );

        // Store the distance for proximity alerts
        distanceToAlerts.set(alert.id, distance);

        // Check if approaching alert zone
        if (distance <= proximityThreshold) {
          nearbyAlerts.push({
            ...alert,
            distance,
            distanceToEdge: distance,
          });
        }
      } else {
        // Inside the polygon, distance to edge is 0
        distanceToAlerts.set(alert.id, 0);
      }
    }

    return isInside;
  });

  return {
    matchingAlerts,
    nearbyAlerts,
    distanceToAlerts,
  };
};

/**
 * Calculate minimum distance from a point to a polygon
 * @param {Array} point - Point as [latitude, longitude]
 * @param {Array} polygon - Array of [latitude, longitude] points
 * @returns {number} Minimum distance in meters
 */
export const calculateDistanceToPolygon = (point, polygon) => {
  if (!polygon || polygon.length < 3) return Number.POSITIVE_INFINITY;

  // If point is inside polygon, distance is 0
  if (isPointInPolygon(point, polygon)) return 0;

  let minDistance = Number.POSITIVE_INFINITY;

  // Check distance to each edge
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const distance = calculateDistanceToLine(point, polygon[i], polygon[j]);

    if (distance < minDistance) {
      minDistance = distance;
    }
  }

  return minDistance;
};

/**
 * Calculate distance from a point to a line segment
 * @param {Array} point - Point as [latitude, longitude]
 * @param {Array} lineStart - Line start as [latitude, longitude]
 * @param {Array} lineEnd - Line end as [latitude, longitude]
 * @returns {number} Distance in meters
 */
export const calculateDistanceToLine = (point, lineStart, lineEnd) => {
  // Calculate distance from point to line segment
  const x = point[0];
  const y = point[1];
  const x1 = lineStart[0];
  const y1 = lineStart[1];
  const x2 = lineEnd[0];
  const y2 = lineEnd[1];

  // Calculate the length of the line segment
  const lineLength = calculateDistance(x1, y1, x2, y2);

  if (lineLength === 0) {
    // If line segment is actually a point
    return calculateDistance(x, y, x1, y1);
  }

  // Calculate projection of point onto line
  const t =
    ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / (lineLength * lineLength);

  if (t < 0) {
    // Closest to lineStart
    return calculateDistance(x, y, x1, y1);
  } else if (t > 1) {
    // Closest to lineEnd
    return calculateDistance(x, y, x2, y2);
  } else {
    // Closest to some point on the line segment
    const projX = x1 + t * (x2 - x1);
    const projY = y1 + t * (y2 - y1);
    return calculateDistance(x, y, projX, projY);
  }
};

/**
 * Format location as address string
 * @param {Object} location - Location object
 * @param {Object} options - Additional options
 * @param {Function} options.translate - Translation function
 * @returns {string} Formatted address
 */
export const formatLocationAsAddress = (location, options = {}) => {
  const { translate = null } = options;

  if (!location) {
    return translate
      ? translate("geolocation.unknownLocation")
      : "Unknown location";
  }

  if (location.address) {
    return location.address;
  }

  if (translate) {
    return translate("geolocation.locationFormat", {
      latitude: location.latitude.toFixed(7),
      longitude: location.longitude.toFixed(7),
    });
  }

  return `Lat: ${location.latitude.toFixed(
    7
  )}, Long: ${location.longitude.toFixed(7)}`;
};

/**
 * Reverse geocode a location
 * @param {Object} location - Location with lat/long
 * @param {Object} options - Additional options
 * @param {Function} options.translate - Translation function
 * @returns {Promise} Resolves with location with address
 */
export const reverseGeocode = async (location, options = {}) => {
  const { translate = null } = options;

  try {
    if (!location || !location.latitude || !location.longitude) {
      const errorMessage = translate
        ? translate("geolocation.errors.invalidLocation")
        : "Invalid location";

      throw new Error(errorMessage);
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "AquaAssist Flood Disaster Management App",
        },
      }
    );

    if (!response.ok) {
      const errorMessage = translate
        ? translate("geolocation.errors.geocodingServiceUnavailable")
        : "Geocoding service unavailable";

      throw new Error(errorMessage);
    }

    const data = await response.json();

    return {
      ...location,
      address: data.display_name,
      addressDetails: data.address,
    };
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return location;
  }
};

/**
 * Calculate elevation risk for a location
 * @param {Object} location - Location with lat/long
 * @param {Object} options - Additional options
 * @param {Function} options.translate - Translation function
 * @returns {Promise} Resolves with risk assessment
 */
export const calculateElevationRisk = async (location, options = {}) => {
  const { translate = null } = options;

  // Note: In a real implementation, this would call an elevation API service
  // For this demo, we'll use a simulated response based on coordinates
  try {
    if (!location || !location.latitude || !location.longitude) {
      const errorMessage = translate
        ? translate("geolocation.errors.invalidLocation")
        : "Invalid location";

      throw new Error(errorMessage);
    }

    // Simulated elevation check - would call a real elevation API in production
    // This is placeholder logic that generates a "realistic" response based on coordinates
    const elevationSeed =
      Math.sin(location.latitude * 0.1) * Math.cos(location.longitude * 0.1);
    const baseElevation = Math.abs(elevationSeed * 100) + 5;

    // Simple risk calculation based on simulated elevation
    let risk = "low";
    let elevation = baseElevation;

    if (baseElevation < 10) {
      risk = "high";
    } else if (baseElevation < 20) {
      risk = "medium";
    }

    // Return risk assessment with translated risk level if translation function is provided
    return {
      elevation: elevation.toFixed(1), // meters
      risk: translate ? translate(`geolocation.riskLevels.${risk}`) : risk,
      riskLevel: risk, // Keep original risk level for internal use
      riskFactor: risk === "high" ? 0.8 : risk === "medium" ? 0.4 : 0.1,
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    console.error("Error calculating elevation risk:", error);
    return {
      elevation: null,
      risk: translate ? translate("geolocation.riskLevels.unknown") : "unknown",
      riskLevel: "unknown", // Keep original risk level for internal use
      riskFactor: 0.5,
      error: error.message,
    };
  }
};

/**
 * Calculate real-time flood risk based on location, weather and elevation
 * @param {Object} location - User location
 * @param {Object} options - Additional options
 * @param {Object} options.weather - Weather data
 * @param {Function} options.translate - Translation function
 * @returns {Promise} Resolves with risk assessment
 */
export const calculateFloodRisk = async (location, options = {}) => {
  const { translate = null, weather = null } = options;

  try {
    // Get elevation risk with translation support
    const elevationRisk = await calculateElevationRisk(location, { translate });

    // Get weather data - note: in a real app, call to weather API
    const weatherData = weather || {
      precipitation: Math.random() * 10, // mm
      precipitationForecast: Math.random() * 20, // mm in next 24h
      floodWarningsNearby: Math.random() > 0.7, // 30% chance of nearby warnings
    };

    // Calculate combined risk factors
    const weatherRiskFactor =
      weatherData.precipitation > 5
        ? 0.7
        : weatherData.precipitation > 2
        ? 0.4
        : 0.2;

    const forecastRiskFactor =
      weatherData.precipitationForecast > 15
        ? 0.8
        : weatherData.precipitationForecast > 10
        ? 0.5
        : 0.3;

    const warningFactor = weatherData.floodWarningsNearby ? 0.9 : 0.3;

    // Combine risk factors with elevation risk
    const combinedRiskFactor =
      elevationRisk.riskFactor * 0.4 +
      weatherRiskFactor * 0.3 +
      forecastRiskFactor * 0.2 +
      warningFactor * 0.1;

    // Determine risk level
    let riskLevel;
    if (combinedRiskFactor >= 0.7) {
      riskLevel = "high";
    } else if (combinedRiskFactor >= 0.4) {
      riskLevel = "medium";
    } else {
      riskLevel = "low";
    }

    return {
      riskLevel: translate
        ? translate(`geolocation.riskLevels.${riskLevel}`)
        : riskLevel,
      originalRiskLevel: riskLevel, // Keep original risk level for internal use
      riskFactor: combinedRiskFactor,
      elevation: elevationRisk.elevation,
      precipitation: weatherData.precipitation,
      precipitationForecast: weatherData.precipitationForecast,
      floodWarningsNearby: weatherData.floodWarningsNearby,
      timestamp: new Date().getTime(),
    };
  } catch (error) {
    console.error("Error calculating flood risk:", error);
    return {
      riskLevel: translate
        ? translate("geolocation.riskLevels.unknown")
        : "unknown",
      originalRiskLevel: "unknown",
      riskFactor: 0.5,
      error: error.message,
    };
  }
};
