const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    alertType: {
      type: String,
      enum: ["warning", "watch", "advisory", "emergency", "all-clear"],
      required: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    // Center point of the alert for distance calculations
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
      address: String, // Human-readable location
    },
    // Area affected by the alert
    targetArea: {
      type: {
        type: String,
        enum: ["Polygon", "Circle"],
        required: true,
      },
      coordinates: {
        type: mongoose.Schema.Types.Mixed, // Flexible for different geometry types
        required: true,
      },
      districts: [String],
      states: [String],
      radius: Number, // for Circle type
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    source: {
      type: String,
      enum: ["IMD", "CWC", "NDRF", "community", "ai-prediction", "satellite"],
      required: true,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    instructions: [String], // Array of safety instructions
    emergencyContacts: [
      {
        name: String,
        phone: String,
        type: String, // police, hospital, disaster-management
      },
    ],
    relatedReports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FloodReport",
      },
    ],

    // Delivery tracking
    deliveryStatus: {
      total: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      channels: {
        app: { type: Number, default: 0 },
        sms: { type: Number, default: 0 },
        email: { type: Number, default: 0 },
        voice: { type: Number, default: 0 },
      },
    },

    priority: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Multi-language support
    translations: {
      hi: { title: String, message: String, instructions: [String] },
      bn: { title: String, message: String, instructions: [String] },
      te: { title: String, message: String, instructions: [String] },
      mr: { title: String, message: String, instructions: [String] },
      ta: { title: String, message: String, instructions: [String] },
      gu: { title: String, message: String, instructions: [String] },
      kn: { title: String, message: String, instructions: [String] },
      ml: { title: String, message: String, instructions: [String] },
      or: { title: String, message: String, instructions: [String] },
      as: { title: String, message: String, instructions: [String] },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for geo-spatial queries
alertSchema.index({ targetArea: "2dsphere" });
alertSchema.index({ alertType: 1, severity: 1 });
alertSchema.index({ validFrom: 1, validUntil: 1 });
alertSchema.index({ isActive: 1, createdAt: -1 });

// Auto-deactivate expired alerts
alertSchema.methods.checkExpiry = function () {
  if (Date.now() > this.validUntil && this.isActive) {
    this.isActive = false;
    return this.save();
  }
};

module.exports = mongoose.model("Alert", alertSchema);
