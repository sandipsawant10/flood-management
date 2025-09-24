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
    return [];
  }

  const matchingAlerts = alerts.filter((alert) => {
    // Skip if no target area
    if (!alert.targetArea) return false;

    // Check by geometry type
    if (alert.targetArea.type === "Circle") {
      return isPointInCircle(
        [location.latitude, location.longitude],
        [alert.targetArea.coordinates[0], alert.targetArea.coordinates[1]],
        alert.targetArea.radius
      );
    } else if (alert.targetArea.type === "Polygon") {
      return isPointInPolygon(
        [location.latitude, location.longitude],
        alert.targetArea.coordinates
      );
    }

    return false;
  });

  return matchingAlerts;
};

/**
 * Format location as address string
 * @param {Object} location - Location object
 * @returns {string} Formatted address
 */
export const formatLocationAsAddress = (location) => {
  if (!location) return "Unknown location";

  if (location.address) {
    return location.address;
  }

  return `Lat: ${location.latitude.toFixed(
    6
  )}, Long: ${location.longitude.toFixed(6)}`;
};

/**
 * Reverse geocode a location
 * @param {Object} location - Location with lat/long
 * @returns {Promise} Resolves with location with address
 */
export const reverseGeocode = async (location) => {
  try {
    if (!location || !location.latitude || !location.longitude) {
      throw new Error("Invalid location");
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
      throw new Error("Geocoding service unavailable");
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
