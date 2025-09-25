const Resource = require("../models/Resource");
const RescueTeam = require("../models/RescueTeam");
const AuditLog = require("../models/AuditLog");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

// Get all resources with filtering options
exports.getResources = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    category,
    status,
    search,
    location,
    team,
    condition,
    sortBy,
  } = req.query;

  const skip = (page - 1) * limit;

  const query = {};
  if (category) query.category = category;
  if (status) query.status = status;
  if (condition) query.condition = condition;
  if (team && mongoose.Types.ObjectId.isValid(team)) query.assignedTeam = team;

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "location.address": { $regex: search, $options: "i" } },
    ];
  }

  if (location) {
    // If coordinates and radius provided for proximity search
    if (location.lat && location.lng && location.radius) {
      query["location"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(location.lng), parseFloat(location.lat)],
          },
          $maxDistance: parseInt(location.radius) * 1000, // convert km to meters
        },
      };
    }
    // If searching by district or state
    else if (location.district) {
      query["location.district"] = location.district;
    } else if (location.state) {
      query["location.state"] = location.state;
    }
  }

  // Determine sort order
  let sort = { createdAt: -1 }; // Default sort by creation date (newest first)
  if (sortBy) {
    switch (sortBy) {
      case "name_asc":
        sort = { name: 1 };
        break;
      case "name_desc":
        sort = { name: -1 };
        break;
      case "quantity_asc":
        sort = { "quantity.available": 1 };
        break;
      case "quantity_desc":
        sort = { "quantity.available": -1 };
        break;
      case "status":
        sort = { status: 1 };
        break;
      case "condition":
        sort = { condition: 1 };
        break;
      case "maintenance_due":
        sort = { nextMaintenance: 1 };
        break;
    }
  }

  const resources = await Resource.find(query)
    .populate("assignedTeam", "name contactInfo")
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Resource.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: resources.length,
    total,
    data: {
      resources,
    },
  });
});

// Get single resource by ID
exports.getResource = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid resource ID", 400));
  }

  const resource = await Resource.findById(id)
    .populate("assignedTeam")
    .populate("notes.author", "name role");

  if (!resource) {
    return next(new AppError("Resource not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      resource,
    },
  });
});

// Create new resource
exports.createResource = catchAsync(async (req, res, next) => {
  const resourceData = req.body;

  // Ensure location has the proper GeoJSON format
  if (resourceData.location && resourceData.location.coordinates) {
    resourceData.location.type = "Point";
  }

  const resource = await Resource.create(resourceData);

  // Create audit log
  await AuditLog.create({
    action: "resource_created",
    user: req.user._id,
    details: {
      resourceId: resource._id,
      resourceName: resource.name,
      category: resource.category,
    },
  });

  res.status(201).json({
    status: "success",
    data: {
      resource,
    },
  });
});

// Update resource
exports.updateResource = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid resource ID", 400));
  }

  // If updating location coordinates, ensure we maintain the GeoJSON format
  if (updateData.location && updateData.location.coordinates) {
    updateData.location.type = "Point";
  }

  const resource = await Resource.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!resource) {
    return next(new AppError("Resource not found", 404));
  }

  // Create audit log
  await AuditLog.create({
    action: "resource_updated",
    user: req.user._id,
    details: {
      resourceId: resource._id,
      resourceName: resource.name,
      changes: updateData,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      resource,
    },
  });
});

// Delete resource
exports.deleteResource = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid resource ID", 400));
  }

  const resource = await Resource.findByIdAndDelete(id);

  if (!resource) {
    return next(new AppError("Resource not found", 404));
  }

  // Create audit log
  await AuditLog.create({
    action: "resource_deleted",
    user: req.user._id,
    details: {
      resourceId: id,
      resourceName: resource.name,
    },
  });

  res.status(204).send();
});

