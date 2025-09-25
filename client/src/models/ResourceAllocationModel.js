/**
 * ResourceAllocationModel - Data model for resource allocation and optimization
 *
 * This model handles the structure for resource optimization calculations,
 * emergency response team allocation, and evacuation planning.
 */

/**
 * @typedef {Object} Resource
 * @property {string} id - Unique identifier for the resource
 * @property {string} name - Resource name
 * @property {string} type - Type of resource (personnel, vehicle, equipment, supply)
 * @property {number} quantity - Available quantity
 * @property {string} location - Current location
 * @property {number} capacityPerUnit - Capacity per unit if applicable
 * @property {Date} lastUpdated - When this resource data was last updated
 * @property {string} status - Current status (available, deployed, maintenance)
 * @property {Object} capabilities - Special capabilities of this resource
 * @property {number} deploymentTime - Time in minutes to deploy this resource
 * @property {Object} constraints - Deployment constraints (weather, terrain, etc.)
 */

/**
 * @typedef {Object} ResourceAllocation
 * @property {string} id - Allocation identifier
 * @property {string} regionId - Target region identifier
 * @property {string} scenarioId - Scenario identifier if this is a simulation
 * @property {Date} timestamp - When this allocation was created
 * @property {Object[]} allocatedResources - Resources allocated
 * @property {string} allocatedResources[].resourceId - Resource identifier
 * @property {number} allocatedResources[].quantity - Quantity allocated
 * @property {string} allocatedResources[].destinationLocation - Destination
 * @property {string} allocatedResources[].assignedTask - Task assignment
 * @property {number} allocatedResources[].estimatedArrivalTime - ETA in minutes
 * @property {string} status - Allocation status (pending, in-progress, completed)
 * @property {number} effectivenessScore - Effectiveness score (0-100)
 * @property {string} createdBy - User who created this allocation
 */

/**
 * @typedef {Object} EvacuationPlan
 * @property {string} id - Plan identifier
 * @property {string} regionId - Region identifier
 * @property {Date} createdAt - Creation timestamp
 * @property {Object[]} evacuationZones - Zones to evacuate
 * @property {string} evacuationZones[].id - Zone identifier
 * @property {string} evacuationZones[].name - Zone name
 * @property {number} evacuationZones[].population - Population in this zone
 * @property {number} evacuationZones[].priority - Priority level (1-10)
 * @property {Object[]} evacuationZones[].boundaries - Zone boundaries (GeoJSON)
 * @property {Object[]} routes - Evacuation routes
 * @property {string} routes[].id - Route identifier
 * @property {string} routes[].name - Route name
 * @property {string} routes[].from - Starting point
 * @property {string} routes[].to - Destination (shelter)
 * @property {number} routes[].distance - Distance in km
 * @property {number} routes[].estimatedTime - Time in minutes
 * @property {number} routes[].capacity - People per hour
 * @property {boolean} routes[].accessible - Whether route is currently accessible
 * @property {Object[]} shelters - Emergency shelters
 * @property {string} shelters[].id - Shelter identifier
 * @property {string} shelters[].name - Shelter name
 * @property {Object} shelters[].location - Shelter location
 * @property {number} shelters[].capacity - Maximum capacity
 * @property {number} shelters[].currentOccupancy - Current occupancy
 * @property {string[]} shelters[].facilities - Available facilities
 * @property {Object} timeline - Evacuation timeline
 * @property {number} timeline.estimatedCompletionTime - Estimated completion time in hours
 * @property {Object[]} timeline.phases - Evacuation phases
 */

/**
 * @typedef {Object} EmergencyIncident
 * @property {string} id - Incident identifier
 * @property {string} type - Type of incident (flood, landslide, etc.)
 * @property {string} severity - Severity level (low, medium, high, critical)
 * @property {Date} reportedAt - When the incident was reported
 * @property {Object} location - Incident location
 * @property {number} location.lat - Latitude
 * @property {number} location.lng - Longitude
 * @property {string} location.description - Location description
 * @property {number} estimatedAffectedPopulation - Estimated affected population
 * @property {string} status - Current status (active, contained, resolved)
 * @property {Object[]} responseTeams - Response teams assigned
 * @property {string[]} resources - Resources allocated to this incident
 * @property {Object} analysis - Incident analysis
 * @property {string[]} analysis.causes - Identified causes
 * @property {string[]} analysis.recommendations - Recommendations
 */

