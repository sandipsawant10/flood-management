const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/User");
const { AuthenticationError } = require("./errorHandler");

// Enhanced role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AuthenticationError("You must be logged in to access this resource")
      );
    }

    // Flatten roles array if an array was passed as first argument
    const flattenedRoles =
      roles.length === 1 && Array.isArray(roles[0]) ? roles[0] : roles;

    // Check if user has any of the required roles (either from role field or roles array)
    const userRoles = Array.isArray(req.user.roles)
      ? req.user.roles
      : [req.user.role];
    const hasAuthorization = flattenedRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasAuthorization) {
      return next(
        new AuthenticationError(
          "Access denied. You do not have permission to perform this action",
          {
            requiredRoles: flattenedRoles,
            userRoles,
          }
        )
      );
    }

    next();
  };
};

// Enhanced authentication middleware
const auth = async (req, res, next) => {
  try {
    // 1. Get token from Authorization header or cookie
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    // Check if token exists
    if (!token) {
      return next(
        new AuthenticationError(
          "No authentication token provided. Please log in to access this resource"
        )
      );
    }

    // 2. Verify token
    const jwtVerify = promisify(jwt.verify);
    let decoded;
    try {
      decoded = await jwtVerify(
        token,
        process.env.JWT_SECRET || "fallback-secret"
      );
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return next(
          new AuthenticationError(
            "Your session has expired. Please log in again",
            {
              code: "TOKEN_EXPIRED",
              expiredAt: err.expiredAt,
            }
          )
        );
      }
      return next(
        new AuthenticationError("Invalid authentication token", {
          code: "TOKEN_INVALID",
        })
      );
    }

    // 3. Check if user still exists
    const user = await User.findById(decoded.userId).select(
      "-password -refreshToken"
    );
    if (!user) {
      return next(
        new AuthenticationError(
          "The user associated with this token no longer exists"
        )
      );
    }

    // 4. Track user activity and login info
    const clientInfo = {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
      timestamp: new Date(),
    };

    // 5. Update lastActive timestamp (but not on every request to reduce DB load)
    const ACTIVITY_UPDATE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
    if (
      !user.lastActive ||
      Date.now() - new Date(user.lastActive).getTime() >
        ACTIVITY_UPDATE_THRESHOLD
    ) {
      user.lastActive = new Date();
      await user.save({ validateBeforeSave: false });
    }

    // 6. Attach user to request
    req.user = user;
    req.authInfo = {
      tokenIssued: new Date(decoded.iat * 1000),
      tokenExpires: new Date(decoded.exp * 1000),
      clientInfo,
    };

    next();
  } catch (error) {
    next(
      new AuthenticationError("Authentication failed", {
        originalError: error.message,
      })
    );
  }
};

module.exports = { auth, authorize };
