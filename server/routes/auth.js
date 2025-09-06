const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const auth = require("../middleware/auth");
const router = express.Router();

// ---------- REGISTER NEW USER ----------
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
    body("phone")
      .isMobilePhone("en-IN")
      .withMessage("Please provide a valid Indian phone number"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("location.coordinates")
      .isArray({ min: 2, max: 2 })
      .withMessage("Location coordinates required"),
    body("location.district")
      .trim()
      .notEmpty()
      .withMessage("District is required"),
    body("location.state").trim().notEmpty().withMessage("State is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        name,
        email,
        phone,
        password,
        location,
        governmentId,
        preferences,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email }, { phone }],
      });

      if (existingUser) {
        return res.status(400).json({
          message: "User already exists with this email or phone number",
        });
      }

      // Create new user
      const user = new User({
        name,
        email,
        phone,
        password,
        location,
        governmentId,
        preferences: preferences || {},
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          trustScore: user.trustScore,
          location: user.location,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  }
);

// ---------- USER LOGIN ----------
router.post(
  "/login",
  [
    body("login").notEmpty().withMessage("Email or phone is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { login, password } = req.body;

      const user = await User.findOne({
        $or: [{ email: login.toLowerCase() }, { phone: login }],
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      user.lastActive = new Date();
      await user.save();

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || "fallback-secret",
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          trustScore: user.trustScore,
          location: user.location,
          preferences: user.preferences,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  }
);

// ---------- GET CURRENT USER PROFILE ----------
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        trustScore: user.trustScore,
        reportsSubmitted: user.reportsSubmitted,
        verifiedReports: user.verifiedReports,
        location: user.location,
        preferences: user.preferences,
        isVerified: user.isVerified,
        lastActive: user.lastActive,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

// ---------- UPDATE USER PROFILE ----------
router.put(
  "/profile",
  auth,
  [
    body("name").optional().trim().isLength({ min: 2 }),
    body("location.coordinates").optional().isArray({ min: 2, max: 2 }),
    body("preferences.language")
      .optional()
      .isIn(["en", "hi", "bn", "te", "mr", "ta", "gu", "kn", "ml", "or", "as"]),
    body("avatar").optional().isString(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Only allow specific updates
      const allowedUpdates = ["name", "location", "preferences", "avatar"];
      const updates = {};

      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          // Merge nested objects (like location & preferences)
          if (
            typeof req.body[key] === "object" &&
            !Array.isArray(req.body[key])
          ) {
            updates[key] = { ...user[key], ...req.body[key] };
          } else {
            updates[key] = req.body[key];
          }
        }
      }

      Object.assign(user, updates);
      await user.save();

      res.json({
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          trustScore: user.trustScore,
          location: user.location,
          preferences: user.preferences,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ message: "Server error updating profile" });
    }
  }
);

// ---------- VERIFY JWT TOKEN ----------
router.get("/verify", auth, (req, res) => {
  res.json({ valid: true, userId: req.user.userId, role: req.user.role });
});

module.exports = router;
