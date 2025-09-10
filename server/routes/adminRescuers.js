const express = require('express');
const router = express.Router();
const RescueTeam = require('../models/RescueTeam');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const FloodReport = require('../models/FloodReport');
const Resource = require('../models/Resource');
const { auth } = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

// Get all rescue teams
router.get('/teams', auth, roleAuth(['admin', 'municipality']), async (req, res) => {
  try {
    const teams = await RescueTeam.find()
      .select('-__v')
      .sort({ lastUpdated: -1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rescue teams', error: error.message });
  }
});

// Get nearby teams
router.get('/teams/nearby', auth, roleAuth(['admin', 'municipality']), async (req, res) => {
  try {
    const { lat, lng, distance } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Coordinates are required' });
    }

    const teams = await RescueTeam.findNearby([parseFloat(lng), parseFloat(lat)], parseFloat(distance));
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Error finding nearby teams', error: error.message });
  }
});

// Create new rescue team
router.post('/teams', auth, roleAuth(['admin', 'municipality']), async (req, res) => {
  try {
    const newTeam = new RescueTeam(req.body);
    await newTeam.save();
    res.status(201).json(newTeam);
  } catch (error) {
    res.status(400).json({ message: 'Error creating rescue team', error: error.message });
  }
});

// Update rescue team
router.put('/teams/:id', auth, roleAuth(['admin', 'municipality']), async (req, res) => {
  try {
    const team = await RescueTeam.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    Object.keys(req.body).forEach(key => {
      team[key] = req.body[key];
    });

    await team.save();
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: 'Error updating rescue team', error: error.message });
  }
});

// Update team status
router.patch('/teams/:id/status', auth, roleAuth(['admin', 'rescuer']), async (req, res) => {
  try {
    const { status, assignmentId } = req.body;
    const team = await RescueTeam.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    await team.updateStatus(status, assignmentId);
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: 'Error updating team status', error: error.message });
  }
});

// Update team location
router.patch('/teams/:id/location', auth, roleAuth(['admin', 'rescuer']), async (req, res) => {
  try {
    const { coordinates, address } = req.body;
    const team = await RescueTeam.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    await team.updateLocation(coordinates, address);
    res.json(team);
  } catch (error) {
    res.status(400).json({ message: 'Error updating team location', error: error.message });
  }
});

// Delete rescue team
router.delete('/teams/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const team = await RescueTeam.findByIdAndDelete(req.params.id);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting rescue team', error: error.message });
  }
});

// Get team assignments history
router.get('/teams/:id/history', auth, roleAuth(['admin', 'municipality']), async (req, res) => {
  try {
    const team = await RescueTeam.findById(req.params.id)
      .populate('currentAssignment')
      .select('currentAssignment status lastUpdated');
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team history', error: error.message });
  }
});

// Team Members Management Routes

// Get all team members
router.get('/members', auth, roleAuth(['admin', 'municipality']), async (req, res) => {
  try {
    const members = await User.find({ role: 'rescuer' })
      .select('-password')
      .populate('team', 'name')
      .sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team members', error: error.message });
  }
});

// Get team members by team
router.get('/teams/:teamId/members', auth, roleAuth(['admin', 'municipality']), async (req, res) => {
  try {
    const members = await User.find({ role: 'rescuer', team: req.params.teamId })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching team members', error: error.message });
  }
});

// Add member to team
router.post('/teams/:teamId/members', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const team = await RescueTeam.findById(req.params.teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const member = await User.findById(req.body.memberId);
    if (!member) {
      return res.status(404).json({ message: 'User not found' });
    }

    member.team = team._id;
    await member.save();

    res.json(member);
  } catch (error) {
    res.status(400).json({ message: 'Error adding member to team', error: error.message });
  }
});

// Remove member from team
router.delete('/teams/:teamId/members/:memberId', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const member = await User.findById(req.params.memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (member.team.toString() !== req.params.teamId) {
      return res.status(400).json({ message: 'Member is not in this team' });
    }

    member.team = null;
    await member.save();

    res.json({ message: 'Member removed from team successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing member from team', error: error.message });
  }
});

// Update member specializations
router.patch('/members/:id/specializations', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const { specializations } = req.body;
    const member = await User.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.specializations = specializations;
    await member.save();

    res.json(member);
  } catch (error) {
    res.status(400).json({ message: 'Error updating member specializations', error: error.message });
  }
});

// Assignment Management Routes

// Get all assignments
router.get('/assignments', auth, roleAuth(['admin', 'municipality']), async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('assignedTeam', 'name status')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
});

// Create new assignment
router.post('/assignments', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const newAssignment = new Assignment({
      ...req.body,
      createdBy: req.user.id
    });
    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating assignment', error: error.message });
  }
});

// Update assignment
router.put('/assignments/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    Object.keys(req.body).forEach(key => {
      assignment[key] = req.body[key];
    });
    assignment.updatedBy = req.user.id;

    await assignment.save();
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating assignment', error: error.message });
  }
});

// Update assignment status
router.patch('/assignments/:id/status', auth, roleAuth(['admin', 'rescuer']), async (req, res) => {
  try {
    const { status } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.status = status;
    assignment.updatedBy = req.user.id;
    
    if (status === 'completed') {
      assignment.completionTime = new Date();
    } else if (status === 'in_progress' && !assignment.startTime) {
      assignment.startTime = new Date();
    }

    await assignment.save();
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating assignment status', error: error.message });
  }
});

