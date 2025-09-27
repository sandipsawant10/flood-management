const jwt = require("jsonwebtoken");
const User = require("../models/User");

const roleAuth = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return res
          .status(401)
          .json({ message: "No authentication token found" });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Role Auth - Decoded token:", {
        userId: decoded.userId,
        role: decoded.role,
      });

      // Get user from database
      const user = await User.findById(decoded.userId);
      console.log("Role Auth - User found:", {
        id: user?._id,
        role: user?.role,
        roles: user?.roles,
        allowedRoles,
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Flatten allowedRoles in case they are nested arrays
      const flattenedRoles = allowedRoles.flat();

      // Check if user has any of the allowed roles
      const hasAllowedRole = flattenedRoles.some(
        (role) =>
          (user.roles && user.roles.includes(role)) || user.role === role
      );

      console.log("Role Auth - Authorization check:", {
        hasAllowedRole,
        userRole: user.role,
        userRoles: user.roles,
        originalAllowedRoles: allowedRoles,
        flattenedRoles,
        checkResults: flattenedRoles.map((role) => ({
          role,
          inRolesArray: user.roles && user.roles.includes(role),
          matchesRoleField: user.role === role,
        })),
      });

      if (!hasAllowedRole) {
        return res.status(403).json({
          message: "Access denied. Required role not found.",
          debug: {
            userRole: user.role,
            userRoles: user.roles,
            requiredRoles: flattenedRoles,
          },
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.error("Role Auth Error:", error);
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
};

module.exports = roleAuth;
