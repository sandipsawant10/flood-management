const mongoose = require('mongoose');

const municipalitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  state: {
    type: String,
    required: true
  },
  boundary: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]],
      required: true
    }
  },
  population: {
    type: Number,
    required: true
  },
  administrators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  emergencyContacts: [{
    name: String,
    role: String,
    phone: String,
    email: String
  }],
  evacuationZones: [{
    name: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    },
    capacity: Number,
    currentOccupancy: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['available', 'full', 'closed'],
      default: 'available'
    },
    facilities: [String]
  }],
  alertSettings: {
    autoAlert: {
      type: Boolean,
      default: true
    },
    alertThresholds: {
      rainfall: Number,
      waterLevel: Number,
      windSpeed: Number
    },
    notificationChannels: [{
      type: String,
      enum: ['sms', 'email', 'push', 'social']
    }]
  },
  statistics: {
    activeRescueTeams: {
      type: Number,
      default: 0
    },
    totalEvacuated: {
      type: Number,
      default: 0
    },
    activeEmergencies: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

municipalitySchema.index({ boundary: '2dsphere' });
municipalitySchema.index({ 'evacuationZones.location': '2dsphere' });

module.exports = mongoose.model('Municipality', municipalitySchema);