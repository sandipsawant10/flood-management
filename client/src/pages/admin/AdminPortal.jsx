import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminPortal = () => {
  return (
    <div>
      <h1>Admin Portal</h1>
      <nav>
        <ul>
          <li><a href="/admin/municipality">Municipality Dashboard</a></li>
          <li><a href="/admin/rescuer">Rescuer Dashboard</a></li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
};

export default AdminPortal;