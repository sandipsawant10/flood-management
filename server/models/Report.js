const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema({
  weather: {
    summary: { type: String, default: 'N/A' },
    status: { type: String, enum: ['verified', 'not-matched', 'pending', 'error'], default: 'pending' },
    snapshot: { type: mongoose.Schema.Types.Mixed }, // Store raw API response
  },
  news: {
    summary: { type: String, default: 'N/A' },
    status: { type: String, enum: ['verified', 'not-matched', 'pending', 'error'], default: 'pending' },
    snapshot: { type: mongoose.Schema.Types.Mixed }, // Store raw API response
  },
  social: {
    summary: { type: String, default: 'Coming soon - Optional' },
    status: { type: String, enum: ['verified', 'not-matched', 'pending', 'error'], default: 'pending' },
    snapshot: { type: mongoose.Schema.Types.Mixed }, // Store raw API response
  },
  overallStatus: {
    type: String,
    enum: ['pending', 'verified', 'partially-verified', 'not-matched', 'manual-review'],
    default: 'pending',
  },
  lastVerifiedAt: { type: Date, default: Date.now },
});

const ReportSchema = new mongoose.Schema({
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    address: String,
    district: String,
    state: String,
    landmark: String,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  },
  waterLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
  },
  depth: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    required: true,
  },
  mediaFiles: [
    {
      type: String,
    },
  ],
  weatherConditions: {
    type: mongoose.Schema.Types.Mixed,
  },
  verification: VerificationSchema, // Embed the verification schema
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low',
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'disputed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for geospatial queries
ReportSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Report', ReportSchema);