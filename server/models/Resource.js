const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['vehicle', 'equipment', 'medical', 'communication', 'rescue', 'other']
  },
  description: {
    type: String,
    maxlength: 500
  },
  quantity: {
    total: {
      type: Number,
      required: true,
      min: 0
    },
    available: {
      type: Number,
      required: true,
      min: 0
    },
    inUse: {
      type: Number,
      default: 0,
      min: 0
    },
    underMaintenance: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['available', 'low_stock', 'critical_stock', 'out_of_stock'],
    default: 'available'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
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
  lastMaintenance: Date,
  nextMaintenance: Date,
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  specifications: {
    type: Map,
    of: String
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
  alerts: [{
    type: {
      type: String,
      enum: ['maintenance_due', 'low_stock', 'damage_report']
    },
    message: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    resolved: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Indexes for efficient querying
resourceSchema.index({ 'location': '2dsphere' });
resourceSchema.index({ category: 1, status: 1 });
resourceSchema.index({ assignedTeam: 1 });

// Update status based on quantity
resourceSchema.pre('save', function(next) {
  const availablePercentage = (this.quantity.available / this.quantity.total) * 100;
  
  if (this.quantity.available === 0) {
    this.status = 'out_of_stock';
  } else if (availablePercentage <= 10) {
    this.status = 'critical_stock';
  } else if (availablePercentage <= 30) {
    this.status = 'low_stock';
  } else {
    this.status = 'available';
  }
  
  next();
});

// Virtual for utilization percentage
resourceSchema.virtual('utilizationPercentage').get(function() {
  return Math.round((this.quantity.inUse / this.quantity.total) * 100);
});

module.exports = mongoose.model('Resource', resourceSchema);