// Allocate resource to a team or emergency
exports.allocateResource = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { teamId, quantity, emergencyId, notes } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid resource ID", 400));
  }

  if (teamId && !mongoose.Types.ObjectId.isValid(teamId)) {
    return next(new AppError("Invalid team ID", 400));
  }

  if (emergencyId && !mongoose.Types.ObjectId.isValid(emergencyId)) {
    return next(new AppError("Invalid emergency ID", 400));
  }

  const resource = await Resource.findById(id);

  if (!resource) {
    return next(new AppError("Resource not found", 404));
  }

  // Check if enough resources are available
  if (resource.quantity.available < quantity) {
    return next(
      new AppError("Not enough resources available for allocation", 400)
    );
  }

  // If allocating to a team, check if team exists
  let team = null;
  if (teamId) {
    team = await RescueTeam.findById(teamId);
    if (!team) {
      return next(new AppError("Rescue team not found", 404));
    }
  }

  // Update quantities
  resource.quantity.available -= quantity;
  resource.quantity.inUse += quantity;

  if (teamId) {
    resource.assignedTeam = teamId;
  }

  // Add note if provided
  if (notes) {
    resource.notes.push({
      content: `Allocated ${quantity} units. ${notes}`,
      author: req.user._id,
    });
  }

  await resource.save();

  // Create audit log
  await AuditLog.create({
    action: "resource_allocated",
    user: req.user._id,
    details: {
      resourceId: id,
      resourceName: resource.name,
      quantity,
      teamId,
      emergencyId,
      notes,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      resource,
    },
  });
});

// Deallocate resource (return from use)
exports.deallocateResource = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { quantity, notes, condition } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid resource ID", 400));
  }

  const resource = await Resource.findById(id);

  if (!resource) {
    return next(new AppError("Resource not found", 404));
  }

  // Check if enough resources are in use
  if (resource.quantity.inUse < quantity) {
    return next(
      new AppError(
        "Cannot deallocate more resources than are currently in use",
        400
      )
    );
  }

  // Update quantities
  resource.quantity.available += quantity;
  resource.quantity.inUse -= quantity;

  // Update condition if provided
  if (condition) {
    resource.condition = condition;
  }

  // Remove team assignment if all resources are deallocated
  if (resource.quantity.inUse === 0) {
    resource.assignedTeam = null;
  }

  // Add note if provided
  if (notes) {
    resource.notes.push({
      content: `Deallocated ${quantity} units. ${notes}`,
      author: req.user._id,
    });
  }

  await resource.save();

  // Create audit log
  await AuditLog.create({
    action: "resource_deallocated",
    user: req.user._id,
    details: {
      resourceId: id,
      resourceName: resource.name,
      quantity,
      condition,
      notes,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      resource,
    },
  });
});

// Set resource in maintenance
exports.setMaintenance = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { quantity, notes, expectedReturn } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid resource ID", 400));
  }

  const resource = await Resource.findById(id);

  if (!resource) {
    return next(new AppError("Resource not found", 404));
  }

  // Check if enough resources are available
  if (resource.quantity.available < quantity) {
    return next(
      new AppError("Not enough resources available for maintenance", 400)
    );
  }

  // Update quantities
  resource.quantity.available -= quantity;
  resource.quantity.underMaintenance += quantity;
  resource.lastMaintenance = Date.now();

  if (expectedReturn) {
    resource.nextMaintenance = new Date(expectedReturn);
  }

  // Add note if provided
  if (notes) {
    resource.notes.push({
      content: `Sent ${quantity} units for maintenance. ${notes}`,
      author: req.user._id,
    });
  }

  await resource.save();

  // Create audit log
  await AuditLog.create({
    action: "resource_maintenance_started",
    user: req.user._id,
    details: {
      resourceId: id,
      resourceName: resource.name,
      quantity,
      expectedReturn,
      notes,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      resource,
    },
  });
});

// Complete maintenance and return resources
exports.completeMaintenance = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { quantity, notes, condition, nextMaintenanceDate } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(new AppError("Invalid resource ID", 400));
  }

  const resource = await Resource.findById(id);

  if (!resource) {
    return next(new AppError("Resource not found", 404));
  }

  // Check if enough resources are in maintenance
  if (resource.quantity.underMaintenance < quantity) {
    return next(
      new AppError(
        "Cannot complete maintenance for more resources than are currently under maintenance",
        400
      )
    );
  }

  // Update quantities
  resource.quantity.available += quantity;
  resource.quantity.underMaintenance -= quantity;

  // Update condition if provided
  if (condition) {
    resource.condition = condition;
  }

  // Update next maintenance date if provided
  if (nextMaintenanceDate) {
    resource.nextMaintenance = new Date(nextMaintenanceDate);
  }

  // Add note if provided
  if (notes) {
    resource.notes.push({
      content: `Completed maintenance for ${quantity} units. ${notes}`,
      author: req.user._id,
    });
  }

  await resource.save();

  // Create audit log
  await AuditLog.create({
    action: "resource_maintenance_completed",
    user: req.user._id,
    details: {
      resourceId: id,
      resourceName: resource.name,
      quantity,
      condition,
      nextMaintenanceDate,
      notes,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      resource,
    },
  });
});

