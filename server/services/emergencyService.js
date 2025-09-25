const axios = require("axios");
const { logger } = require("../middleware/errorHandler");
const Emergency = require("../models/Emergency");
const RescueTeam = require("../models/RescueTeam");
const NotificationService = require("./notificationService");

class EmergencyService {
  constructor() {
    this.notificationService = new NotificationService();

    // Emergency service provider endpoints
    this.serviceProviders = {
      police: {
        baseUrl: process.env.POLICE_API_URL || "https://api.police.gov.in",
        apiKey: process.env.POLICE_API_KEY,
        emergencyNumber: "100",
      },
      ambulance: {
        baseUrl:
          process.env.AMBULANCE_API_URL || "https://api.ambulance.gov.in",
        apiKey: process.env.AMBULANCE_API_KEY,
        emergencyNumber: "108",
      },
      fire: {
        baseUrl: process.env.FIRE_API_URL || "https://api.fire.gov.in",
        apiKey: process.env.FIRE_API_KEY,
        emergencyNumber: "101",
      },
      ndrf: {
        // National Disaster Response Force
        baseUrl: process.env.NDRF_API_URL || "https://api.ndrf.gov.in",
        apiKey: process.env.NDRF_API_KEY,
        emergencyNumber: "1070",
      },
    };
  }

