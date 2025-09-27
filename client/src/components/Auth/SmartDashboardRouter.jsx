import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const SmartDashboardRouter = () => {
  const { user } = useAuth();

  // Helper functions to check roles
  const isAdmin = () =>
    user?.roles?.includes("admin") || user?.role === "admin";
  const isMunicipality = () =>
    user?.roles?.includes("municipality") || user?.role === "municipality";
  const isRescuer = () =>
    user?.roles?.includes("rescuer") || user?.role === "rescuer";

  // Redirect based on user role
  if (!user) {
    console.log("SmartDashboardRouter: No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Admin users go to admin portal
  if (isAdmin()) {
    console.log("SmartDashboardRouter: Admin user, redirecting to /admin");
    return <Navigate to="/admin" replace />;
  }

  // Municipality users go to admin portal
  if (isMunicipality()) {
    console.log(
      "SmartDashboardRouter: Municipality user, redirecting to /admin"
    );
    return <Navigate to="/admin" replace />;
  }

  // Rescuer users go to admin portal
  if (isRescuer()) {
    console.log("SmartDashboardRouter: Rescuer user, redirecting to /admin");
    return <Navigate to="/admin" replace />;
  }

  // Default citizen users go to citizen dashboard
  console.log(
    "SmartDashboardRouter: Citizen user, redirecting to /citizen-dashboard"
  );
  return <Navigate to="/citizen-dashboard" replace />;
};

export default SmartDashboardRouter;
