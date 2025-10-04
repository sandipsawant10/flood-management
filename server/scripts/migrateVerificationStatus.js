// scripts/migrateVerificationStatus.js
// Run with: node scripts/migrateVerificationStatus.js

const mongoose = require("mongoose");
const FloodReport = require("../models/FloodReport");
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/flood-disaster-management";

async function migrate() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const reports = await FloodReport.find({
    "verification.verificationStatus": { $exists: true },
  });
  let updated = 0;
  for (const report of reports) {
    // Always set root from nested if present and different
    if (
      report.verification &&
      typeof report.verification.verificationStatus === "string" &&
      report.verification.verificationStatus !== report.verificationStatus
    ) {
      report.verificationStatus = report.verification.verificationStatus;
      delete report.verification.verificationStatus;
      updated++;
      await report.save();
    }
    // Clean up: if verification is now empty, remove it
    if (report.verification && Object.keys(report.verification).length === 0) {
      report.verification = undefined;
      await report.save();
    }
  }
  console.log(`Migrated ${updated} reports.`);
  await mongoose.disconnect();
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
