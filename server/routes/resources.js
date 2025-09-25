const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resourceController");
const authMiddleware = require("../middleware/auth");
const { validateRequest } = require("../middleware/validation");
const { resourceValidation } = require("../validations");

// Protect all resource routes
router.use(authMiddleware.protect);

// Routes accessible by admin and municipality roles
router.use(authMiddleware.restrictTo("admin", "municipality"));

// Resource management endpoints
router.get(
  "/",
  validateRequest(resourceValidation.getResourcesSchema),
  resourceController.getResources
);

router.post(
  "/",
  validateRequest(resourceValidation.createResourceSchema),
  resourceController.createResource
);

router.get(
  "/:id",
  validateRequest(resourceValidation.getResourceSchema),
  resourceController.getResource
);

router.put(
  "/:id",
  validateRequest(resourceValidation.updateResourceSchema),
  resourceController.updateResource
);

router.delete(
  "/:id",
  validateRequest(resourceValidation.deleteResourceSchema),
  resourceController.deleteResource
);

// Resource allocation endpoints
router.post(
  "/:id/allocate",
  validateRequest(resourceValidation.allocateResourceSchema),
  resourceController.allocateResource
);

router.post(
  "/:id/deallocate",
  validateRequest(resourceValidation.deallocateResourceSchema),
  resourceController.deallocateResource
);

// Resource maintenance endpoints
router.post(
  "/:id/maintenance",
  validateRequest(resourceValidation.setMaintenanceSchema),
  resourceController.setMaintenance
);

router.post(
  "/:id/complete-maintenance",
  validateRequest(resourceValidation.completeMaintenanceSchema),
  resourceController.completeMaintenance
);

// Resource alerts
router.get(
  "/alerts",
  validateRequest(resourceValidation.getResourceAlertsSchema),
  resourceController.getResourceAlerts
);

// Resource statistics
router.get("/stats", resourceController.getResourceStats);

// Resource geolocation
router.get(
  "/nearby",
  validateRequest(resourceValidation.getNearbyResourcesSchema),
  resourceController.getNearbyResources
);

module.exports = router;
