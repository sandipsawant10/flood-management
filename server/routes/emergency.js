const express = require("express");
const router = express.Router();
const { authorize } = require("../middleware/auth");
const Emergency = require("../models/Emergency");
const RescueTeam = require("../models/RescueTeam");
const Resource = require("../models/Resource");
const notificationService = require("../services/notificationService");

// Get all active emergencies
router.get("/active", async (req, res) => {
  try {
    // Check if team ID is provided for filtering
    const query = req.query.teamId
      ? { status: { $ne: "resolved" }, assignedTeam: req.query.teamId }
      : { status: { $ne: "resolved" } };

    // For public users, only show public emergencies
    if (
      !req.user ||
      (req.user.role !== "admin" && req.user.role !== "rescuer")
    ) {
      query.isPublic = true;
    }

    const emergencies = await Emergency.find(query)
      .sort({ createdAt: -1 })
      .populate("location")
      .populate("assignedTeam");
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active rescue teams with their locations
router.get("/teams/active", async (req, res) => {
  try {
    // For security, limit what data is returned based on user role
    let teams;

    if (
      req.user &&
      (req.user.role === "admin" || req.user.role === "rescuer")
    ) {
      // Admin and rescuers see all team details
      teams = await RescueTeam.find({ status: "active" })
        .select("name status location lastUpdated memberCount")
        .sort({ name: 1 });
    } else {
      // Public users see limited data
      teams = await RescueTeam.find({ status: "active", isPublic: true })
        .select("name location")
        .sort({ name: 1 });
    }

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get team members
router.get(
  "/team/:teamId/members",
  authorize(["rescuer", "admin"]),
  async (req, res) => {
    try {
      const team = await RescueTeam.findById(req.params.teamId)
        .populate("members")
        .populate("leader");
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team.members);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update team member status
router.put(
  "/team/member/:memberId/status",
  authorize(["rescuer", "admin"]),
  async (req, res) => {
    try {
      const { status } = req.body;
      const member = await RescueTeam.findOneAndUpdate(
        { "members._id": req.params.memberId },
        {
          $set: {
            "members.$.status": status,
            "members.$.lastUpdate": new Date(),
          },
        },
        { new: true }
      );
      if (!member) {
        return res.status(404).json({ message: "Team member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get team resources
router.get(
  "/team/:teamId/resources",
  authorize(["rescuer", "admin"]),
  async (req, res) => {
    try {
      const resources = await Resource.find({ team: req.params.teamId }).sort({
        category: 1,
        name: 1,
      });
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update resource quantity
router.put(
  "/team/resource/:resourceId",
  authorize(["rescuer", "admin"]),
  async (req, res) => {
    try {
      const { quantity } = req.body;
      const resource = await Resource.findByIdAndUpdate(
        req.params.resourceId,
        { $set: { quantity, lastUpdate: new Date() } },
        { new: true }
      );
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }

      // Check if quantity is below threshold and notify if needed
      if (quantity <= resource.threshold * 0.2) {
        await notificationService.sendLowResourceAlert(resource);
      }

      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Update emergency status
router.put(
  "/:emergencyId/status",
  authorize(["rescuer", "admin"]),
  async (req, res) => {
    try {
      const { status, notes } = req.body;
      const emergency = await Emergency.findByIdAndUpdate(
        req.params.emergencyId,
        {
          $set: { status },
          $push: {
            statusHistory: {
              status,
              notes,
              updatedBy: req.user._id,
              timestamp: new Date(),
            },
          },
        },
        { new: true }
      );
      if (!emergency) {
        return res.status(404).json({ message: "Emergency not found" });
      }

      // Notify relevant parties about status change
      await notificationService.sendEmergencyStatusUpdate(emergency);

      res.json(emergency);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Legacy endpoints for backward compatibility
router.get("/data", (req, res) => {
  const emergencyData = {
    hospitals: [
      {
        id: 1,
        name: "City General Hospital",
        type: "hospital",
        distance: 1.2,
        phone: "+91-11-12345678",
      },
    ],
    shelters: [
      {
        id: 2,
        name: "Community Shelter",
        type: "shelter",
        distance: 0.8,
        capacity: 200,
      },
    ],
  };
  res.json(emergencyData);
});

router.get("/incidents", (req, res) => {
  const incidents = [
    {
      id: 1,
      type: "flood",
      severity: "high",
      location: "Downtown Area",
      timestamp: new Date().toISOString(),
    },
  ];
  res.json(incidents);
});

router.get("/contacts", (req, res) => {
  const emergencyContacts = [
    { name: "Police", number: "100", type: "police" },
    { name: "Fire Services", number: "101", type: "fire" },
    { name: "Medical Emergency", number: "108", type: "medical" },
    { name: "Disaster Management", number: "1070", type: "disaster" },
  ];
  res.json(emergencyContacts);
});

module.exports = router;
