import React from 'react';
import { useQuery } from '@tanstack/react-query';
import EmergencyMap from '../../components/Admin/EmergencyMap';
import EmergencyAnalytics from '../../components/Admin/EmergencyAnalytics';
import EmergencyNotifications from '../../components/Admin/EmergencyNotifications';

const RescuerDashboard = () => {
  // Mock data - replace with actual API calls
  const emergencyTeams = [
    { id: 1, name: 'Team Alpha', status: 'Active', position: [14.5995, 120.9842] },
    { id: 2, name: 'Team Beta', status: 'On Mission', position: [14.6091, 120.9876] },
  ];

  const emergencyRequests = [
    { id: 1, location: 'Manila Bay Area', severity: 'High', status: 'Pending' },
    { id: 2, location: 'Quezon City', severity: 'Medium', status: 'In Progress' },
  ];

  const handleMarkerClick = (marker) => {
    console.log('Marker clicked:', marker);
    // Handle marker click - show details, etc.
  };

  return (
    <div className="rescuer-dashboard p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emergency Response Map */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Emergency Response Map</h2>
          <EmergencyMap
            markers={emergencyTeams}
            onMarkerClick={handleMarkerClick}
            height="500px"
          />
        </div>

        {/* Emergency Notifications */}
        <div>
          <EmergencyNotifications />
        </div>

        {/* Analytics Section */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-semibold mb-4">Response Analytics</h2>
          <EmergencyAnalytics timeframe="weekly" />
        </div>

        {/* Team Management */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Team Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emergencyTeams.map(team => (
              <div key={team.id} className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold">{team.name}</h3>
                <p className="text-sm text-gray-600 mt-1">Status: {team.status}</p>
                <div className="mt-4 space-x-2">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">
                    View Details
                  </button>
                  <button className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600">
                    Contact Team
                  </button>
                </div>
              </div>
            ))}
            <div className="p-4 border rounded-lg border-dashed border-gray-300 flex items-center justify-center">
              <button className="text-gray-500 hover:text-gray-700 flex items-center space-x-2">
                <span>➕</span>
                <span>Add New Team</span>
              </button>
            </div>
          </div>
        </div>

        {/* Emergency Requests */}
        <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Emergency Requests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Severity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {emergencyRequests.map(request => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{request.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${request.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {request.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{request.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">
                        Assign Team
                      </button>
                      <button className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RescuerDashboard;