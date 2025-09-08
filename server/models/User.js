const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    governmentId: {
      type: String,
      sparse: true,
      unique: true,
    },
    location: {
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
      district: String,
      state: String,
      pincode: String,
    },
    role: {
      type: String,
      enum: ["citizen", "volunteer", "official", "admin"],
      default: "citizen",
    },
    trustScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 1000,
    },
    reportsSubmitted: {
      type: Number,
      default: 0,
    },
    verifiedReports: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String, // Base64 string or URL
      default: null,
    },
    preferences: {
      language: {
        type: String,
        default: "en",
        enum: [
          "en",
          "hi",
          "bn",
          "te",
          "mr",
          "ta",
          "gu",
          "kn",
          "ml",
          "or",
          "as",
        ],
      },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      emergencyContacts: [
        {
          name: String,
          phone: String,
          relationship: String,
        },
      ],
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create geospatial index
userSchema.index({ location: "2dsphere" });
userSchema.index({ district: 1, state: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.password.trim() === "") return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update trust score based on report accuracy
userSchema.methods.updateTrustScore = function (reportAccuracy) {
  if (reportAccuracy === "verified") {
    this.trustScore = Math.min(1000, this.trustScore + 10);
    this.verifiedReports += 1;
  } else if (reportAccuracy === "false") {
    this.trustScore = Math.max(0, this.trustScore - 20);
  }
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
