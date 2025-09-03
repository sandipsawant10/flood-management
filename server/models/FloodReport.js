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
      ],
      required: true,
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

module.exports = mongoose.model("FloodReport", floodReportSchema);
