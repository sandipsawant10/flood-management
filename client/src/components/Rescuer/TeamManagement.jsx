import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQueryClient } from '@tanstack/react-query';

const TeamManagement = ({ teamMembers, onUpdateStatus }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const queryClient = useQueryClient();

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'on_mission':
        return 'bg-blue-100 text-blue-800';
      case 'off_duty':
        return 'bg-gray-100 text-gray-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (memberId, newStatus) => {
    onUpdateStatus({ memberId, status: newStatus }, {
      onSuccess: () => {
        queryClient.invalidateQueries(['team-members']);
        setSelectedMember(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Team Members List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
        {teamMembers.map((member) => (
          <div
            key={member._id}
            className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedMember?._id === member._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
            onClick={() => setSelectedMember(member)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-600">
                    {member.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {member.name}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {member.role}
                </p>
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                  {member.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Member Details and Status Update */}
      {selectedMember && (
        <div className="mt-4 p-4 border rounded-lg bg-white">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">{selectedMember.name}</h3>
            <p className="text-sm text-gray-500">{selectedMember.role}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Update Status</h4>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedMember.status === 'available' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                onClick={() => handleStatusChange(selectedMember._id, 'available')}
              >
                Available
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedMember.status === 'on_mission' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                onClick={() => handleStatusChange(selectedMember._id, 'on_mission')}
              >
                On Mission
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedMember.status === 'off_duty' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                onClick={() => handleStatusChange(selectedMember._id, 'off_duty')}
              >
                Off Duty
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${selectedMember.status === 'emergency' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                onClick={() => handleStatusChange(selectedMember._id, 'emergency')}
              >
                Emergency
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Last Update</h4>
            <p className="text-sm text-gray-500">
              {new Date(selectedMember.lastUpdate).toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

TeamManagement.propTypes = {
  teamMembers: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      lastUpdate: PropTypes.string.isRequired,
    })
  ).isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
};

export default TeamManagement;