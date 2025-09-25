const mongoose = require("mongoose");

/**
 * AuditLog Schema
 * Used to track system actions for accountability and monitoring
 */
const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, "An action type is required"],
      enum: [
        "resource_created",
        "resource_updated",
        "resource_deleted",
        "resource_allocated",
        "resource_deallocated",
        "resource_maintenance_started",
        "resource_maintenance_completed",
        "user_login",
        "user_logout",
        "user_created",
        "user_updated",
        "user_deleted",
        "emergency_created",
        "emergency_updated",
        "emergency_closed",
        "alert_created",
        "alert_updated",
        "alert_deleted",
        "settings_changed",
        "report_generated",
        "permission_changed",
        "system_error",
        "other",
      ],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "An audit log must belong to a user"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Details about the action are required"],
    },
    ipAddress: String,
    userAgent: String,
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },
    success: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ severity: 1 });

// Pre-save middleware to set severity based on action
auditLogSchema.pre("save", function (next) {
  // Set severity based on action type
  if (
    ["user_deleted", "permission_changed", "system_error"].includes(this.action)
  ) {
    this.severity = "high";
  } else if (
    ["resource_deleted", "emergency_created", "alert_created"].includes(
      this.action
    )
  ) {
    this.severity = "medium";
  }
  next();
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLog;
