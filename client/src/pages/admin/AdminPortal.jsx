import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const AdminPortal = () => {
  const { hasAnyRole } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Portal</h1>
          <ul className="flex space-x-4">
            <li>
              <Link
                to="/admin/municipality"
                className="px-4 py-2 rounded-md hover:bg-blue-50 text-blue-600 font-medium"
              >
                Municipality Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/rescuer"
                className="px-4 py-2 rounded-md hover:bg-blue-50 text-blue-600 font-medium"
              >
                Rescuer Dashboard
              </Link>
            </li>
            {hasAnyRole(['admin', 'municipality']) && (
              <li>
                <Link
                  to="/admin/financial-aid"
                  className="px-4 py-2 rounded-md hover:bg-blue-50 text-blue-600 font-medium"
                >
                  Financial Aid Requests
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPortal;