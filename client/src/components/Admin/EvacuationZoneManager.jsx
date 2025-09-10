import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Route, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const EvacuationZoneManager = () => {
  const queryClient = useQueryClient();
  const [selectedZone, setSelectedZone] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data structure for evacuation zones
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    status: 'open',
    safetyLevel: 'high',
    coordinates: '',
    accessRoutes: '',
    facilities: ''
  });

  // Fetch evacuation zones
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['evacuation-zones'],
    queryFn: async () => {
      // API call to fetch zones
      return [];
    }
  });

  // Update zone status
  const updateZone = useMutation({
    mutationFn: async (zoneData) => {
      // API call to update zone
      return zoneData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['evacuation-zones']);
      setIsEditing(false);
      setSelectedZone(null);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateZone.mutate({ ...selectedZone, ...formData });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleZoneSelect = (zone) => {
    setSelectedZone(zone);
    setFormData(zone);
    setIsEditing(true);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Evacuation Zone Manager</h2>
        <p className="mt-1 text-gray-600">Manage safe zones and evacuation routes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zones List */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Evacuation Zones</h3>
          {isLoading ? (
            <div className="text-center py-4">Loading zones...</div>
          ) : (
            <div className="space-y-4">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedZone?.id === zone.id ? 'border-primary-500 bg-primary-50' : 'hover:bg-gray-50'}`}
                  onClick={() => handleZoneSelect(zone)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{zone.name}</span>
                    </div>
                    <StatusBadge status={zone.status} />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <div>Capacity: {zone.capacity} people</div>
                    <div>Safety Level: {zone.safetyLevel}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Form */}
        {isEditing && (
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Edit Zone</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Zone Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
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
                  <option value="open">Open</option>
                  <option value="full">Full</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Safety Level</label>
                <select
                  name="safetyLevel"
                  value={formData.safetyLevel}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Coordinates</label>
                <input
                  type="text"
                  name="coordinates"
                  value={formData.coordinates}
                  onChange={handleChange}
                  placeholder="lat,lng"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Access Routes</label>
                <textarea
                  name="accessRoutes"
                  value={formData.accessRoutes}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="List main access routes"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Facilities</label>
                <textarea
                  name="facilities"
                  value={formData.facilities}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Available facilities and amenities"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedZone(null);
                  }}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateZone.isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {updateZone.isLoading ? 'Saving...' : 'Save Changes'}
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
          <p>Map integration will be added here to visualize zones and routes</p>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    open: {
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    },
    full: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: AlertTriangle
    },
    closed: {
      color: 'bg-red-100 text-red-800',
      icon: XCircle
    }
  };

  const config = statusConfig[status] || statusConfig.closed;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-4 h-4 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default EvacuationZoneManager;