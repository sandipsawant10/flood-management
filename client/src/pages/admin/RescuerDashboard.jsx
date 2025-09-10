import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Phone, Users, MapPin, MessageSquare, Truck, CheckCircle, AlertTriangle } from 'lucide-react';

// Components to be created later
import EmergencyCallsList from '../../components/Admin/EmergencyCallsList';
import RescueTeamList from '../../components/Admin/RescueTeamList';
import ResourceMap from '../../components/Admin/ResourceMap';
import CommunicationPanel from '../../components/Admin/CommunicationPanel';
import DashboardStats from '../../components/Admin/DashboardStats';

const RescuerDashboard = () => {
  const [activeTab, setActiveTab] = useState('emergency');

  // Mock data - replace with actual API calls
  const { data: dashboardStats } = useQuery({
    queryKey: ['rescuerStats'],
    queryFn: () => ({
      activeEmergencies: 5,
      availableTeams: 8,
      ongoingRescues: 3,
      completedRescues: 42
    })
  });

  const tabs = [
    { id: 'emergency', name: 'Emergency Calls', icon: Phone },
    { id: 'teams', name: 'Rescue Teams', icon: Users },
    { id: 'resources', name: 'Resource Planning', icon: Truck },
    { id: 'communication', name: 'Communication', icon: MessageSquare }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'emergency':
        return <EmergencyCallsList />;
      case 'teams':
        return <RescueTeamList />;
      case 'resources':
        return <ResourceMap />;
      case 'communication':
        return <CommunicationPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Rescuer Dashboard</h1>
        <p className="mt-2 text-gray-600">Manage emergency responses and rescue operations</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <DashboardStats
          stats={[
            {
              name: 'Active Emergencies',
              value: dashboardStats?.activeEmergencies || 0,
              icon: AlertTriangle,
              color: 'bg-red-500'
            },
            {
              name: 'Available Teams',
              value: dashboardStats?.availableTeams || 0,
              icon: Users,
              color: 'bg-green-500'
            },
            {
              name: 'Ongoing Rescues',
              value: dashboardStats?.ongoingRescues || 0,
              icon: Truck,
              color: 'bg-yellow-500'
            },
            {
              name: 'Completed Rescues',
              value: dashboardStats?.completedRescues || 0,
              icon: CheckCircle,
              color: 'bg-blue-500'
            }
          ]}
        />
      </div>

      {/* Emergency Action Button */}
      <div className="mb-8">
        <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center hover:bg-red-700 transition-colors">
          <Phone className="mr-2 h-5 w-5" />
          Dispatch Emergency Team
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default RescuerDashboard;