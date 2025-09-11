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
      enum: ["low", "medium", "high", "critical"],
      default: "low",
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
floodReportSchema.pre('save', function (next) {
  if (this.isModified('waterLevel') && (this.depth === undefined || this.depth === 0)) {
    switch (this.waterLevel) {
      case 'low':
        this.depth = Math.random() * (0.5 - 0.1) + 0.1; // 0.1 to 0.5 meters
        break;
      case 'medium':
        this.depth = Math.random() * (1.5 - 0.6) + 0.6; // 0.6 to 1.5 meters
        break;
      case 'high':
        this.depth = Math.random() * (3.0 - 1.6) + 1.6; // 1.6 to 3.0 meters
        break;
      case 'critical':
        this.depth = Math.random() * (6.0 - 3.1) + 3.1; // 3.1 to 6.0 meters
        break;
      default:
        this.depth = 0; // Default to 0 if waterLevel is not recognized
    }
  }
  next();
});

module.exports = mongoose.model("FloodReport", floodReportSchema);
