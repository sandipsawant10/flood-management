/**
 * Script to create admin users
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const createAdminUser = async (adminData) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/flood-management"
    );
    console.log("Connected to MongoDB");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      $or: [{ email: adminData.email }, { phone: adminData.phone }],
    });

    if (existingAdmin) {
      console.log("Admin user already exists:");
      console.log("Email:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);
      return existingAdmin;
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);
    const adminUser = new User(adminData);
    await adminUser.save();

    console.log("✅ Admin user created successfully!");
    console.log("📧 Email:", adminData.email);
    console.log("🔑 Password:", adminData.password);
    console.log("👤 Role:", adminData.role);
    console.log("📱 Phone:", adminData.phone);
    console.log(
      "\n⚠️  IMPORTANT: Please change the default password after first login!"
    );

    return adminUser;
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

// Admin user data
const admin1 = {
  name: "Admin User",
  email: "admin@floodmanagement.com",
  phone: "+919999999999", // Change this to a valid phone number
  password: "admin123", // Change this to a secure password
  role: "admin",
  roles: ["admin", "citizen"],
  location: {
    type: "Point",
    coordinates: [77.209, 28.6139], // Delhi coordinates as example
    address: "New Delhi, India",
    district: "New Delhi",
    state: "Delhi",
    pincode: "110001",
  },
  isVerified: true,
  trustScore: 1000,
};

const admin2 = {
  name: "Second Admin",
  email: "admin2@floodmanagement.com",
  phone: "+919888888888",
  password: "admin456", // Change as needed
  role: "admin",
  roles: ["admin", "citizen"],
  location: {
    type: "Point",
    coordinates: [77.209, 28.6139],
    address: "New Delhi, India",
    district: "New Delhi",
    state: "Delhi",
    pincode: "110001",
  },
  isVerified: true,
  trustScore: 1000,
};

// Run the script
if (require.main === module) {
  createAdminUser(admin1)
    .then(() => createAdminUser(admin2))
    .then(() => {
      console.log("Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

module.exports = { createAdminUser };
