const express = require("express");
const { auth, authorize } = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const aiVerificationService = require("../services/aiVerificationService");
const FloodReport = require("../models/FloodReport");
const { logger } = require("../middleware/errorHandler");
const router = express.Router();

// Trigger AI verification for a specific report
router.post("/verify/:reportId", auth, async (req, res) => {
  try {
    const { reportId } = req.params;

    // Check if report exists
    const report = await FloodReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Only allow verification of pending reports
    if (report.verificationStatus !== "pending") {
      return res.status(400).json({
        message: "This report has already been verified or rejected",
      });
    }

    // Run AI verification
    const verificationResults = await aiVerificationService.verifyFloodReport(
      reportId
    );

    res.status(200).json({
      message: "AI verification completed",
      status: verificationResults.overallStatus,
      confidence: verificationResults.confidence,
      details: verificationResults,
    });
  } catch (error) {
    logger.error(`AI verification route error: ${error.message}`);
    res
      .status(500)
      .json({ message: `Error during AI verification: ${error.message}` });
  }
});

// Bulk verification of pending reports
router.post("/bulk-verify", auth, roleAuth(["admin"]), async (req, res) => {
  try {
    const { limit = 20 } = req.body;

    // Limit the number of reports that can be processed at once
    const maxLimit = Math.min(limit, 50);

    const results = await aiVerificationService.bulkVerifyPendingReports(
      maxLimit
    );

    res.status(200).json({
      message: "Bulk verification completed",
      results,
    });
  } catch (error) {
    logger.error(`Bulk verification route error: ${error.message}`);
    res
      .status(500)
      .json({ message: `Error during bulk verification: ${error.message}` });
  }
});

// Get verification status and confidence for a report
router.get("/status/:reportId", auth, async (req, res) => {
  try {
    const { reportId } = req.params;

    const report = await FloodReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({
      reportId,
      verificationStatus: report.verificationStatus,
      aiVerification: {
        status: report.verification?.status || "pending",
        confidence: report.aiConfidence || 0,
        summary: report.verification?.summary || "Not verified yet",
        weather: report.verification?.weather || {},
        news: report.verification?.news || {},
        social: report.verification?.social || {},
      },
    });
  } catch (error) {
    logger.error(`Verification status route error: ${error.message}`);
    res
      .status(500)
      .json({ message: `Error getting verification status: ${error.message}` });
  }
});

// Get verification statistics
router.get(
  "/statistics",
  auth,
  roleAuth(["admin", "municipality"]),
  async (req, res) => {
    try {
      const totalCount = await FloodReport.countDocuments();
      const pendingCount = await FloodReport.countDocuments({
        verificationStatus: "pending",
      });
      const verifiedCount = await FloodReport.countDocuments({
        verificationStatus: "verified",
      });
      const disputedCount = await FloodReport.countDocuments({
        verificationStatus: "disputed",
      });
      const falseCount = await FloodReport.countDocuments({
        verificationStatus: "false",
      });

      // Get AI verification statistics
      const aiVerifiedCount = await FloodReport.countDocuments({
        "verification.status": "verified",
        verificationStatus: "verified",
      });

      const aiDisputedCount = await FloodReport.countDocuments({
        "verification.status": "not-matched",
        verificationStatus: { $in: ["disputed", "false"] },
      });

      const manualReviewCount = await FloodReport.countDocuments({
        "verification.status": "manual-review",
      });

      const highConfidenceCount = await FloodReport.countDocuments({
        aiConfidence: { $gte: 0.8 },
      });

      const lowConfidenceCount = await FloodReport.countDocuments({
        aiConfidence: { $lt: 0.5, $gt: 0 },
      });

      res.status(200).json({
        totalReports: totalCount,
        statusCounts: {
          pending: pendingCount,
          verified: verifiedCount,
          disputed: disputedCount,
          false: falseCount,
        },
        aiVerification: {
          aiVerified: aiVerifiedCount,
          aiDisputed: aiDisputedCount,
          manualReview: manualReviewCount,
          highConfidence: highConfidenceCount,
          lowConfidence: lowConfidenceCount,
        },
      });
    } catch (error) {
      logger.error(`Verification statistics route error: ${error.message}`);
      res
        .status(500)
        .json({
          message: `Error getting verification statistics: ${error.message}`,
        });
    }
  }
);

module.exports = router;