// Get resource alerts
exports.getResourceAlerts = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, severity, resolved, type } = req.query;
  const skip = (page - 1) * limit;

  // Find resources with active alerts matching criteria
  const query = { "alerts.0": { $exists: true } }; // Resources with at least one alert

  if (severity) {
    query["alerts.severity"] = severity;
  }

  if (resolved !== undefined) {
    query["alerts.resolved"] = resolved === "true";
  }

  if (type) {
    query["alerts.type"] = type;
  }

  const resources = await Resource.find(query)
    .select("name category alerts status")
    .skip(skip)
    .limit(parseInt(limit));

  // Extract and flatten alerts from resources
  const alerts = resources.flatMap((resource) => {
    return resource.alerts.map((alert) => ({
      resourceId: resource._id,
      resourceName: resource.name,
      resourceCategory: resource.category,
      resourceStatus: resource.status,
      ...alert.toObject(),
    }));
  });

  // Filter alerts by criteria if needed
  let filteredAlerts = alerts;
  if (severity) {
    filteredAlerts = filteredAlerts.filter(
      (alert) => alert.severity === severity
    );
  }

  if (resolved !== undefined) {
    const isResolved = resolved === "true";
    filteredAlerts = filteredAlerts.filter(
      (alert) => alert.resolved === isResolved
    );
  }

  if (type) {
    filteredAlerts = filteredAlerts.filter((alert) => alert.type === type);
  }

  // Sort alerts by timestamp (most recent first)
  filteredAlerts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const total = await Resource.countDocuments(query);

  res.status(200).json({
    status: "success",
    results: filteredAlerts.length,
    total,
    data: {
      alerts: filteredAlerts,
    },
  });
});

// Get resource statistics
exports.getResourceStats = catchAsync(async (req, res, next) => {
  // Get resource counts by category
  const resourcesByCategory = await Resource.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        total: { $sum: "$quantity.total" },
        available: { $sum: "$quantity.available" },
        inUse: { $sum: "$quantity.inUse" },
        underMaintenance: { $sum: "$quantity.underMaintenance" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Get resource counts by status
  const resourcesByStatus = await Resource.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Get resource counts by condition
  const resourcesByCondition = await Resource.aggregate([
    { $group: { _id: "$condition", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  // Resources requiring maintenance soon
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  const maintenanceSoon = await Resource.countDocuments({
    nextMaintenance: { $lte: nextWeek, $gte: new Date() },
  });

  // Resources with critical stock
  const criticalStock = await Resource.countDocuments({
    status: "critical_stock",
  });

  // Total resources by state
  const resourcesByState = await Resource.aggregate([
    {
      $group: {
        _id: "$location.state",
        count: { $sum: 1 },
        total: { $sum: "$quantity.total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      byCategory: resourcesByCategory,
      byStatus: resourcesByStatus,
      byCondition: resourcesByCondition,
      byState: resourcesByState,
      alerts: {
        maintenanceSoon,
        criticalStock,
      },
      totals: {
        resources: await Resource.countDocuments(),
        total: await Resource.aggregate([
          { $group: { _id: null, sum: { $sum: "$quantity.total" } } },
        ]).then((result) => (result.length ? result[0].sum : 0)),
        available: await Resource.aggregate([
          { $group: { _id: null, sum: { $sum: "$quantity.available" } } },
        ]).then((result) => (result.length ? result[0].sum : 0)),
        inUse: await Resource.aggregate([
          { $group: { _id: null, sum: { $sum: "$quantity.inUse" } } },
        ]).then((result) => (result.length ? result[0].sum : 0)),
        underMaintenance: await Resource.aggregate([
          {
            $group: { _id: null, sum: { $sum: "$quantity.underMaintenance" } },
          },
        ]).then((result) => (result.length ? result[0].sum : 0)),
      },
    },
  });
});

// Get nearby resources
exports.getNearbyResources = catchAsync(async (req, res, next) => {
  const { lat, lng, radius = 10, category } = req.query; // radius in km

  if (!lat || !lng) {
    return next(
      new AppError(
        "Latitude and longitude are required for proximity search",
        400
      )
    );
  }

  const query = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [parseFloat(lng), parseFloat(lat)],
        },
        $maxDistance: parseInt(radius) * 1000, // convert km to meters
      },
    },
  };

  // Filter by category if provided
  if (category) {
    query.category = category;
  }

  // Filter by available resources only
  query["quantity.available"] = { $gt: 0 };

  const resources = await Resource.find(query).populate(
    "assignedTeam",
    "name contactInfo"
  );

  res.status(200).json({
    status: "success",
    results: resources.length,
    data: {
      resources,
    },
  });
});
