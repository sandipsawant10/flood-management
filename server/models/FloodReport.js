const mongoose = require("mongoose");

const floodReportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: String,
      district: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      landmark: String,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
    waterLevel: {
      type: String,
      enum: [
        "ankle-deep",
        "knee-deep",
        "waist-deep",
        "chest-deep",
        "above-head",
        "minor-pooling",
        "window-level",
        "roof-level",
        "above-roof",
      ],
      default: "ankle-deep",
    },
    depth: {
      type: Number,
      min: 0,
      default: 0,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    mediaFiles: [
      {
        type: String, // Cloudinary URLs
        validate: {
          validator: function (v) {
            return /^https?:\/\/.+\.(jpg|jpeg|png|gif|mp4|avi|mov)$/i.test(v);
          },
          message: "Invalid media file URL",
        },
      },
    ],
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "disputed", "false"],
      default: "pending",
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verificationNotes: String,
    communityVotes: {
      upvotes: {
        type: Number,
        default: 0,
      },
      downvotes: {
        type: Number,
        default: 0,
      },
      voters: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          vote: {
            type: String,
            enum: ["up", "down"],
          },
        },
      ],
    },
    impact: {
      affectedPeople: Number,
      damagedProperties: Number,
      blockedRoads: [String],
      economicLoss: Number,
    },
    weatherConditions: {
      rainfall: Number, // mm
      temperature: Number, // celsius
      humidity: Number, // percentage
      windSpeed: Number, // km/h
    },
    urgencyLevel: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resolvedAt: Date,
    tags: [String], // e.g., ['rescue-needed', 'medical-emergency', 'evacuation']

    // AI/ML predictions
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    predictedSeverity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
    },
    verification: {
      status: {
        type: String,
        enum: ["pending", "verified", "not-matched", "manual-review"],
        default: "pending",
      },
      summary: String,
      weather: {
        status: {
          type: String,
          enum: ["pending", "matched", "not-matched"],
          default: "pending",
        },
        snapshot: Object, // Store raw API response or key data
        message: String, // e.g., "Heavy rain detected"
      },
      news: {
        status: {
          type: String,
          enum: ["pending", "matched", "not-matched"],
          default: "pending",
        },
        snapshot: Object, // Store raw API response or key data
        message: String, // e.g., "News matches report"
      },
      social: {
        // Instagram (Optional, stubbed for future use)
        status: {
          type: String,
          enum: ["pending", "matched", "not-matched", "coming-soon"],
          default: "coming-soon",
        },
        snapshot: Object, // Store raw API response or key data
        message: String, // e.g., "Social media posts found"
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
floodReportSchema.index({ location: "2dsphere" });
floodReportSchema.index({ district: 1, state: 1 });
floodReportSchema.index({ severity: 1, createdAt: -1 });
floodReportSchema.index({ verificationStatus: 1 });
floodReportSchema.index({ isActive: 1, createdAt: -1 });

// Calculate credibility score based on reporter trust score and community votes
floodReportSchema.virtual("credibilityScore").get(function () {
  const reporterTrustWeight = 0.6;
  const communityVoteWeight = 0.4;

  const totalVotes =
    this.communityVotes.upvotes + this.communityVotes.downvotes;
  const voteRatio =
    totalVotes > 0 ? this.communityVotes.upvotes / totalVotes : 0.5;

  return Math.round(
    ((this.reportedBy.trustScore / 1000) * reporterTrustWeight +
      voteRatio * communityVoteWeight) *
      100
  );
});

// Auto-expire old reports
floodReportSchema.methods.checkExpiry = function () {
  const hoursOld = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  if (hoursOld > 48 && this.isActive) {
    // Auto-expire after 48 hours
    this.isActive = false;
    return this.save();
  }
};

// Pre-save hook to calculate depth based on waterLevel if depth is not provided
floodReportSchema.pre("save", function (next) {
  if (
    this.isModified("waterLevel") &&
    (this.depth === undefined || this.depth === 0)
  ) {
    switch (this.waterLevel) {
      case "minor-pooling":
        this.depth = Math.random() * (0.1 - 0.01) + 0.01; // 0.01 to 0.1 meters
        break;
      case "ankle-deep":
        this.depth = Math.random() * (0.3 - 0.1) + 0.1; // 0.1 to 0.3 meters
        break;
      case "knee-deep":
        this.depth = Math.random() * (0.7 - 0.3) + 0.3; // 0.3 to 0.7 meters
        break;
      case "waist-deep":
        this.depth = Math.random() * (1.2 - 0.7) + 0.7; // 0.7 to 1.2 meters
        break;
      case "chest-deep":
        this.depth = Math.random() * (1.8 - 1.2) + 1.2; // 1.2 to 1.8 meters
        break;
      case "above-head":
      case "window-level":
        this.depth = Math.random() * (3.0 - 1.8) + 1.8; // 1.8 to 3.0 meters
        break;
      case "roof-level":
        this.depth = Math.random() * (6.0 - 3.0) + 3.0; // 3.0 to 6.0 meters
        break;
      case "above-roof":
        this.depth = Math.random() * (10.0 - 6.0) + 6.0; // 6.0 to 10.0 meters
        break;
      default:
        this.depth = 0; // Default to 0 if waterLevel is not recognized
    }
  }
  next();
});

module.exports = mongoose.model("FloodReport", floodReportSchema);
