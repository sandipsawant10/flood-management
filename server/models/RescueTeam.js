const mongoose = require('mongoose');

const rescueTeamSchema = new mongoose.Schema({
  teamName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  leader: {
    type: String,
    required: true,
    trim: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  members: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    contact: {
      type: String,
      required: true,
      trim: true
    },
    specialization: {
      type: String,
      default: 'general'
    }
  }],
  specialization: {
    type: String,
    enum: ['general', 'water', 'medical', 'evacuation'],
    default: 'general'
  },
  vehicle: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'assigned', 'enroute', 'onsite', 'unavailable'],
    default: 'available'
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    }
  },
  currentAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emergency',
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for geospatial queries
rescueTeamSchema.index({ currentLocation: '2dsphere' });

// Method to find nearby teams
rescueTeamSchema.statics.findNearby = function(coordinates, maxDistance = 5000) {
  return this.find({
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    status: 'available'
  });
};

// Method to update team status
rescueTeamSchema.methods.updateStatus = function(newStatus, assignment = null) {
  this.status = newStatus;
  if (assignment) {
    this.currentAssignment = assignment;
  }
  this.lastUpdated = new Date();
  return this.save();
};

// Method to update location
rescueTeamSchema.methods.updateLocation = function(coordinates, address) {
  this.currentLocation = {
    type: 'Point',
    coordinates: coordinates,
    address: address
  };
  this.lastUpdated = new Date();
  return this.save();
};

const RescueTeam = mongoose.model('RescueTeam', rescueTeamSchema);

module.exports = RescueTeam;