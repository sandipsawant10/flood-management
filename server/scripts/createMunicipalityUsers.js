/**
 * Script to create municipality users for different cities/regions
 * Creates accounts for: Mumbai, Delhi, Bangalore, Chennai, Kolkata, and Pune
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const createMunicipalityUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/flood-management"
    );
    console.log("Connected to MongoDB");

    // Municipality user data for different cities
    const municipalityUsers = [
      {
        name: "Mumbai Municipality Office",
        email: "mumbai.municipality@floodmanagement.com",
        phone: "+912222222222",
        password: "mumbai123",
        role: "municipality",
        roles: ["municipality", "citizen"],
        location: {
          type: "Point",
          coordinates: [72.8777, 19.076], // Mumbai coordinates
          address: "Municipal Corporation Building, Mumbai",
          district: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
        },
        isVerified: true,
        trustScore: 1000,
        governmentId: "MH-MUM-2024-001",
      },
      {
        name: "Delhi Municipality Office",
        email: "delhi.municipality@floodmanagement.com",
        phone: "+911111111111",
        password: "delhi123",
        role: "municipality",
        roles: ["municipality", "citizen"],
        location: {
          type: "Point",
          coordinates: [77.209, 28.6139], // Delhi coordinates
          address: "Municipal Corporation Building, Delhi",
          district: "New Delhi",
          state: "Delhi",
          pincode: "110001",
        },
        isVerified: true,
        trustScore: 1000,
        governmentId: "DL-DEL-2024-001",
      },
      {
        name: "Bangalore Municipality Office",
        email: "bangalore.municipality@floodmanagement.com",
        phone: "+918080808080",
        password: "bangalore123",
        role: "municipality",
        roles: ["municipality", "citizen"],
        location: {
          type: "Point",
          coordinates: [77.5946, 12.9716], // Bangalore coordinates
          address: "Municipal Corporation Building, Bangalore",
          district: "Bangalore Urban",
          state: "Karnataka",
          pincode: "560001",
        },
        isVerified: true,
        trustScore: 1000,
        governmentId: "KA-BLR-2024-001",
      },
      {
        name: "Chennai Municipality Office",
        email: "chennai.municipality@floodmanagement.com",
        phone: "+914444444444",
        password: "chennai123",
        role: "municipality",
        roles: ["municipality", "citizen"],
        location: {
          type: "Point",
          coordinates: [80.2707, 13.0827], // Chennai coordinates
          address: "Municipal Corporation Building, Chennai",
          district: "Chennai",
          state: "Tamil Nadu",
          pincode: "600001",
        },
        isVerified: true,
        trustScore: 1000,
        governmentId: "TN-CHE-2024-001",
      },
      {
        name: "Kolkata Municipality Office",
        email: "kolkata.municipality@floodmanagement.com",
        phone: "+913333333333",
        password: "kolkata123",
        role: "municipality",
        roles: ["municipality", "citizen"],
        location: {
          type: "Point",
          coordinates: [88.3639, 22.5726], // Kolkata coordinates
          address: "Municipal Corporation Building, Kolkata",
          district: "Kolkata",
          state: "West Bengal",
          pincode: "700001",
        },
        isVerified: true,
        trustScore: 1000,
        governmentId: "WB-KOL-2024-001",
      },
      {
        name: "Pune Municipality Office",
        email: "pune.municipality@floodmanagement.com",
        phone: "+912020202020",
        password: "pune123",
        role: "municipality",
        roles: ["municipality", "citizen"],
        location: {
          type: "Point",
          coordinates: [73.8567, 18.5204], // Pune coordinates
          address: "Pune Municipal Corporation, Shivajinagar, Pune",
          district: "Pune",
          state: "Maharashtra",
          pincode: "411005",
        },
        isVerified: true,
        trustScore: 1000,
        governmentId: "MH-PUN-2024-001",
      },
    ];

    const createdUsers = [];
    const existingUsers = [];

    for (const userData of municipalityUsers) {
      try {
        // Check if municipality user already exists
        const existingUser = await User.findOne({
          $or: [{ email: userData.email }, { phone: userData.phone }],
        });

        if (existingUser) {
          console.log(`🔄 Municipality user already exists: ${userData.name}`);
          console.log(`   Email: ${existingUser.email}`);
          console.log(`   Role: ${existingUser.role}`);
          existingUsers.push(existingUser);
          continue;
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);

        // Create the municipality user
        const municipalityUser = new User(userData);
        await municipalityUser.save();

        console.log(`✅ Municipality user created: ${userData.name}`);
        console.log(`   📧 Email: ${userData.email}`);
        console.log(`   🔑 Password: ${userData.password}`);
        console.log(`   📱 Phone: ${userData.phone}`);
        console.log(
          `   🏛️  Location: ${userData.location.district}, ${userData.location.state}`
        );
        console.log(`   🆔 Gov ID: ${userData.governmentId}`);
        console.log("");

        createdUsers.push(municipalityUser);
      } catch (error) {
        console.error(
          `❌ Error creating municipality user ${userData.name}:`,
          error.message
        );
      }
    }

    // Summary
    console.log("📊 SUMMARY:");
    console.log(`✅ Created: ${createdUsers.length} new municipality users`);
    console.log(
      `🔄 Already existed: ${existingUsers.length} municipality users`
    );
    console.log(
      `📝 Total municipality users in system: ${
        createdUsers.length + existingUsers.length
      }`
    );

    if (createdUsers.length > 0) {
      console.log("\n🔐 LOGIN CREDENTIALS FOR NEW MUNICIPALITY USERS:");
      console.log("=".repeat(60));
      createdUsers.forEach((user) => {
        const userData = municipalityUsers.find((u) => u.email === user.email);
        console.log(`🏛️  ${user.name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Password: ${userData.password}`);
        console.log(
          `   📍 Location: ${user.location.district}, ${user.location.state}`
        );
        console.log("");
      });
      console.log(
        "⚠️  IMPORTANT: Please ask municipality admins to change passwords after first login!"
      );
    }

    return { created: createdUsers, existing: existingUsers };
  } catch (error) {
    console.error("❌ Error creating municipality users:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

// Create a single municipality user (for testing or specific use)
const createSingleMunicipalityUser = async (municipalityData) => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/flood-management"
    );

    const existingUser = await User.findOne({
      $or: [
        { email: municipalityData.email },
        { phone: municipalityData.phone },
      ],
    });

    if (existingUser) {
      console.log("Municipality user already exists:", existingUser.email);
      return existingUser;
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    municipalityData.password = await bcrypt.hash(
      municipalityData.password,
      salt
    );

    const user = new User(municipalityData);
    await user.save();

    console.log("✅ Municipality user created successfully!");
    console.log("📧 Email:", municipalityData.email);
    console.log("🔑 Password:", municipalityData.password);
    console.log("🏛️  Municipality:", municipalityData.name);

    return user;
  } catch (error) {
    console.error("❌ Error creating municipality user:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
};

// Run the script
if (require.main === module) {
  createMunicipalityUsers()
    .then(() => {
      console.log("Municipality users creation script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Municipality users creation script failed:", error);
      process.exit(1);
    });
}

module.exports = { createMunicipalityUsers, createSingleMunicipalityUser };
