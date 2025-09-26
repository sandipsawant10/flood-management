const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { auth: authenticateToken } = require("../middleware/auth");

// Return VAPID public key for web-push subscriptions
router.get("/vapid-public-key", async (req, res) => {
  try {
    const vapidKey = process.env.VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      // If VAPID is not configured, return 204 No Content so clients know
      // push subscription is intentionally disabled in this environment.
      console.info(
        "VAPID public key not configured - skipping push subscription"
      );
      return res.status(204).send();
    }

    // Return the key as plain text (client expects text)
    res.type("text").send(vapidKey);
  } catch (error) {
    console.error("Error retrieving VAPID public key:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Accept a push subscription from the client and store it (basic placeholder)
router.post("/register", async (req, res) => {
  try {
    const subscription = req.body;
    if (!subscription) {
      return res.status(400).json({ message: "No subscription provided" });
    }

    // TODO: Persist subscription associated with authenticated user or anonymous id
    // For now, log and return success
    console.info(
      "Received push subscription (truncated):",
      JSON.stringify(subscription).slice(0, 200)
    );

    res.status(200).json({ message: "Subscription received" });
  } catch (error) {
    console.error("Error registering subscription:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all notifications for the authenticated user
router.get("/", authenticateToken, async (req, res) => {
  // Check if user exists in request
  if (!req.user) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  try {
    const { type, search, unreadOnly, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { recipient: req.user.id };

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    // Filter by search term if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by read status if requested
    if (unreadOnly === "true") {
      query.isRead = false;
    }

    // Execute query with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get unread notification count
router.get("/unread-count", authenticateToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get a single notification by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark a notification as read
router.patch("/:id/read", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark all notifications as read
router.patch("/mark-all-read", authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a notification
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a notification (admin/system only)
router.post("/", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { recipient, title, message, type, relatedItem, metadata } = req.body;

    if (!recipient || !title || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const notification = new Notification({
      recipient,
      title,
      message,
      type: type || "info",
      relatedItem,
      metadata,
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
