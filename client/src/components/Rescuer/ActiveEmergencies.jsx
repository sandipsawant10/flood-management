import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

const ActiveEmergencies = ({ emergencies }) => {
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const queryClient = useQueryClient();

  const updateEmergencyStatus = useMutation({
    mutationFn: async ({ emergencyId, status, notes }) => {
      const response = await fetch(`/api/emergency/${emergencyId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (!response.ok) throw new Error('Failed to update emergency status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['active-emergencies']);
      toast.success('Emergency status updated successfully');
      setSelectedEmergency(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (status) => {
    if (!selectedEmergency) return;

    updateEmergencyStatus.mutate({
      emergencyId: selectedEmergency._id,
      status,
      notes: `Status updated to ${status} by rescue team`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Emergency List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {emergencies.map((emergency) => (
          <div
            key={emergency._id}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedEmergency?._id === emergency._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
            onClick={() => setSelectedEmergency(emergency)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{emergency.type}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(emergency.priority)}`}>
                {emergency.priority}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2">{emergency.description}</p>
            <div className="flex items-center justify-between text-sm">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(emergency.status)}`}>
                {emergency.status}
              </span>
              <span className="text-gray-500">
                {new Date(emergency.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Details and Actions */}
      {selectedEmergency && (
        <div className="mt-4 p-4 border rounded-lg bg-white">
          <h3 className="font-semibold text-lg mb-4">Update Emergency Status</h3>
          <div className="space-x-2">
            <button
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              onClick={() => handleStatusUpdate('in_progress')}
              disabled={selectedEmergency.status === 'in_progress'}
            >
              Mark In Progress
            </button>
            <button
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              onClick={() => handleStatusUpdate('resolved')}
              disabled={selectedEmergency.status === 'resolved'}
            >
              Mark Resolved
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ActiveEmergencies.propTypes = {
  emergencies: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      priority: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ActiveEmergencies;