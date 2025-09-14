import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../services/axiosConfig';

// Components to be created later
import EmergencyResponseMap from '../../components/Rescuer/EmergencyResponseMap';
import TeamManagement from '../../components/Rescuer/TeamManagement';
import ActiveEmergencies from '../../components/Rescuer/ActiveEmergencies';
import ResourceInventory from '../../components/Rescuer/ResourceInventory';

const RescuerDashboard = () => {
  const { user } = useAuthStore();

  // Fetch active emergencies
  const { data: emergencies, isLoading: emergenciesLoading } = useQuery({
    queryKey: ['active-emergencies'],
    queryFn: async () => {
      const response = await axiosInstance.get('/emergency/active');
      return response.data;
    },
  });

  // Fetch team members
  const { data: teamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      if (!user?.teamId) return []; // Return empty array if teamId is undefined
      const response = await axiosInstance.get(`/rescuers/team/${user.teamId}/members`);
      return response.data;
    },
  });

  // Fetch resource inventory
  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: async () => {
      if (!user?.teamId) return []; // Return empty array if teamId is undefined
      const response = await axiosInstance.get(`/rescuers/team/${user.teamId}/resources`);
      return response.data;
    },
  });

  // Update team member status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ memberId, status }) => {
      const response = await axiosInstance.put(`/rescuers/team/member/${memberId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update resource quantity mutation
  const updateResourceMutation = useMutation({
    mutationFn: async ({ resourceId, quantity }) => {
      const response = await axiosInstance.put(`/rescuers/team/resource/${resourceId}`, { quantity });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Resource updated successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (emergenciesLoading || teamLoading || resourcesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Emergency Response Map */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Emergency Response Map</h2>
          <EmergencyResponseMap emergencies={emergencies} teamMembers={teamMembers} />
        </div>

        {/* Active Emergencies */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Active Emergencies</h2>
          <ActiveEmergencies emergencies={emergencies} />
        </div>

        {/* Team Management */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Team Management</h2>
          <TeamManagement 
            teamMembers={teamMembers}
            onUpdateStatus={updateStatusMutation.mutate}
          />
        </div>

        {/* Resource Inventory */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Resource Inventory</h2>
          <ResourceInventory 
            resources={resources}
            onUpdateResource={updateResourceMutation.mutate}
          />
        </div>
      </div>
    </div>
  );
};

export default RescuerDashboard;