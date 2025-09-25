/**
 * SensorDataProcessor - Data model and processor for real-time sensor data
 *
 * This model handles integration with IoT sensors, data normalization, and
 * preparation for the predictive analytics system.
 */

/**
 * @typedef {Object} SensorReading
 * @property {string} id - Unique ID for the reading
 * @property {string} sensorId - ID of the sensor that provided the reading
 * @property {string} type - Type of reading (water_level, rainfall, etc.)
 * @property {number} value - The measured value
 * @property {string} unit - Unit of measurement
 * @property {Date} timestamp - When the reading was taken
 * @property {Object} location - Location data
 * @property {number} location.lat - Latitude
 * @property {number} location.lng - Longitude
 * @property {string} location.name - Location name
 * @property {boolean} isValid - Whether this reading passed validation
 */

/**
 * @typedef {Object} SensorDevice
 * @property {string} id - Unique ID of the sensor
 * @property {string} name - Friendly name of the sensor
 * @property {string} type - Type of sensor (water_level, rainfall, etc.)
 * @property {string} manufacturer - Manufacturer name
 * @property {string} model - Model number/name
 * @property {Date} installationDate - When the sensor was installed
 * @property {string} status - Current status (active, maintenance, offline)
 * @property {number} batteryLevel - Current battery level in percentage
 * @property {Date} lastMaintenance - Date of last maintenance
 * @property {Object} location - Location data
 * @property {number} location.lat - Latitude
 * @property {number} location.lng - Longitude
 * @property {string} location.name - Location name
 * @property {Object} config - Configuration parameters
 * @property {number} config.reportingInterval - How often readings are sent (in minutes)
 * @property {number} config.thresholds.warning - Warning threshold value
 * @property {number} config.thresholds.danger - Danger threshold value
 * @property {number} config.thresholds.critical - Critical threshold value
 */

/**
 * @typedef {Object} SensorAlert
 * @property {string} id - Unique ID for the alert
 * @property {string} sensorId - ID of the sensor that triggered the alert
 * @property {string} level - Alert level (warning, danger, critical)
 * @property {string} message - Alert message
 * @property {Date} timestamp - When the alert was generated
 * @property {number} value - The value that triggered the alert
 * @property {number} threshold - The threshold that was exceeded
 * @property {Object} location - Location data
 * @property {number} location.lat - Latitude
 * @property {number} location.lng - Longitude
 * @property {string} location.name - Location name
 * @property {boolean} acknowledged - Whether the alert has been acknowledged
 * @property {string} status - Current status (active, resolved)
 */

/**
 * Class for processing and managing sensor data
 */
export class SensorDataProcessor {
  /**
   * Create a new SensorDataProcessor instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      normalizationEnabled: true,
      outlierDetectionEnabled: true,
      alertingEnabled: true,
      ...options,
    };

    // Store for the latest readings from each sensor
    this.latestReadings = new Map();

    // Store for sensors that have reported in the current session
    this.activeSensors = new Map();

    // Alert buffer
    this.alerts = [];
  }

  /**
   * Process an incoming sensor reading
   * @param {SensorReading} reading - The raw sensor reading
   * @returns {SensorReading} The processed reading
   */
  processReading(reading) {
    if (!reading || !reading.sensorId) {
      console.error("Invalid reading received:", reading);
      return null;
    }

    // Make a copy to avoid mutating the input
    const processedReading = { ...reading, isProcessed: true };

    // Apply data normalization if enabled
    if (this.options.normalizationEnabled) {
      this._normalizeReading(processedReading);
    }

    // Detect outliers if enabled
    if (this.options.outlierDetectionEnabled) {
      processedReading.isOutlier = this._detectOutlier(processedReading);
    }

    // Generate alerts if enabled
    if (this.options.alertingEnabled) {
      const alert = this._checkForAlert(processedReading);
      if (alert) {
        this.alerts.push(alert);
      }
    }

    // Update our latest reading store
    this.latestReadings.set(reading.sensorId, processedReading);

    return processedReading;
  }

  /**
   * Process multiple readings in bulk
   * @param {SensorReading[]} readings - Array of readings to process
   * @returns {SensorReading[]} Array of processed readings
   */
  processBulkReadings(readings) {
    if (!Array.isArray(readings)) {
      console.error("Invalid readings array:", readings);
      return [];
    }

    return readings
      .map((reading) => this.processReading(reading))
      .filter((reading) => reading !== null);
  }

