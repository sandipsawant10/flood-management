const mongoose = require("mongoose");

const emergencySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["flood", "landslide", "earthquake", "fire", "other"],
    },
    severity: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "critical"],
    },
    status: {
      type: String,
      required: true,
      enum: ["reported", "assigned", "in_progress", "resolved", "cancelled"],
      default: "reported",
    },
    // Support both referenced and embedded location for flexibility
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
    // Embedded location for direct map access
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: String,
    },
    // Flag for public visibility
    isPublic: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: true,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RescueTeam",
    },
    affectedArea: {
      radius: {
        type: Number,
        required: true,
        min: 0,
      },
      unit: {
        type: String,
        enum: ["meters", "kilometers"],
        default: "meters",
      },
    },
    estimatedPeopleAffected: {
      type: Number,
      min: 0,
    },
    resources: [
      {
        type: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
        status: {
          type: String,
          enum: ["requested", "allocated", "depleted"],
          default: "requested",
        },
      },
    ],
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        notes: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // External emergency service references
    externalReferences: [
      {
        service: {
          type: String,
          required: true,
          enum: ["police", "ambulance", "fire", "ndrf", "other"],
        },
        referenceId: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        status: String,
        notes: String,
      },
    ],
    priority: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 3,
    },
    weatherConditions: {
      temperature: Number,
      rainfall: Number,
      windSpeed: Number,
      visibility: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
emergencySchema.index({ status: 1, createdAt: -1 });
emergencySchema.index({ coordinates: "2dsphere" });

// Calculate priority based on severity and affected people
emergencySchema.pre("save", function (next) {
  if (this.severity === "critical") {
    this.priority = 5;
  } else if (this.severity === "high" && this.estimatedPeopleAffected > 100) {
    this.priority = 4;
  }
  next();
});

const Emergency = mongoose.model("Emergency", emergencySchema);

module.exports = Emergency;
