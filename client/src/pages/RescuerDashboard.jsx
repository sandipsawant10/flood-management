import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { ResourceInventory } from '../components/Rescuer/ResourceInventory';
import { AlertCircle, Users, Package, MapPin, Bell } from 'lucide-react';

const RescuerDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('emergencies');

  // Fetch active emergencies assigned to the rescue team
  const { data: emergencies, isLoading: emergenciesLoading } = useQuery({
    queryKey: ['rescuer-emergencies', user?.rescueTeam],
    queryFn: async () => {
      const response = await fetch('/api/emergency/active?teamId=' + user.rescueTeam);
      if (!response.ok) throw new Error('Failed to fetch emergencies');
      return response.json();
    },
    enabled: !!user?.rescueTeam
  });

  // Fetch team members
  const { data: teamMembers, isLoading: membersLoading } = useQuery({
    queryKey: ['team-members', user?.rescueTeam],
    queryFn: async () => {
      const response = await fetch('/api/emergency/team/' + user.rescueTeam + '/members');
      if (!response.ok) throw new Error('Failed to fetch team members');
      return response.json();
    },
    enabled: !!user?.rescueTeam
  });

  // Update member status mutation
  const updateMemberStatus = useMutation({
    mutationFn: async ({ memberId, status }) => {
      const response = await fetch(`/api/emergency/team/member/${memberId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team-members']);
    }
  });

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('emergency:updated', () => {
      queryClient.invalidateQueries(['rescuer-emergencies']);
    });

    socket.on('team:member:updated', () => {
      queryClient.invalidateQueries(['team-members']);
    });

    return () => {
      socket.off('emergency:updated');
      socket.off('team:member:updated');
    };
  }, [socket, queryClient]);

  const renderEmergencies = () => {
    if (emergenciesLoading) return <div className="p-4">Loading emergencies...</div>;
    if (!emergencies?.length) return <div className="p-4">No active emergencies.</div>;

    return (
      <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {emergencies.map((emergency) => (
          <div key={emergency._id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <h3 className="font-semibold">{emergency.type}</h3>
            </div>
            <div className="mt-2 space-y-2 text-sm text-gray-600">
              <p><strong>Severity:</strong> {emergency.severity}</p>
              <p><strong>Location:</strong> {emergency.location.address}</p>
              <p><strong>Status:</strong> {emergency.status}</p>
              <p><strong>Affected People:</strong> {emergency.affectedPeople || 'Unknown'}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTeamMembers = () => {
    if (membersLoading) return <div className="p-4">Loading team members...</div>;
    if (!teamMembers?.length) return <div className="p-4">No team members found.</div>;

    return (
      <div className="p-4">
        <div className="rounded-lg border bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {teamMembers.map((member) => (
                <tr key={member._id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 flex-shrink-0 rounded-full bg-gray-200"></div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{member.role}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${member.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <select
                      value={member.status}
                      onChange={(e) => updateMemberStatus.mutate({ memberId: member._id, status: e.target.value })}
                      className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                      <option value="on_mission">On Mission</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Rescuer Dashboard</h1>
        
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('emergencies')}
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'emergencies' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
            >
              <AlertCircle className="h-5 w-5" />
              Emergencies
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'team' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
            >
              <Users className="h-5 w-5" />
              Team Members
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium ${activeTab === 'resources' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
            >
              <Package className="h-5 w-5" />
              Resources
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'emergencies' && renderEmergencies()}
          {activeTab === 'team' && renderTeamMembers()}
          {activeTab === 'resources' && <ResourceInventory />}
        </div>
      </div>
    </div>
  );
};

export default RescuerDashboard;