  /**
   * Register a new sensor in the system
   * @param {SensorDevice} sensor - Sensor information
   * @returns {boolean} Success indicator
   */
  registerSensor(sensor) {
    if (!sensor || !sensor.id) {
      console.error("Invalid sensor information:", sensor);
      return false;
    }

    this.activeSensors.set(sensor.id, {
      ...sensor,
      lastSeen: new Date(),
      readingCount: 0,
    });

    return true;
  }

  /**
   * Get all active alerts that haven't been acknowledged
   * @param {string} [level] - Optional filter by alert level
   * @returns {SensorAlert[]} Array of active alerts
   */
  getActiveAlerts(level = null) {
    return this.alerts
      .filter(
        (alert) =>
          !alert.acknowledged &&
          alert.status === "active" &&
          (!level || alert.level === level)
      )
      .sort((a, b) => {
        // Sort by level priority first (critical > danger > warning)
        const levelPriority = { critical: 3, danger: 2, warning: 1 };
        const levelDiff = levelPriority[b.level] - levelPriority[a.level];
        if (levelDiff !== 0) return levelDiff;

        // Then sort by timestamp (newer first)
        return b.timestamp - a.timestamp;
      });
  }

  /**
   * Acknowledge an alert
   * @param {string} alertId - ID of the alert to acknowledge
   * @param {string} userId - ID of the user acknowledging the alert
   * @returns {boolean} Success indicator
   */
  acknowledgeAlert(alertId, userId) {
    const alertIndex = this.alerts.findIndex((alert) => alert.id === alertId);
    if (alertIndex === -1) return false;

    this.alerts[alertIndex] = {
      ...this.alerts[alertIndex],
      acknowledged: true,
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    };

    return true;
  }

