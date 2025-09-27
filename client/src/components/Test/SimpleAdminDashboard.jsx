import React from "react";

const SimpleAdminDashboard = () => {
  console.log("SimpleAdminDashboard is rendering!");

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f0f0f0",
        border: "3px solid green",
        minHeight: "500px",
      }}
    >
      <h1 style={{ color: "green", fontSize: "24px" }}>
        SIMPLE ADMIN DASHBOARD TEST
      </h1>
      <p>If you can see this, the routing is working!</p>
      <ul>
        <li>Route: /admin</li>
        <li>Component: SimpleAdminDashboard</li>
        <li>Time: {new Date().toLocaleString()}</li>
      </ul>
    </div>
  );
};

export default SimpleAdminDashboard;