/**
 * @typedef {Object} OptimizationParameters
 * @property {Object} priorities - Priority weights
 * @property {number} priorities.lifeSafety - Weight for life safety (0-100)
 * @property {number} priorities.propertyProtection - Weight for property protection (0-100)
 * @property {number} priorities.environmentalProtection - Weight for environmental protection (0-100)
 * @property {string} optimizationTarget - What to optimize for (response_time, coverage, resource_efficiency)
 * @property {Object} constraints - Optimization constraints
 * @property {number} constraints.maxResponseTime - Maximum acceptable response time (minutes)
 * @property {number} constraints.minResourceUtilization - Minimum resource utilization (%)
 * @property {string[]} constrainedResources - Resources that are constrained
 * @property {boolean} realTimeAdjustment - Whether to adjust in real-time
 */

/**
 * Resource allocation and optimization model
 */
export class ResourceAllocationModel {
  /**
   * Create a new resource allocation model
   * @param {Object} options - Model options
   */
  constructor(options = {}) {
    this.options = {
      defaultPriority: {
        lifeSafety: 80,
        propertyProtection: 50,
        environmentalProtection: 40,
      },
      ...options,
    };

    // Store for available resources
    this.resources = new Map();

    // Store for active allocations
    this.allocations = new Map();

    // Store for evacuation plans
    this.evacuationPlans = new Map();

    // Store for incidents
    this.incidents = new Map();
  }

  /**
   * Register a resource in the system
   * @param {Resource} resource - Resource to register
   * @returns {boolean} Success indicator
   */
  registerResource(resource) {
    if (!resource || !resource.id) {
      console.error("Invalid resource:", resource);
      return false;
    }

    this.resources.set(resource.id, {
      ...resource,
      lastUpdated: new Date(),
    });

    return true;
  }

  /**
   * Register multiple resources at once
   * @param {Resource[]} resources - Array of resources to register
   * @returns {number} Number of resources successfully registered
   */
  registerResources(resources) {
    if (!Array.isArray(resources)) {
      console.error("Invalid resources array:", resources);
      return 0;
    }

    let successCount = 0;
    resources.forEach((resource) => {
      if (this.registerResource(resource)) {
        successCount++;
      }
    });

    return successCount;
  }

  /**
   * Update a resource's information
   * @param {string} resourceId - ID of the resource to update
   * @param {Object} updates - Updates to apply
   * @returns {boolean} Success indicator
   */
  updateResource(resourceId, updates) {
    if (!this.resources.has(resourceId)) {
      return false;
    }

    const resource = this.resources.get(resourceId);
    this.resources.set(resourceId, {
      ...resource,
      ...updates,
      lastUpdated: new Date(),
    });

    return true;
  }

  /**
   * Get all available resources
   * @param {string} [type] - Optional filter by resource type
   * @returns {Resource[]} Array of available resources
   */
  getAvailableResources(type = null) {
    const resources = Array.from(this.resources.values()).filter(
      (r) => r.status === "available" && (!type || r.type === type)
    );

    return resources;
  }

  /**
   * Create a new resource allocation
   * @param {string} regionId - Target region ID
   * @param {Object[]} resourceAllocations - Resources to allocate
   * @param {string} userId - User creating the allocation
   * @returns {string} Allocation ID
   */
  createAllocation(regionId, resourceAllocations, userId) {
    const allocationId = `allocation-${Date.now()}`;

    const allocation = {
      id: allocationId,
      regionId,
      timestamp: new Date(),
      allocatedResources: resourceAllocations,
      status: "pending",
      effectivenessScore: this._calculateEffectivenessScore(
        regionId,
        resourceAllocations
      ),
      createdBy: userId,
    };

    this.allocations.set(allocationId, allocation);

    // Update resource status
    resourceAllocations.forEach((item) => {
      if (this.resources.has(item.resourceId)) {
        const resource = this.resources.get(item.resourceId);

        // Only update if there's enough quantity
        if (resource.quantity >= item.quantity) {
          this.resources.set(item.resourceId, {
            ...resource,
            quantity: resource.quantity - item.quantity,
            status:
              resource.quantity - item.quantity > 0
                ? resource.status
                : "deployed",
          });
        }
      }
    });

    return allocationId;
  }

