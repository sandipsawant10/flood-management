const Joi = require("joi");

const getResourcesSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).optional(),
  category: Joi.string().optional(),
  status: Joi.string().optional(),
  search: Joi.string().optional(),
  sortBy: Joi.string().optional(),
});

const createResourceSchema = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().required(),
  quantity: Joi.object({
    total: Joi.number().integer().min(0).required(),
    available: Joi.number().integer().min(0).required(),
  }).required(),
  location: Joi.object().optional(),
});

const getResourceSchema = Joi.object({
  id: Joi.string().required(),
});

const updateResourceSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().optional(),
  category: Joi.string().optional(),
  quantity: Joi.object().optional(),
  location: Joi.object().optional(),
});

const deleteResourceSchema = Joi.object({
  id: Joi.string().required(),
});

const allocateResourceSchema = Joi.object({
  id: Joi.string().required(),
  teamId: Joi.string().optional(),
  quantity: Joi.number().integer().min(1).required(),
  emergencyId: Joi.string().optional(),
  notes: Joi.string().optional(),
});

const deallocateResourceSchema = Joi.object({
  id: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  notes: Joi.string().optional(),
  condition: Joi.string().optional(),
});

const setMaintenanceSchema = Joi.object({
  id: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  notes: Joi.string().optional(),
  expectedReturn: Joi.date().optional(),
});

const completeMaintenanceSchema = Joi.object({
  id: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  notes: Joi.string().optional(),
  condition: Joi.string().optional(),
  nextMaintenanceDate: Joi.date().optional(),
});

const getResourceAlertsSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).optional(),
  severity: Joi.string().optional(),
  resolved: Joi.boolean().optional(),
});

const getNearbyResourcesSchema = Joi.object({
  lat: Joi.number().optional(),
  lng: Joi.number().optional(),
  radius: Joi.number().optional(),
  category: Joi.string().optional(),
});

module.exports = {
  getResourcesSchema,
  createResourceSchema,
  getResourceSchema,
  updateResourceSchema,
  deleteResourceSchema,
  allocateResourceSchema,
  deallocateResourceSchema,
  setMaintenanceSchema,
  completeMaintenanceSchema,
  getResourceAlertsSchema,
  getNearbyResourcesSchema,
};

// Grouped export used by routes
module.exports.resourceValidation = {
  getResourcesSchema,
  createResourceSchema,
  getResourceSchema,
  updateResourceSchema,
  deleteResourceSchema,
  allocateResourceSchema,
  deallocateResourceSchema,
  setMaintenanceSchema,
  completeMaintenanceSchema,
  getResourceAlertsSchema,
  getNearbyResourcesSchema,
};
