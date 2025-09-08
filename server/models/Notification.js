const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["alert", "info", "success"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedItem: {
      type: {
        type: String,
        enum: ["floodReport", "alert", "user", "system"],
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "relatedItem.type",
      },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    expiresAt: {
      type: Date,
      default: function() {
        // Default expiration: 30 days from creation
        const now = new Date();
        return new Date(now.setDate(now.getDate() + 30));
      },
    },
  },
  { timestamps: true }
);

// Index for faster queries
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, type: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;