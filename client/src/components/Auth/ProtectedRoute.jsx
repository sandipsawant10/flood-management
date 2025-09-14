import React from "react";

import { useAuthStore } from "../../store/authStore";

import { Navigate, Outlet } from "react-router-dom";
const ProtectedRoute = () => {
  const { token, user } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