  /**
   * Create an evacuation plan for a region
   * @param {string} regionId - Region ID
   * @param {Object} planData - Plan data
   * @returns {string} Plan ID
   */
  createEvacuationPlan(regionId, planData) {
    const planId = `evac-plan-${Date.now()}`;

    const plan = {
      id: planId,
      regionId,
      createdAt: new Date(),
      ...planData,
    };

    this.evacuationPlans.set(planId, plan);

    return planId;
  }

  /**
   * Calculate optimal resource allocation for a region
   * @param {string} regionId - Region ID
   * @param {OptimizationParameters} parameters - Optimization parameters
   * @returns {Object} Optimization results
   */
  calculateOptimalAllocation(regionId, parameters) {
    // This would normally contain complex optimization algorithms
    // Here we'll return a simplified sample result

    const availableResources = this.getAvailableResources();
    const incidents = this._getActiveIncidentsInRegion(regionId);

    // Sample optimization logic (in a real system, this would be much more sophisticated)
    const recommendedAllocation = [];
    const availableTypes = new Set(availableResources.map((r) => r.type));

    // For each incident, allocate appropriate resources
    incidents.forEach((incident) => {
      // Determine resource needs based on incident type and severity
      const needs = this._determineResourceNeeds(incident);

      // For each need, find matching resources
      Object.entries(needs).forEach(([resourceType, quantity]) => {
        if (availableTypes.has(resourceType)) {
          const matchingResources = availableResources
            .filter((r) => r.type === resourceType && r.status === "available")
            .sort((a, b) => {
              // Sort by deployment time (faster first)
              return a.deploymentTime - b.deploymentTime;
            });

          let remainingNeed = quantity;
          let i = 0;

          // Allocate resources up to the needed quantity
          while (remainingNeed > 0 && i < matchingResources.length) {
            const resource = matchingResources[i];
            const allocateQty = Math.min(resource.quantity, remainingNeed);

            recommendedAllocation.push({
              resourceId: resource.id,
              quantity: allocateQty,
              destinationLocation: incident.location.description,
              assignedTask: `Respond to ${incident.type} incident`,
              estimatedArrivalTime: resource.deploymentTime,
            });

            remainingNeed -= allocateQty;
            i++;
          }
        }
      });
    });

    // Calculate effectiveness scores
    const effectivenessScore = this._calculateEffectivenessScore(
      regionId,
      recommendedAllocation
    );
    const coverageScore = this._calculateCoverageScore(
      regionId,
      recommendedAllocation,
      incidents
    );
    const responseTimeScore = this._calculateResponseTimeScore(
      recommendedAllocation
    );

    return {
      regionId,
      recommendedAllocation,
      scores: {
        overall: effectivenessScore,
        coverage: coverageScore,
        responseTime: responseTimeScore,
      },
      unmetNeeds: this._calculateUnmetNeeds(incidents, recommendedAllocation),
      timestamp: new Date(),
    };
  }

  /**
   * Record a new incident
   * @param {EmergencyIncident} incident - Incident information
   * @returns {string} Incident ID
   */
  recordIncident(incident) {
    const incidentId = incident.id || `incident-${Date.now()}`;

    this.incidents.set(incidentId, {
      ...incident,
      id: incidentId,
      reportedAt: incident.reportedAt || new Date(),
    });

    return incidentId;
  }

  /**
   * Get the current resource allocation statistics
   * @returns {Object} Allocation statistics
   */
  getAllocationStatistics() {
    const allocatedResources = Array.from(this.allocations.values())
      .filter((a) => a.status !== "completed")
      .flatMap((a) => a.allocatedResources);

    const availableResources = this.getAvailableResources();

    // Group resources by type for easier reporting
    const byType = {};

    // Count allocated resources by type
    allocatedResources.forEach((res) => {
      const resource = this.resources.get(res.resourceId);
      if (!resource) return;

      const type = resource.type;
      byType[type] = byType[type] || { total: 0, allocated: 0, available: 0 };
      byType[type].allocated += res.quantity;
    });

    // Count available resources by type
    availableResources.forEach((res) => {
      const type = res.type;
      byType[type] = byType[type] || { total: 0, allocated: 0, available: 0 };
      byType[type].available += res.quantity;
    });

    // Calculate totals
    Object.keys(byType).forEach((type) => {
      byType[type].total = byType[type].allocated + byType[type].available;
    });

    return {
      byType,
      activeAllocations: this.allocations.size,
      activeIncidents: this.incidents.size,
      timestamp: new Date(),
    };
  }

