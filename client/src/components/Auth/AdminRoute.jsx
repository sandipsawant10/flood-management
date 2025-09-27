import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import PropTypes from "prop-types";

const AdminRoute = ({ children, requiredRoles = ["admin"] }) => {
  const { user, isAuthenticated } = useAuth();

  // Helper function to check if user has any of the required roles
  const hasAnyRole = (roles) => {
    if (!user) return false;
    return roles.some(
      (role) => user.roles?.includes(role) || user.role === role
    );
  };

  if (!user) {
    console.log("AdminRoute: No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (!hasAnyRole(requiredRoles)) {
    console.log("AdminRoute: User lacks required roles", {
      userRole: user.role,
      requiredRoles,
    });
    return <Navigate to="/unauthorized" replace />;
  }

  console.log("AdminRoute: Access granted for user", {
    userRole: user.role,
    requiredRoles,
  });
  return children;
};

AdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRoles: PropTypes.arrayOf(PropTypes.string),
};

export default AdminRoute;
