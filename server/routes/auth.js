const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { auth, authorize } = require("../middleware/auth");
const crypto = require("crypto");
const router = express.Router();

// For email sending
const nodemailer = require("nodemailer");

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER || "floodmanagement@example.com",
    pass: process.env.EMAIL_PASSWORD || "password",
  },
});

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

      // Update lastActive safely
      try {
        user.lastActive = new Date();
        if (isNaN(user.lastActive)) {
          throw new Error("Generated invalid lastActive date");
        }
      } catch (err) {
        console.error("Error setting lastActive:", err);
        user.lastActive = Date.now(); // fallback
      }

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
          lastActive: user.lastActive,
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
    body("lastActive")
      .optional()
      .custom((value) => {
        if (value && isNaN(new Date(value))) {
          throw new Error("Invalid date format for lastActive");
        }
        return true;
      }),
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
      const allowedUpdates = [
        "name",
        "location",
        "preferences",
        "avatar",
        "lastActive",
      ];
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
            // Special case: lastActive
            if (key === "lastActive") {
              updates[key] = new Date(req.body[key]);
            } else {
              updates[key] = req.body[key];
            }
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
          lastActive: user.lastActive,
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

// ---------- FORGOT PASSWORD ----------
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        // For security reasons, don't reveal that the email doesn't exist
        return res.status(200).json({
          message: "If your email is registered, you will receive a password reset link",
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

      // Save token to user
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpiry;
      await user.save();

      // Create reset URL
      const resetUrl = `${req.protocol}://${req.get(
        "host"
      )}/reset-password/${resetToken}`;

      // Send email
      const mailOptions = {
        from: process.env.EMAIL_USER || "floodmanagement@example.com",
        to: user.email,
        subject: "AquaAssist Password Reset",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">AquaAssist Password Reset</h2>
            <p>Hello ${user.name},</p>
            <p>You requested a password reset for your AquaAssist account.</p>
            <p>Please click the button below to reset your password. This link is valid for 1 hour.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
            </div>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
            <p>Thank you,<br>The AquaAssist Team</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: "If your email is registered, you will receive a password reset link",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Server error during password reset" });
    }
  }
);

// ---------- RESET PASSWORD ----------
router.post(
  "/reset-password/:token",
  [
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token } = req.params;
      const { password } = req.body;

      // Find user with valid reset token
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Password reset token is invalid or has expired" });
      }

      // Update password and clear reset token fields
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Server error during password reset" });
    }
  }
);

module.exports = router;
