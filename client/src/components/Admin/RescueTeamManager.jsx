import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Phone, MapPin, Truck, Clock, Shield } from 'lucide-react';

const RescueTeamManager = () => {
  const queryClient = useQueryClient();
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    teamName: '',
    leader: '',
    contact: '',
    members: '',
    specialization: 'general',
    vehicle: '',
    status: 'available',
    currentLocation: ''
  });

  // Fetch rescue teams
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['rescue-teams'],
    queryFn: async () => {
      // API call to fetch teams
      return [];
    }
  });

  // Update team
  const updateTeam = useMutation({
    mutationFn: async (teamData) => {
      // API call to update team
      return teamData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['rescue-teams']);
      setIsEditing(false);
      setSelectedTeam(null);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateTeam.mutate({ ...selectedTeam, ...formData });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setFormData(team);
    setIsEditing(true);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rescue Team Manager</h2>
        <p className="mt-1 text-gray-600">Manage rescue teams and their assignments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teams List */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Active Teams</h3>
          {isLoading ? (
            <div className="text-center py-4">Loading teams...</div>
          ) : (
            <div className="space-y-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedTeam?.id === team.id ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'}`}
                  onClick={() => handleTeamSelect(team)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{team.teamName}</span>
                    </div>
                    <StatusBadge status={team.status} />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      {team.specialization}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {team.currentLocation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Edit Team</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Team Name</label>
                <input
                  type="text"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Team Leader</label>
                <input
                  type="text"
                  name="leader"
                  value={formData.leader}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="tel"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Team Members</label>
                <textarea
                  name="members"
                  value={formData.members}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="List team members and their roles"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="general">General Rescue</option>
                  <option value="water">Water Rescue</option>
                  <option value="medical">Medical Response</option>
                  <option value="evacuation">Evacuation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle Details</label>
                <input
                  type="text"
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Vehicle type and number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="enroute">En Route</option>
                  <option value="onsite">On Site</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Current Location</label>
                <input
                  type="text"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedTeam(null);
                  }}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateTeam.isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {updateTeam.isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Map Integration Placeholder */}
      <div className="mt-6 border rounded-lg p-4">
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p>Map integration will be added here to track team locations</p>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    available: {
      color: 'bg-green-100 text-green-800',
      icon: Shield
    },
    assigned: {
      color: 'bg-blue-100 text-blue-800',
      icon: Users
    },
    enroute: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: Truck
    },
    onsite: {
      color: 'bg-purple-100 text-purple-800',
      icon: MapPin
    },
    unavailable: {
      color: 'bg-red-100 text-red-800',
      icon: Clock
    }
  };

  const config = statusConfig[status] || statusConfig.unavailable;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-4 h-4 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default RescueTeamManager;