const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: String,
    district: String,
    state: String
  },
  assignedTeam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RescueTeam'
  },
  requiredSpecializations: [{
    type: String,
    enum: ['medical', 'firefighting', 'waterRescue', 'search', 'evacuation', 'logistics']
  }],
  estimatedDuration: {
    type: Number, // in minutes
    default: 60
  },
  startTime: Date,
  completionTime: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedFloodReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FloodReport'
  },
  notes: [{
    content: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  resources: [{
    type: String,
    required: true
  }]
}, {
  timestamps: true
});

assignmentSchema.index({ location: '2dsphere' });
assignmentSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);