  /**
   * Create axios instance for a specific emergency service
   * @param {string} serviceType - Type of emergency service (police, ambulance, fire, ndrf)
   * @returns {AxiosInstance} Configured axios instance for the service
   */
  getServiceClient(serviceType) {
    const service = this.serviceProviders[serviceType];

    if (!service) {
      throw new Error(`Unknown emergency service type: ${serviceType}`);
    }

    return axios.create({
      baseURL: service.baseUrl,
      headers: {
        Authorization: `Bearer ${service.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  /**
   * Get emergency contact details for all services
   * @returns {Object} Emergency contact details
   */
  getEmergencyContacts() {
    const contacts = Object.entries(this.serviceProviders).map(
      ([key, service]) => ({
        type: key,
        name: this.getServiceName(key),
        number: service.emergencyNumber,
      })
    );

    return contacts;
  }

  /**
   * Get human-readable service name
   * @param {string} serviceType - Service type code
   * @returns {string} Human-readable service name
   */
  getServiceName(serviceType) {
    const names = {
      police: "Police Emergency Services",
      ambulance: "Medical Emergency Services",
      fire: "Fire Emergency Services",
      ndrf: "National Disaster Response Force",
    };

    return names[serviceType] || serviceType;
  }

  /**
   * Report an emergency to external emergency services
   * @param {Object} emergencyData - Emergency details
   * @param {Array} servicesToNotify - List of services to notify (police, ambulance, fire, ndrf)
   * @returns {Object} Response from emergency services
   */
  async reportEmergency(emergencyData, servicesToNotify = ["ndrf"]) {
    try {
      const results = {};
      const emergencyRecord = await this.createEmergencyRecord(emergencyData);

      // Notify each specified emergency service
      for (const serviceType of servicesToNotify) {
        try {
          const client = this.getServiceClient(serviceType);
          const response = await client.post("/emergency/report", {
            emergency_id: emergencyRecord._id.toString(),
            type: emergencyRecord.type,
            severity: emergencyRecord.severity,
            location: {
              coordinates: emergencyRecord.coordinates.coordinates,
              address: emergencyRecord.coordinates.address,
            },
            description: emergencyRecord.description,
            estimated_people_affected: emergencyRecord.estimatedPeopleAffected,
            reported_by: emergencyRecord.reportedBy,
            timestamp: new Date().toISOString(),
          });

          results[serviceType] = {
            success: true,
            reference: response.data.reference_id || null,
            message: response.data.message || "Emergency reported successfully",
          };

          logger.info(
            `Emergency ${emergencyRecord._id} reported to ${serviceType} successfully`
          );
        } catch (error) {
          logger.error(`Failed to report emergency to ${serviceType}:`, error);
          results[serviceType] = {
            success: false,
            error: error.message || "Failed to contact emergency service",
            fallbackNumber: this.serviceProviders[serviceType].emergencyNumber,
          };
        }
      }

      // Update emergency record with external service references
      await this.updateEmergencyWithServiceReferences(
        emergencyRecord._id,
        results
      );

      // Notify nearby rescue teams
      await this.notifyNearbyRescueTeams(emergencyRecord);

      return {
        emergency_id: emergencyRecord._id,
        services: results,
      };
    } catch (error) {
      logger.error("Failed to report emergency:", error);
      throw error;
    }
  }

  /**
   * Create an emergency record in the database
   * @param {Object} emergencyData - Emergency details
   * @returns {Object} Created emergency record
   */
  async createEmergencyRecord(emergencyData) {
    try {
      const emergency = new Emergency({
        type: emergencyData.type,
        severity: emergencyData.severity,
        status: "reported",
        coordinates: {
          type: "Point",
          coordinates: emergencyData.coordinates,
          address: emergencyData.address,
        },
        description: emergencyData.description,
        reportedBy: emergencyData.userId,
        affectedArea: {
          radius: emergencyData.radius || 500,
          unit: "meters",
        },
        estimatedPeopleAffected: emergencyData.estimatedPeopleAffected || 0,
        priority: this.calculatePriority(
          emergencyData.severity,
          emergencyData.estimatedPeopleAffected
        ),
        isPublic:
          emergencyData.isPublic !== undefined ? emergencyData.isPublic : true,
        weatherConditions: emergencyData.weatherConditions || {},
      });

      await emergency.save();
      logger.info(`New emergency record created with ID: ${emergency._id}`);
      return emergency;
    } catch (error) {
      logger.error("Failed to create emergency record:", error);
      throw error;
    }
  }

  /**
   * Calculate emergency priority level
   * @param {string} severity - Emergency severity level
   * @param {number} peopleAffected - Estimated number of people affected
   * @returns {number} Priority level (1-5)
   */
  calculatePriority(severity, peopleAffected) {
    const severityScores = {
      critical: 5,
      high: 4,
      medium: 3,
      low: 2,
    };

    let priority = severityScores[severity] || 3;

    // Adjust priority based on people affected
    if (peopleAffected > 100) {
      priority = Math.min(priority + 1, 5);
    }

    return priority;
  }

  /**
   * Update emergency record with service references
   * @param {string} emergencyId - Emergency record ID
   * @param {Object} serviceResults - Results from emergency services
   * @returns {Object} Updated emergency record
   */
  async updateEmergencyWithServiceReferences(emergencyId, serviceResults) {
    try {
      const serviceReferences = [];

      for (const [service, result] of Object.entries(serviceResults)) {
        if (result.success && result.reference) {
          serviceReferences.push({
            service,
            referenceId: result.reference,
            timestamp: new Date(),
          });
        }
      }

      if (serviceReferences.length > 0) {
        const emergency = await Emergency.findByIdAndUpdate(
          emergencyId,
          { $push: { externalReferences: { $each: serviceReferences } } },
          { new: true }
        );

        logger.info(`Emergency ${emergencyId} updated with service references`);
        return emergency;
      }

      return null;
    } catch (error) {
      logger.error(
        `Failed to update emergency ${emergencyId} with service references:`,
        error
      );
      throw error;
    }
  }

  /**
   * Notify nearby rescue teams about a new emergency
   * @param {Object} emergency - Emergency record
   * @returns {Array} List of notified rescue teams
   */
  async notifyNearbyRescueTeams(emergency) {
    try {
      // Find available rescue teams within 10km radius
      const nearbyTeams = await RescueTeam.findNearby(
        emergency.coordinates.coordinates,
        10000 // 10km in meters
      );

      if (!nearbyTeams || nearbyTeams.length === 0) {
        logger.info(
          `No nearby rescue teams found for emergency ${emergency._id}`
        );
        return [];
      }

      // Create notification for each team
      const notificationPromises = nearbyTeams.map((team) => {
        // Skip if team is already assigned to another emergency
        if (team.status !== "available") {
          return null;
        }

        // Create notification for the team
        const notification = {
          recipient: team.leader, // Assuming leader is a User ID
          title: `🚨 New Emergency: ${
            emergency.type.charAt(0).toUpperCase() + emergency.type.slice(1)
          }`,
          message: `A ${emergency.severity} ${
            emergency.type
          } emergency has been reported near your location. Distance: approximately ${this.calculateDistance(
            team.currentLocation.coordinates,
            emergency.coordinates.coordinates
          ).toFixed(1)}km.`,
          type: "emergency",
          relatedItem: {
            type: "emergency",
            id: emergency._id,
          },
          metadata: {
            emergency_type: emergency.type,
            emergency_id: emergency._id,
            severity: emergency.severity,
            team_id: team._id,
          },
        };

        return this.notificationService.createInAppNotification(notification);
      });

      const results = await Promise.all(
        notificationPromises.filter((p) => p !== null)
      );
      logger.info(
        `Notified ${results.length} rescue teams about emergency ${emergency._id}`
      );

      return results;
    } catch (error) {
      logger.error(
        `Failed to notify rescue teams about emergency ${emergency._id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Calculate distance between two coordinates in kilometers (using Haversine formula)
   * @param {Array} coords1 - First coordinates [longitude, latitude]
   * @param {Array} coords2 - Second coordinates [longitude, latitude]
   * @returns {number} Distance in kilometers
   */
  calculateDistance(coords1, coords2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth's radius in km

    const lat1 = coords1[1];
    const lon1 = coords1[0];
    const lat2 = coords2[1];
    const lon2 = coords2[0];

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  /**
   * Get emergency status updates from external services
   * @param {string} emergencyId - Emergency ID
   * @returns {Object} Status updates from emergency services
   */
  async getEmergencyStatusUpdates(emergencyId) {
    try {
      const emergency = await Emergency.findById(emergencyId);

      if (!emergency || !emergency.externalReferences) {
        return {
          success: false,
          message: "Emergency not found or no external references available",
        };
      }

      const updates = {};

      for (const reference of emergency.externalReferences) {
        try {
          const serviceType = reference.service;
          const client = this.getServiceClient(serviceType);

          const response = await client.get(
            `/emergency/status/${reference.referenceId}`
          );

          updates[serviceType] = {
            success: true,
            status: response.data.status,
            eta: response.data.eta || null,
            notes: response.data.notes || null,
            lastUpdated: response.data.lastUpdated || new Date().toISOString(),
          };
        } catch (error) {
          logger.error(
            `Failed to get status update from ${reference.service}:`,
            error
          );
          updates[reference.service] = {
            success: false,
            error: error.message || "Failed to get status update",
          };
        }
      }

      return updates;
    } catch (error) {
      logger.error(
        `Failed to get emergency status updates for ${emergencyId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update emergency status with data from external emergency services
   * @param {string} emergencyId - Emergency ID
   * @returns {Object} Updated emergency status
   */
  async syncEmergencyStatus(emergencyId) {
    try {
      const statusUpdates = await this.getEmergencyStatusUpdates(emergencyId);
      const emergency = await Emergency.findById(emergencyId);

      if (!emergency) {
        throw new Error(`Emergency ${emergencyId} not found`);
      }

      // Analyze status updates to determine overall status
      const statuses = Object.values(statusUpdates)
        .filter((update) => update.success && update.status)
        .map((update) => update.status);

      let newStatus = emergency.status;

      if (statuses.includes("resolved")) {
        newStatus = "resolved";
      } else if (statuses.includes("in_progress")) {
        newStatus = "in_progress";
      } else if (statuses.includes("assigned")) {
        newStatus = "assigned";
      }

      // Update emergency status if changed
      if (newStatus !== emergency.status) {
        emergency.status = newStatus;
        emergency.statusHistory.push({
          status: newStatus,
          notes: "Status updated from emergency services",
          updatedBy: process.env.SYSTEM_USER_ID || "000000000000000000000000", // System user ID
          timestamp: new Date(),
        });

        await emergency.save();
        logger.info(`Emergency ${emergencyId} status updated to ${newStatus}`);
      }

      return {
        emergency_id: emergencyId,
        status: newStatus,
        updates: statusUpdates,
      };
    } catch (error) {
      logger.error(
        `Failed to sync emergency status for ${emergencyId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get nearby emergency resources (hospitals, shelters, etc.)
   * @param {Array} coordinates - [longitude, latitude]
   * @param {number} radius - Search radius in meters
   * @param {Array} types - Resource types to include
   * @returns {Object} Nearby emergency resources
   */
  async getNearbyEmergencyResources(
    coordinates,
    radius = 5000,
    types = ["hospital", "shelter", "police", "fire_station"]
  ) {
    try {
      // In a real-world scenario, this would query an external API or database
      // For now, we'll return mock data based on the types requested

      const mockResources = {
        hospitals: [
          {
            id: "hosp-001",
            name: "City General Hospital",
            type: "hospital",
            distance: 1.2,
            phone: "+91-11-12345678",
            coordinates: [coordinates[0] + 0.01, coordinates[1] + 0.01],
            beds_available: 15,
            emergency_dept: true,
          },
          {
            id: "hosp-002",
            name: "St. Mary's Medical Center",
            type: "hospital",
            distance: 3.5,
            phone: "+91-11-23456789",
            coordinates: [coordinates[0] - 0.02, coordinates[1] + 0.03],
            beds_available: 8,
            emergency_dept: true,
          },
        ],
        shelters: [
          {
            id: "shltr-001",
            name: "Community Evacuation Center",
            type: "shelter",
            distance: 0.8,
            capacity: 200,
            available_space: 120,
            coordinates: [coordinates[0] + 0.005, coordinates[1] - 0.007],
            has_food: true,
            has_medical: true,
          },
          {
            id: "shltr-002",
            name: "Municipal School Shelter",
            type: "shelter",
            distance: 2.1,
            capacity: 150,
            available_space: 90,
            coordinates: [coordinates[0] - 0.015, coordinates[1] - 0.01],
            has_food: true,
            has_medical: false,
          },
        ],
        police_stations: [
          {
            id: "pol-001",
            name: "Central Police Station",
            type: "police",
            distance: 1.7,
            phone: "100",
            coordinates: [coordinates[0] - 0.01, coordinates[1] + 0.02],
          },
        ],
        fire_stations: [
          {
            id: "fire-001",
            name: "District Fire Station",
            type: "fire_station",
            distance: 2.3,
            phone: "101",
            coordinates: [coordinates[0] + 0.025, coordinates[1] - 0.015],
          },
        ],
      };

      // Filter resources based on requested types
      const results = {};

      if (types.includes("hospital")) {
        results.hospitals = mockResources.hospitals.filter(
          (h) => h.distance <= radius / 1000
        );
      }

      if (types.includes("shelter")) {
        results.shelters = mockResources.shelters.filter(
          (s) => s.distance <= radius / 1000
        );
      }

      if (types.includes("police")) {
        results.police_stations = mockResources.police_stations.filter(
          (p) => p.distance <= radius / 1000
        );
      }

      if (types.includes("fire_station")) {
        results.fire_stations = mockResources.fire_stations.filter(
          (f) => f.distance <= radius / 1000
        );
      }

      return results;
    } catch (error) {
      logger.error("Failed to get nearby emergency resources:", error);
      throw error;
    }
  }

  /**
   * Handle incoming emergency service webhook notifications
   * @param {Object} data - Webhook payload
   * @returns {Object} Processing result
   */
  async processServiceWebhook(data) {
    try {
      // Validate webhook signature if needed
      // this.validateWebhookSignature(data, signature);

      const { emergency_id, service, status, notes, reference_id } = data;

      if (!emergency_id || !service || !status) {
        return { success: false, message: "Invalid webhook payload" };
      }

      const emergency = await Emergency.findById(emergency_id);

      if (!emergency) {
        logger.warn(`Webhook received for unknown emergency: ${emergency_id}`);
        return { success: false, message: "Emergency not found" };
      }

      // Update emergency status if applicable
      if (["assigned", "in_progress", "resolved"].includes(status)) {
        emergency.status = status;
        emergency.statusHistory.push({
          status,
          notes: notes || `Status updated by ${service} service`,
          updatedBy: process.env.SYSTEM_USER_ID || "000000000000000000000000", // System user ID
          timestamp: new Date(),
        });

        await emergency.save();
        logger.info(
          `Emergency ${emergency_id} status updated to ${status} by ${service}`
        );

        // Send notification about the status update
        await this.notificationService.sendEmergencyStatusUpdate(emergency);
      }

      return {
        success: true,
        message: "Webhook processed successfully",
        emergency_id,
      };
    } catch (error) {
      logger.error("Failed to process service webhook:", error);
      throw error;
    }
  }
}

module.exports = new EmergencyService();
