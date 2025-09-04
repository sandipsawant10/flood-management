const { body, param, query } = require("express-validator");

const validateFloodReport = [
  body("location.coordinates")
    .isArray({ min: 2, max: 2 })
    .withMessage("Coordinates must be an array of [longitude, latitude]"),
  body("location.district")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("District must be 2-100 characters"),
  body("severity")
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Severity must be low, medium, high, or critical"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be 10-1000 characters")
    .escape(), // Sanitize HTML
];

const validateUserRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("phone")
    .isMobilePhone("en-IN")
    .withMessage("Please provide a valid Indian phone number"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];

module.exports = {
  validateFloodReport,
  validateUserRegistration,
};