  // Private methods

  /**
   * Calculate the effectiveness score for an allocation
   * @private
   * @param {string} regionId - Region ID
   * @param {Object[]} resourceAllocations - Allocated resources
   * @returns {number} Effectiveness score (0-100)
   */
  _calculateEffectivenessScore(regionId, resourceAllocations) {
    // Simplified scoring algorithm - in a real system this would be more complex

    // If no allocations, score is 0
    if (!resourceAllocations || resourceAllocations.length === 0) return 0;

    const incidents = this._getActiveIncidentsInRegion(regionId);

    // If no incidents but we're allocating resources, score is low
    if (incidents.length === 0) return 30;

    // Calculate coverage of different resource types
    const neededTypes = new Set();
    incidents.forEach((incident) => {
      const needs = this._determineResourceNeeds(incident);
      Object.keys(needs).forEach((type) => neededTypes.add(type));
    });

    // Get the types that are actually allocated
    const allocatedTypes = new Set();
    resourceAllocations.forEach((allocation) => {
      const resource = this.resources.get(allocation.resourceId);
      if (resource) {
        allocatedTypes.add(resource.type);
      }
    });

    // Calculate type coverage ratio
    const typesCovered = Array.from(neededTypes).filter((type) =>
      allocatedTypes.has(type)
    ).length;
    const typeCoverageRatio =
      neededTypes.size > 0 ? typesCovered / neededTypes.size : 0;

    // Calculate quantity coverage (simplified)
    let quantityCoverage = 0;
    let totalNeeded = 0;

    incidents.forEach((incident) => {
      const needs = this._determineResourceNeeds(incident);
      Object.entries(needs).forEach(([type, quantity]) => {
        totalNeeded += quantity;

        // Find matching allocations for this type
        resourceAllocations.forEach((allocation) => {
          const resource = this.resources.get(allocation.resourceId);
          if (resource && resource.type === type) {
            quantityCoverage += Math.min(allocation.quantity, quantity);
          }
        });
      });
    });

    const quantityCoverageRatio =
      totalNeeded > 0 ? quantityCoverage / totalNeeded : 0;

    // Calculate response time score (lower is better)
    const maxResponseTime = Math.max(
      ...resourceAllocations.map((a) => a.estimatedArrivalTime || 0)
    );

    // Normalize response time (0-60 mins -> 1-0 score)
    const responseTimeScore = Math.max(0, 1 - maxResponseTime / 60);

    // Combine scores with weights
    const score =
      (typeCoverageRatio * 0.4 +
        quantityCoverageRatio * 0.4 +
        responseTimeScore * 0.2) *
      100;

    // Return rounded score
    return Math.round(score);
  }

  /**
   * Calculate coverage score
   * @private
   * @param {string} regionId - Region ID
   * @param {Object[]} resourceAllocations - Allocated resources
   * @param {EmergencyIncident[]} incidents - Incidents to cover
   * @returns {number} Coverage score (0-100)
   */
  _calculateCoverageScore(regionId, resourceAllocations, incidents) {
    // Simplified coverage calculation
    if (incidents.length === 0 || resourceAllocations.length === 0) {
      return 0;
    }

    let coveredIncidents = 0;

    incidents.forEach((incident) => {
      const needs = this._determineResourceNeeds(incident);
      const needsArray = Object.entries(needs);

      // Count how many needs are met for this incident
      let metNeeds = 0;
      needsArray.forEach(([type, quantity]) => {
        let allocatedQuantity = 0;

        resourceAllocations.forEach((allocation) => {
          const resource = this.resources.get(allocation.resourceId);
          if (resource && resource.type === type) {
            allocatedQuantity += allocation.quantity;
          }
        });

        if (allocatedQuantity >= quantity) {
          metNeeds++;
        }
      });

      // If more than half the needs are met, consider the incident covered
      if (metNeeds / needsArray.length >= 0.5) {
        coveredIncidents++;
      }
    });

    return Math.round((coveredIncidents / incidents.length) * 100);
  }