  /**
   * Get statistics about the sensors and readings
   * @returns {Object} Sensor statistics
   */
  getStatistics() {
    const activeSensorCount = this.activeSensors.size;
    const readingsProcessed = Array.from(this.activeSensors.values()).reduce(
      (sum, sensor) => sum + (sensor.readingCount || 0),
      0
    );
    const alertCount = this.alerts.length;

    return {
      activeSensorCount,
      readingsProcessed,
      alertCount,
      alertsByLevel: {
        warning: this.alerts.filter((a) => a.level === "warning").length,
        danger: this.alerts.filter((a) => a.level === "danger").length,
        critical: this.alerts.filter((a) => a.level === "critical").length,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Check if sensors are reporting as expected
   * @param {number} timeThresholdMinutes - Threshold in minutes for sensor silence
   * @returns {Object[]} List of inactive sensors
   */
  checkSensorActivity(timeThresholdMinutes = 60) {
    const now = new Date();
    const thresholdMs = timeThresholdMinutes * 60 * 1000;

    const inactiveSensors = [];

    this.activeSensors.forEach((sensor, sensorId) => {
      if (!sensor.lastSeen) return;

      const timeSinceLastReading = now - new Date(sensor.lastSeen);
      if (timeSinceLastReading > thresholdMs) {
        inactiveSensors.push({
          sensorId,
          name: sensor.name,
          lastSeen: sensor.lastSeen,
          minutesSinceLastReading: Math.floor(timeSinceLastReading / 60000),
        });
      }
    });

    return inactiveSensors;
  }

  // Private methods

  /**
   * Normalize a sensor reading
   * @private
   * @param {SensorReading} reading - Reading to normalize
   */
  _normalizeReading(reading) {
    // Normalize based on sensor type
    switch (reading.type) {
      case "water_level":
        // Convert all water level readings to meters if needed
        if (reading.unit === "cm") {
          reading.value = reading.value / 100;
          reading.unit = "m";
        } else if (reading.unit === "ft") {
          reading.value = reading.value * 0.3048;
          reading.unit = "m";
        }
        break;

      case "rainfall":
        // Convert all rainfall readings to mm if needed
        if (reading.unit === "in") {
          reading.value = reading.value * 25.4;
          reading.unit = "mm";
        }
        break;

      // Add other types as needed
    }

    // Round to 2 decimal places for consistency
    reading.value = Math.round(reading.value * 100) / 100;

    return reading;
  }

  /**
   * Detect outliers in sensor readings
   * @private
   * @param {SensorReading} reading - The reading to check
   * @returns {boolean} True if reading is an outlier
   */
  _detectOutlier(reading) {
    // Simple outlier detection based on realistic ranges
    switch (reading.type) {
      case "water_level":
        // Water levels above 30m are highly unusual
        return reading.unit === "m" && reading.value > 30;

      case "rainfall":
        // More than 500mm in a single reading would be extreme
        return reading.unit === "mm" && reading.value > 500;

      case "temperature":
        // Temperatures outside -50°C to +60°C range
        return (
          reading.unit === "C" && (reading.value < -50 || reading.value > 60)
        );

      default:
        return false;
    }
  }

  /**
   * Check if a reading should trigger an alert
   * @private
   * @param {SensorReading} reading - The reading to check
   * @returns {SensorAlert|null} Alert object or null if no alert
   */
  _checkForAlert(reading) {
    // Get the sensor configuration if available
    const sensor = this.activeSensors.get(reading.sensorId);
    if (!sensor || !sensor.config || !sensor.config.thresholds) {
      return null;
    }

    const { critical, danger, warning } = sensor.config.thresholds;
    let level = null;

    // Check against thresholds
    if (critical !== undefined && reading.value >= critical) {
      level = "critical";
    } else if (danger !== undefined && reading.value >= danger) {
      level = "danger";
    } else if (warning !== undefined && reading.value >= warning) {
      level = "warning";
    }

    if (!level) return null;

    // Create alert object
    return {
      id: `alert-${Date.now()}-${reading.sensorId}`,
      sensorId: reading.sensorId,
      level,
      message: `${sensor.name} reported ${reading.value}${reading.unit} exceeding ${level} threshold`,
      timestamp: new Date(),
      value: reading.value,
      threshold: sensor.config.thresholds[level],
      location: reading.location || sensor.location,
      acknowledged: false,
      status: "active",
    };
  }

  // Sample data for development/testing
  static getSampleSensorDevices() {
    return [
      {
        id: "WL-001",
        name: "River North Monitor",
        type: "water_level",
        manufacturer: "HydroTech",
        model: "WL-5000",
        installationDate: new Date("2023-03-15"),
        status: "active",
        batteryLevel: 85,
        lastMaintenance: new Date("2023-10-10"),
        location: {
          lat: 12.9855,
          lng: 77.5959,
          name: "North River Bridge",
        },
        config: {
          reportingInterval: 15,
          thresholds: {
            warning: 3.5,
            danger: 4.5,
            critical: 5.5,
          },
        },
      },
      {
        id: "RF-001",
        name: "Downtown Rain Gauge",
        type: "rainfall",
        manufacturer: "WeatherPro",
        model: "RG-200",
        installationDate: new Date("2023-05-20"),
        status: "active",
        batteryLevel: 92,
        lastMaintenance: new Date("2023-11-05"),
        location: {
          lat: 12.9716,
          lng: 77.5946,
          name: "City Center",
        },
        config: {
          reportingInterval: 10,
          thresholds: {
            warning: 50,
            danger: 100,
            critical: 150,
          },
        },
      },
      {
        id: "WL-002",
        name: "Eastern Dam Monitor",
        type: "water_level",
        manufacturer: "HydroTech",
        model: "WL-5000",
        installationDate: new Date("2023-04-10"),
        status: "maintenance",
        batteryLevel: 45,
        lastMaintenance: new Date("2023-09-25"),
        location: {
          lat: 12.98,
          lng: 77.61,
          name: "Eastern Dam",
        },
        config: {
          reportingInterval: 5,
          thresholds: {
            warning: 10.5,
            danger: 12.0,
            critical: 13.5,
          },
        },
      },
    ];
  }

  static getSampleReadings() {
    return [
      {
        id: "reading-001",
        sensorId: "WL-001",
        type: "water_level",
        value: 3.8,
        unit: "m",
        timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
        location: {
          lat: 12.9855,
          lng: 77.5959,
          name: "North River Bridge",
        },
        isValid: true,
      },
      {
        id: "reading-002",
        sensorId: "RF-001",
        type: "rainfall",
        value: 45.2,
        unit: "mm",
        timestamp: new Date(Date.now() - 10 * 60000), // 10 minutes ago
        location: {
          lat: 12.9716,
          lng: 77.5946,
          name: "City Center",
        },
        isValid: true,
      },
      {
        id: "reading-003",
        sensorId: "WL-002",
        type: "water_level",
        value: 11.2,
        unit: "m",
        timestamp: new Date(Date.now() - 20 * 60000), // 20 minutes ago
        location: {
          lat: 12.98,
          lng: 77.61,
          name: "Eastern Dam",
        },
        isValid: true,
      },
      {
        id: "reading-004",
        sensorId: "WL-001",
        type: "water_level",
        value: 4.2,
        unit: "m",
        timestamp: new Date(), // Now
        location: {
          lat: 12.9855,
          lng: 77.5959,
          name: "North River Bridge",
        },
        isValid: true,
      },
    ];
  }
}

export default SensorDataProcessor;