// Add note to assignment
router.post('/assignments/:id/notes', auth, roleAuth(['admin', 'rescuer']), async (req, res) => {
  try {
    const { content } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    assignment.notes.push({
      content,
      author: req.user.id
    });
    assignment.updatedBy = req.user.id;

    await assignment.save();
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: 'Error adding note to assignment', error: error.message });
  }
});

// Delete assignment
router.delete('/assignments/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting assignment', error: error.message });
  }
});

// Emergency Calls Management Routes

// Get all emergency calls
router.get('/emergency-calls', auth, roleAuth(['admin', 'municipality']), async (req, res) => {
  try {
    const calls = await FloodReport.find({ isEmergency: true })
      .populate('reportedBy', 'name phone')
      .populate('assignedTeam', 'name status')
      .sort({ createdAt: -1 });
    res.json(calls);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching emergency calls', error: error.message });
  }
});

// Update emergency call status
router.patch('/emergency-calls/:id/status', auth, roleAuth(['admin', 'rescuer']), async (req, res) => {
  try {
    const { status } = req.body;
    const call = await FloodReport.findById(req.params.id);
    if (!call) {
      return res.status(404).json({ message: 'Emergency call not found' });
    }

    call.status = status;
    call.lastUpdatedBy = req.user.id;
    call.lastUpdated = new Date();

    await call.save();
    res.json(call);
  } catch (error) {
    res.status(400).json({ message: 'Error updating emergency call status', error: error.message });
  }
});

// Assign team to emergency call
router.patch('/emergency-calls/:id/assign', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const { teamId } = req.body;
    const call = await FloodReport.findById(req.params.id);
    if (!call) {
      return res.status(404).json({ message: 'Emergency call not found' });
    }

    const team = await RescueTeam.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    call.assignedTeam = teamId;
    call.status = 'assigned';
    call.lastUpdatedBy = req.user.id;
    call.lastUpdated = new Date();

    await call.save();

    // Create an assignment for the team
    const assignment = new Assignment({
      title: `Emergency Response: ${call.location.address}`,
      description: call.description,
      priority: 'high',
      status: 'assigned',
      location: call.location,
      assignedTeam: teamId,
      createdBy: req.user.id,
      relatedFloodReport: call._id
    });

    await assignment.save();
    res.json({ call, assignment });
  } catch (error) {
    res.status(400).json({ message: 'Error assigning team to emergency call', error: error.message });
  }
});

// Add note to emergency call
router.post('/emergency-calls/:id/notes', auth, roleAuth(['admin', 'rescuer']), async (req, res) => {
  try {
    const { content } = req.body;
    const call = await FloodReport.findById(req.params.id);
    if (!call) {
      return res.status(404).json({ message: 'Emergency call not found' });
    }

    call.notes.push({
      content,
      author: req.user.id
    });
    call.lastUpdatedBy = req.user.id;
    call.lastUpdated = new Date();

    await call.save();
    res.json(call);
  } catch (error) {
    res.status(400).json({ message: 'Error adding note to emergency call', error: error.message });
  }
});

// Resource Management Routes

// Get all resources
router.get('/resources', auth, roleAuth(['admin', 'municipality']), async (req, res) => {
  try {
    const { category, status, assignedTeam } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (assignedTeam) query.assignedTeam = assignedTeam;

    const resources = await Resource.find(query)
      .populate('assignedTeam', 'name status')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources', error: error.message });
  }
});

// Create new resource
router.post('/resources', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(400).json({ message: 'Error creating resource', error: error.message });
  }
});

// Update resource
router.put('/resources/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json(resource);
  } catch (error) {
    res.status(400).json({ message: 'Error updating resource', error: error.message });
  }
});

// Delete resource
router.delete('/resources/:id', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting resource', error: error.message });
  }
});

// Update resource quantity
router.patch('/resources/:id/quantity', auth, roleAuth(['admin', 'rescuer']), async (req, res) => {
  try {
    const { available, inUse, underMaintenance } = req.body;
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    if (available !== undefined) resource.quantity.available = available;
    if (inUse !== undefined) resource.quantity.inUse = inUse;
    if (underMaintenance !== undefined) resource.quantity.underMaintenance = underMaintenance;

    await resource.save();
    res.json(resource);
  } catch (error) {
    res.status(400).json({ message: 'Error updating resource quantity', error: error.message });
  }
});

// Add maintenance record
router.post('/resources/:id/maintenance', auth, roleAuth(['admin', 'rescuer']), async (req, res) => {
  try {
    const { date, notes } = req.body;
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.lastMaintenance = date || new Date();
    if (notes) {
      resource.notes.push({
        content: notes,
        author: req.user.id
      });
    }

    await resource.save();
    res.json(resource);
  } catch (error) {
    res.status(400).json({ message: 'Error adding maintenance record', error: error.message });
  }
});

// Add resource alert
router.post('/resources/:id/alerts', auth, roleAuth(['admin', 'rescuer']), async (req, res) => {
  try {
    const { type, message, severity } = req.body;
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    resource.alerts.push({
      type,
      message,
      severity
    });

    await resource.save();
    res.json(resource);
  } catch (error) {
    res.status(400).json({ message: 'Error adding resource alert', error: error.message });
  }
});

// Resolve resource alert
router.patch('/resources/:id/alerts/:alertId', auth, roleAuth(['admin', 'rescuer']), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const alert = resource.alerts.id(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    alert.resolved = true;
    await resource.save();
    res.json(resource);
  } catch (error) {
    res.status(400).json({ message: 'Error resolving resource alert', error: error.message });
  }
});

module.exports = router;