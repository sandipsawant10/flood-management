import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import PropTypes from 'prop-types';

const AdminRoute = ({ children, requiredRoles = ['admin'] }) => {
  const { user, hasAnyRole } = useAuthStore();

  if (!user || !hasAnyRole(requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRoles: PropTypes.arrayOf(PropTypes.string)
};

export default AdminRoute;