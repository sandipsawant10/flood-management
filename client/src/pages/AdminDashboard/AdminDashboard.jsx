import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome to the administrator dashboard. Here you can manage users, view system analytics, and configure emergency settings.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p>Manage user accounts, roles, and permissions.</p>
          {/* Link to user management page or component */}
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">Go to User Management</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">System Analytics</h2>
          <p>View system performance, flood data trends, and user activity.</p>
          {/* Link to analytics page or component */}
          <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md">View Analytics</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Emergency Settings</h2>
          <p>Configure emergency alert parameters and contact lists.</p>
          {/* Link to emergency settings page or component */}
          <button className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md">Configure Emergency Settings</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;