  /**
   * Calculate response time score
   * @private
   * @param {Object[]} resourceAllocations - Allocated resources
   * @returns {number} Response time score (0-100)
   */
  _calculateResponseTimeScore(resourceAllocations) {
    if (resourceAllocations.length === 0) {
      return 0;
    }

    // Calculate average response time
    const totalTime = resourceAllocations.reduce(
      (sum, allocation) => sum + (allocation.estimatedArrivalTime || 0),
      0
    );
    const avgTime = totalTime / resourceAllocations.length;

    // Score is inversely proportional to time (lower time = higher score)
    // Scale: 0 min -> 100, 30 min -> 50, 60+ min -> 0
    const score = Math.max(0, 100 - (avgTime * 100) / 60);

    return Math.round(score);
  }

  /**
   * Calculate unmet resource needs
   * @private
   * @param {EmergencyIncident[]} incidents - Active incidents
   * @param {Object[]} allocations - Resource allocations
   * @returns {Object} Unmet needs by resource type
   */
  _calculateUnmetNeeds(incidents, allocations) {
    const totalNeeds = {};
    const allocatedResources = {};

    // Calculate total needs across all incidents
    incidents.forEach((incident) => {
      const needs = this._determineResourceNeeds(incident);
      Object.entries(needs).forEach(([type, quantity]) => {
        totalNeeds[type] = (totalNeeds[type] || 0) + quantity;
      });
    });

    // Calculate allocated resources by type
    allocations.forEach((allocation) => {
      const resource = this.resources.get(allocation.resourceId);
      if (!resource) return;

      const type = resource.type;
      allocatedResources[type] =
        (allocatedResources[type] || 0) + allocation.quantity;
    });

    // Calculate unmet needs
    const unmetNeeds = {};
    Object.entries(totalNeeds).forEach(([type, needed]) => {
      const allocated = allocatedResources[type] || 0;
      const unmet = Math.max(0, needed - allocated);
      if (unmet > 0) {
        unmetNeeds[type] = unmet;
      }
    });

    return unmetNeeds;
  }

  /**
   * Get active incidents in a region
   * @private
   * @param {string} regionId - Region ID
   * @returns {EmergencyIncident[]} Active incidents
   */
  _getActiveIncidentsInRegion(regionId) {
    return Array.from(this.incidents.values()).filter(
      (incident) =>
        incident.status !== "resolved" && incident.regionId === regionId
    );
  }

  /**
   * Determine resource needs based on incident type and severity
   * @private
   * @param {EmergencyIncident} incident - Incident information
   * @returns {Object} Resource needs by type
   */
  _determineResourceNeeds(incident) {
    const needs = {};
    const { type, severity, estimatedAffectedPopulation } = incident;

    // Scale factors based on severity
    const severityScales = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 5,
    };

    const scale = severityScales[severity] || 1;
    const population = estimatedAffectedPopulation || 100;

    // Base needs by incident type
    switch (type) {
      case "flood":
        needs.rescue_team = Math.ceil(scale * (population / 1000));
        needs.boat = Math.ceil(scale * (population / 2000));
        needs.water_pump = Math.ceil(scale * 2);
        needs.medical_kit = Math.ceil(scale * (population / 500));
        needs.shelter_kit = Math.ceil(scale * (population / 1000));
        break;

      case "landslide":
        needs.rescue_team = Math.ceil(scale * (population / 800));
        needs.excavator = Math.ceil(scale);
        needs.medical_kit = Math.ceil(scale * (population / 400));
        needs.shelter_kit = Math.ceil(scale * (population / 800));
        break;

      case "evacuation":
        needs.transport = Math.ceil(scale * (population / 500));
        needs.rescue_team = Math.ceil(scale * (population / 2000));
        needs.medical_kit = Math.ceil(scale * (population / 1000));
        needs.food_supply = Math.ceil(scale * population);
        break;

      default:
        needs.rescue_team = Math.ceil(scale);
        needs.medical_kit = Math.ceil(scale * (population / 1000));
    }

