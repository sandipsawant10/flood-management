import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

const EmergencyNotifications = () => {
  // Mock notifications - replace with actual API call
  const notifications = [
    {
      id: 1,
      type: 'emergency',
      title: 'New Flood Alert',
      message: 'High flood risk detected in Manila Bay Area',
      timestamp: new Date(),
      status: 'unread',
    },
    {
      id: 2,
      type: 'team',
      title: 'Team Alpha Deployed',
      message: 'Response team dispatched to Quezon City',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      status: 'read',
    },
  ];

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'emergency':
        return 'bg-red-50 border-red-200';
      case 'team':
        return 'bg-blue-50 border-blue-200';
      case 'update':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'emergency':
        return (
          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-500">
            ⚠️
          </span>
        );
      case 'team':
        return (
          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-500">
            👥
          </span>
        );
      case 'update':
        return (
          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-500">
            📝
          </span>
        );
      default:
        return (
          <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
            📌
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Emergency Notifications</h2>
        <button className="text-sm text-blue-600 hover:text-blue-800">
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start p-4 border rounded-lg ${getNotificationStyle(
              notification.type
            )} ${notification.status === 'unread' ? 'border-l-4' : ''}`}
          >
            {getNotificationIcon(notification.type)}
            <div className="ml-4 flex-1">
              <div className="flex justify-between">
                <h3 className="font-semibold text-gray-900">
                  {notification.title}
                </h3>
                <span className="text-sm text-gray-500">
                  {format(notification.timestamp, 'HH:mm')}
                </span>
              </div>
              <p className="text-gray-600 mt-1">{notification.message}</p>
              <div className="mt-2 flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    View Details
                  </button>
                  {notification.status === 'unread' && (
                    <button className="text-sm text-gray-600 hover:text-gray-800">
                      Mark as read
                    </button>
                  )}
                </div>
                {notification.type === 'emergency' && (
                  <button className="px-3 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600">
                    Respond
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <button className="text-sm text-gray-600 hover:text-gray-800">
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default EmergencyNotifications;