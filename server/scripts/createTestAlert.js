/**
 * Script to create test alert for API testing
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Alert = require("../models/Alert");

// Test alert data
const createTestAlert = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/flood-management"
    );
    console.log("Connected to MongoDB");

    // Check if test alert already exists
    const existingAlert = await Alert.findOne({ title: "Test Flood Alert" });
    if (existingAlert) {
      console.log("Test alert already exists:", existingAlert._id);
      return existingAlert;
    }

    // Create simple test alert data
    const testAlertData = {
      title: "Test Flood Alert",
      message: "This is a test flood alert for API testing purposes.",
      alertType: "warning",
      severity: "high",
      location: {
        type: "Point",
        coordinates: [75.9010467, 17.6700736], // [longitude, latitude] - near user's location
        address: "Test Location, Maharashtra, India",
      },
      targetArea: {
        type: "Polygon",
        coordinates: [
          [
            [75.9010467, 17.6700736], // Start point
            [75.9510467, 17.6700736], // East
            [75.9510467, 17.7200736], // North-East
            [75.9010467, 17.7200736], // North
            [75.9010467, 17.6700736], // Close the polygon
          ],
        ],
        districts: ["Test District"],
        states: ["Maharashtra"],
        radius: 50, // 50km radius
      },
      issuedBy: new mongoose.Types.ObjectId(), // Random ObjectId for testing
      source: "community",
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000), // Valid for 24 hours
      instructions: [
        "Stay indoors and avoid low-lying areas",
        "Keep emergency supplies ready",
        "Monitor weather updates",
      ],
      priority: 8,
      isActive: true,
    };

    // Create the alert using Alert.create() instead of new Alert()
    const testAlert = await Alert.create(testAlertData);

    console.log("✅ Test alert created successfully:", testAlert._id);
    console.log("📍 Location:", testAlert.location.coordinates);
    console.log("📅 Valid until:", testAlert.validUntil);

    return testAlert;
  } catch (error) {
    console.error("❌ Error creating test alert:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

// Run the script
if (require.main === module) {
  createTestAlert()
    .then(() => {
      console.log("Script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

module.exports = { createTestAlert };