    return needs;
  }

  // Sample data for development/testing
  static getSampleResources() {
    return [
      {
        id: "RT-001",
        name: "Alpha Rescue Team",
        type: "rescue_team",
        quantity: 1,
        location: "North District HQ",
        capacityPerUnit: 8,
        lastUpdated: new Date(),
        status: "available",
        capabilities: {
          waterRescue: true,
          medicalAid: true,
          searchAndRescue: true,
        },
        deploymentTime: 15,
        constraints: {
          weather: ["normal", "rain"],
          terrain: ["urban", "suburban", "rural"],
        },
      },
      {
        id: "RT-002",
        name: "Beta Rescue Team",
        type: "rescue_team",
        quantity: 1,
        location: "South District HQ",
        capacityPerUnit: 6,
        lastUpdated: new Date(),
        status: "available",
        capabilities: {
          waterRescue: true,
          medicalAid: false,
          searchAndRescue: true,
        },
        deploymentTime: 20,
        constraints: {
          weather: ["normal", "rain", "storm"],
          terrain: ["urban", "suburban", "rural", "mountainous"],
        },
      },
      {
        id: "VH-001",
        name: "Rescue Boats",
        type: "boat",
        quantity: 5,
        location: "Central Depot",
        capacityPerUnit: 8,
        lastUpdated: new Date(),
        status: "available",
        capabilities: {
          motorized: true,
          shallow: true,
        },
        deploymentTime: 25,
        constraints: {
          weather: ["normal", "rain", "light_storm"],
          terrain: ["flooded_urban", "flooded_rural", "river"],
        },
      },
      {
        id: "EQ-001",
        name: "Water Pumps",
        type: "water_pump",
        quantity: 10,
        location: "Equipment Warehouse",
        capacityPerUnit: null,
        lastUpdated: new Date(),
        status: "available",
        capabilities: {
          highCapacity: true,
          portable: true,
        },
        deploymentTime: 30,
        constraints: {
          weather: ["normal", "rain", "storm"],
          terrain: ["urban", "suburban", "rural"],
        },
      },
      {
        id: "SUP-001",
        name: "Medical Kits",
        type: "medical_kit",
        quantity: 50,
        location: "Medical Supplies Depot",
        capacityPerUnit: null,
        lastUpdated: new Date(),
        status: "available",
        capabilities: {
          emergency: true,
          trauma: true,
        },
        deploymentTime: 15,
        constraints: {},
      },
      {
        id: "SUP-002",
        name: "Food Supplies",
        type: "food_supply",
        quantity: 500,
        location: "Food Bank",
        capacityPerUnit: 1,
        lastUpdated: new Date(),
        status: "available",
        capabilities: {
          nonPerishable: true,
          readyToEat: true,
        },
        deploymentTime: 60,
        constraints: {},
      },
    ];
  }

  static getSampleIncidents() {
    return [
      {
        id: "INC-001",
        type: "flood",
        severity: "high",
        reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        location: {
          lat: 12.9855,
          lng: 77.5959,
          description: "Riverside Housing Complex",
        },
        estimatedAffectedPopulation: 2000,
        status: "active",
        responseTeams: [],
        resources: [],
        regionId: "REG-001",
        analysis: {
          causes: ["Heavy rainfall", "River overflow"],
          recommendations: ["Immediate evacuation", "Deploy water pumps"],
        },
      },
      {
        id: "INC-002",
        type: "landslide",
        severity: "medium",
        reportedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        location: {
          lat: 12.9716,
          lng: 77.62,
          description: "Eastern Hill Area",
        },
        estimatedAffectedPopulation: 500,
        status: "contained",
        responseTeams: ["RT-002"],
        resources: ["EQ-003", "SUP-001"],
        regionId: "REG-002",
        analysis: {
          causes: ["Heavy rainfall", "Soil erosion"],
          recommendations: ["Stabilize slopes", "Monitor for further movement"],
        },
      },
      {
        id: "INC-003",
        type: "evacuation",
        severity: "critical",
        reportedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        location: {
          lat: 12.965,
          lng: 77.58,
          description: "Downtown District",
        },
        estimatedAffectedPopulation: 5000,
        status: "active",
        responseTeams: ["RT-001"],
        resources: ["VH-001", "SUP-002"],
        regionId: "REG-001",
        analysis: {
          causes: ["Flash flood warning", "Dam overflow risk"],
          recommendations: ["Urgent evacuation", "Shelter preparation"],
        },
      },
    ];
  }
}

export default ResourceAllocationModel;
