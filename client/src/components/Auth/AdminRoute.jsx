import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const AdminRoute = ({ children }) => {
  const { user } = useAuthStore();

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;