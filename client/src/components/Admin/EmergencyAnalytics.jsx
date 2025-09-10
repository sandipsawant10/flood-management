import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const EmergencyAnalytics = ({
  responseTimeData,
  emergencyTypeData,
  timeframe = 'weekly',
}) => {
  // Response Time Chart Configuration
  const responseTimeOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Average Response Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Minutes',
        },
      },
    },
  };

  // Emergency Types Chart Configuration
  const emergencyTypeOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Emergency Types Distribution',
      },
    },
  };

  // Mock data - replace with actual data from props
  const mockResponseTimeData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Response Time',
        data: [15, 12, 18, 14, 16, 13, 17],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const mockEmergencyTypeData = {
    labels: ['Flood', 'Fire', 'Medical', 'Rescue', 'Others'],
    datasets: [
      {
        label: 'Number of Incidents',
        data: [12, 19, 3, 5, 2],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow-md">
        <Line
          options={responseTimeOptions}
          data={responseTimeData || mockResponseTimeData}
        />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <Bar
          options={emergencyTypeOptions}
          data={emergencyTypeData || mockEmergencyTypeData}
        />
      </div>
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Total Emergencies</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">41</p>
          <p className="text-sm text-gray-500 mt-1">This {timeframe}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Avg Response Time</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">15min</p>
          <p className="text-sm text-gray-500 mt-1">This {timeframe}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Active Teams</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">8</p>
          <p className="text-sm text-gray-500 mt-1">Currently deployed</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700">Success Rate</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">95%</p>
          <p className="text-sm text-gray-500 mt-1">This {timeframe}</p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAnalytics;