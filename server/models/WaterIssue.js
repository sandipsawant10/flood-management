const mongoose = require("mongoose");

const waterIssueSchema = new mongoose.Schema(
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
      municipalWard: String,
    },
    issueType: {
      type: String,
      enum: [
        "supply-interruption",
        "low-pressure",
        "water-quality",
        "contamination",
        "leakage",
        "infrastructure",
        "other",
      ],
      required: true,
    },
    issueDetails: {
      // Supply interruption specific fields
      duration: {
        type: String,
        enum: ["hours", "day", "2-3-days", "week", "more-than-week"],
      },
      frequency: {
        type: String,
        enum: ["first-time", "occasional", "frequent", "persistent"],
      },

      // Water quality specific fields
      colorAbnormality: {
        type: String,
        enum: ["none", "brown", "yellow", "cloudy", "other"],
      },
      odorAbnormality: Boolean,
      tasteAbnormality: Boolean,

      // Infrastructure
      infrastructureType: {
        type: String,
        enum: ["pipe", "valve", "hydrant", "tank", "pump", "meter", "other"],
      },

      // Common fields
      affectedPopulation: {
        type: String,
        enum: [
          "household",
          "building",
          "street",
          "neighborhood",
          "area",
          "entire-locality",
        ],
      },
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
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
      enum: ["pending", "verified", "disputed", "false", "resolved"],
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
    status: {
      type: String,
      enum: [
        "reported",
        "under-investigation",
        "acknowledged",
        "in-progress",
        "scheduled",
        "resolved",
        "closed",
      ],
      default: "reported",
    },
    resolution: {
      resolvedAt: Date,
      resolution: String,
      assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to a municipal worker or relevant authority
      },
      estimatedResolutionTime: Date,
      resolutionSteps: [
        {
          step: String,
          completedAt: Date,
          status: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending",
          },
        },
      ],
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
    tags: [String], // e.g., ['health-hazard', 'affects-children', 'industrial-contamination']

    // For municipality reporting
    municipalityResponse: {
      respondedAt: Date,
      estimatedFixTime: Date,
      message: String,
      actionTaken: String,
      contactPerson: String,
      contactNumber: String,
    },

    // Connection to water quality tests if applicable
    waterQualityTest: {
      performedAt: Date,
      results: mongoose.Schema.Types.Mixed, // Store test results with parameters
      conductedBy: String,
      conclusion: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
waterIssueSchema.index({ location: "2dsphere" });
waterIssueSchema.index({ district: 1, state: 1 });
waterIssueSchema.index({ severity: 1, createdAt: -1 });
waterIssueSchema.index({ verificationStatus: 1 });
waterIssueSchema.index({ isActive: 1, createdAt: -1 });
waterIssueSchema.index({ issueType: 1 });
waterIssueSchema.index({ "municipalityResponse.estimatedFixTime": 1 });

// Calculate credibility score based on reporter trust score and community votes
waterIssueSchema.virtual("credibilityScore").get(function () {
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

// Pre-save hook to automatically set urgency based on issue type and severity
waterIssueSchema.pre("save", function (next) {
  if (this.isModified("issueType") || this.isModified("severity")) {
    // Base urgency on severity
    let urgency = 5;
    switch (this.severity) {
      case "low":
        urgency = 3;
        break;
      case "medium":
        urgency = 5;
        break;
      case "high":
        urgency = 7;
        break;
      case "critical":
        urgency = 10;
        break;
    }

    // Adjust based on issue type
    if (this.issueType === "contamination") {
      urgency = Math.min(10, urgency + 2); // Water contamination is serious
    } else if (
      this.issueType === "water-quality" &&
      this.issueDetails?.tasteAbnormality
    ) {
      urgency = Math.min(10, urgency + 1);
    }

    this.urgencyLevel = urgency;
  }
  next();
});

// Auto-expire old resolved issues
waterIssueSchema.methods.checkExpiry = function () {
  if (this.status === "resolved") {
    const daysOld =
      (Date.now() - this.resolution?.resolvedAt) / (1000 * 60 * 60 * 24);
    if (daysOld > 30 && this.isActive) {
      // Auto-expire after 30 days of being resolved
      this.isActive = false;
      return this.save();
    }
  }
};

module.exports = mongoose.model("WaterIssue", waterIssueSchema);
