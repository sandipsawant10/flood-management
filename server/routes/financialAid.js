const express = require('express');
const router = express.Router();
const FinancialAidRequest = require('../models/FinancialAidRequest');
const { auth, authorize } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// POST /financial-aid - Submit request (user)
router.post('/', auth, authorize(['user']), async (req, res) => {
  try {
    const { reason, amountRequested } = req.body;
    const financialAidRequest = new FinancialAidRequest({ applicant: req.user.id, reason, amountRequested });
    await financialAidRequest.save();
    res.status(201).json(financialAidRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /financial-aid - List all (municipality role)
router.get('/', auth, authorize(['municipality', 'admin']), async (req, res) => {
  try {
    const financialAidRequests = await FinancialAidRequest.find().populate('applicant', 'name email').populate('reviewedBy', 'name email');
    res.json(financialAidRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /financial-aid/:id/review - Approve/reject (municipality role)
router.put('/:id/review', auth, authorize(['municipality', 'admin']), async (req, res) => {
  try {
    const { status, reviewComment } = req.body;
    const financialAidRequest = await FinancialAidRequest.findById(req.params.id).populate('applicant', 'name email');
    
    if (!financialAidRequest) {
      return res.status(404).json({ message: 'Financial Aid Request not found' });
    }

    financialAidRequest.status = status;
    financialAidRequest.reviewComment = reviewComment;
    financialAidRequest.reviewedBy = req.user.id;
    await financialAidRequest.save();

    // Send notification to the applicant
    const notificationTitle = `Financial Aid Request ${status === 'approved' ? 'Approved' : 'Rejected'}`;
    const notificationMessage = status === 'approved'
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
          <li>Review Comment: ${reviewComment || 'No comment provided'}</li>
        </ul>
        <p>If you have any questions, please contact our support team.</p>
      `
    );

    res.json(financialAidRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;