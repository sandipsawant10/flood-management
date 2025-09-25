#!/usr/bin/env node

/**
 * Script to run bulk AI verification on pending flood reports
 * Can be scheduled as a cron job to periodically verify reports
 */

require("dotenv").config();
const mongoose = require("mongoose");
const aiVerificationService = require("../services/aiVerificationService");
const { logger } = require("../middleware/errorHandler");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    logger.info("MongoDB Connected");
    runVerification();
  })
  .catch((err) => {
    logger.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

/**
 * Run bulk verification process
 */
async function runVerification() {
  logger.info("Starting bulk verification process...");

  try {
    // Get CLI arguments
    const args = process.argv.slice(2);
    const limitArg = args.find((arg) => arg.startsWith("--limit="));
    const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 50;

    // Run bulk verification
    const results = await aiVerificationService.bulkVerifyPendingReports(limit);

    logger.info("Bulk verification completed:");
    logger.info(`- Reports processed: ${results.processed}`);
    logger.info(`- Verified: ${results.verified}`);
    logger.info(`- Disputed: ${results.disputed}`);
    logger.info(`- Failed: ${results.failed}`);

    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error("Error during bulk verification:", error);
    mongoose.disconnect();
    process.exit(1);
  }
}

// Handle termination signals
process.on("SIGINT", () => {
  logger.info("Process interrupted");
  mongoose.disconnect();
  process.exit(0);
});

process.on("SIGTERM", () => {
  logger.info("Process terminated");
  mongoose.disconnect();
  process.exit(0);
});
