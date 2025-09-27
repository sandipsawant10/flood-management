const express = require("express");
const router = express.Router();
const FinancialAidRequest = require("../models/FinancialAidRequest");
const { auth, authorize } = require("../middleware/auth");
const notificationService = require("../services/notificationService");

// POST /financial-aid - Submit request (user)
router.post("/", auth, authorize(["user"]), async (req, res) => {
  try {
    const { reason, amountRequested } = req.body;
    const financialAidRequest = new FinancialAidRequest({
      applicant: req.user.id,
      reason,
      amountRequested,
    });
    await financialAidRequest.save();
    res.status(201).json(financialAidRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /financial-aid - List all (municipality role)
router.get(
  "/",
  auth,
  authorize(["municipality", "admin"]),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sortField = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const filter = {};
      if (status) filter.status = status;

      const sortOptions = {};
      sortOptions[sortField] = sortOrder === "desc" ? -1 : 1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const financialAidRequests = await FinancialAidRequest.find(filter)
        .populate("applicant", "name email phone")
        .populate("reviewedBy", "name email")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await FinancialAidRequest.countDocuments(filter);

      res.json({
        success: true,
        data: {
          requests: financialAidRequests,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
          },
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// PUT /financial-aid/:id/review - Approve/reject (municipality role)
router.put(
  "/:id/review",
  auth,
  authorize(["municipality", "admin"]),
  async (req, res) => {
    try {
      const { status, reviewComment } = req.body;
      const financialAidRequest = await FinancialAidRequest.findById(
        req.params.id
      ).populate("applicant", "name email");

      if (!financialAidRequest) {
        return res
          .status(404)
          .json({ message: "Financial Aid Request not found" });
      }

      financialAidRequest.status = status;
      financialAidRequest.reviewComment = reviewComment;
      financialAidRequest.reviewedBy = req.user.id;
      await financialAidRequest.save();

      // Send notification to the applicant
      const notificationTitle = `Financial Aid Request ${
        status === "approved" ? "Approved" : "Rejected"
      }`;
      const notificationMessage =
        status === "approved"
          ? `Your financial aid request for PHP ${financialAidRequest.amountRequested} has been approved.`
          : `Your financial aid request for PHP ${financialAidRequest.amountRequested} has been rejected. Reason: ${reviewComment}`;

      await notificationService.sendEmail(
        financialAidRequest.applicant.email,
        notificationTitle,
        `
        <h1>${notificationTitle}</h1>
        <p>Dear ${financialAidRequest.applicant.name},</p>
        <p>${notificationMessage}</p>
        <p>Request Details:</p>
        <ul>
          <li>Amount: PHP ${financialAidRequest.amountRequested}</li>
          <li>Reason: ${financialAidRequest.reason}</li>
          <li>Review Comment: ${reviewComment || "No comment provided"}</li>
        </ul>
        <p>If you have any questions, please contact our support team.</p>
      `
      );

      res.json(financialAidRequest);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// GET /financial-aid/stats - Get financial aid statistics
router.get(
  "/stats",
  auth,
  authorize(["municipality", "admin"]),
  async (req, res) => {
    try {
      const totalRequests = await FinancialAidRequest.countDocuments();
      const pendingRequests = await FinancialAidRequest.countDocuments({
        status: "pending",
      });
      const approvedRequests = await FinancialAidRequest.countDocuments({
        status: "approved",
      });
      const rejectedRequests = await FinancialAidRequest.countDocuments({
        status: "rejected",
      });

      const totalAmountRequested = await FinancialAidRequest.aggregate([
        { $group: { _id: null, total: { $sum: "$amountRequested" } } },
      ]);

      const approvedAmountRequested = await FinancialAidRequest.aggregate([
        { $match: { status: "approved" } },
        { $group: { _id: null, total: { $sum: "$amountRequested" } } },
      ]);

      res.json({
        success: true,
        data: {
          totalRequests,
          pendingRequests,
          approvedRequests,
          rejectedRequests,
          totalAmountRequested: totalAmountRequested[0]?.total || 0,
          approvedAmountRequested: approvedAmountRequested[0]?.total || 0,
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// GET /financial-aid/export - Export financial aid report
router.get(
  "/export",
  auth,
  authorize(["municipality", "admin"]),
  async (req, res) => {
    try {
      const { status } = req.query;
      const filter = {};
      if (status) filter.status = status;

      const requests = await FinancialAidRequest.find(filter)
        .populate("applicant", "name email phone")
        .populate("reviewedBy", "name email")
        .sort({ createdAt: -1 });

      // Create CSV content
      const csvHeader =
        "ID,Applicant Name,Email,Phone,Amount Requested,Reason,Status,Review Comment,Created Date,Reviewed Date\n";
      const csvRows = requests
        .map((req) => {
          return [
            req._id,
            req.applicant?.name || "",
            req.applicant?.email || "",
            req.applicant?.phone || "",
            req.amountRequested,
            req.reason,
            req.status,
            req.reviewComment || "",
            req.createdAt,
            req.reviewedAt || "",
          ].join(",");
        })
        .join("\n");

      const csvContent = csvHeader + csvRows;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=financial-aid-requests.csv"
      );
      res.send(csvContent);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
