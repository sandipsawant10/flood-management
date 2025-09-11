const mongoose = require('mongoose');

const financialAidRequestSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  amountRequested: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewComment:  String
}, { timestamps: true });

module.exports = mongoose.model('FinancialAidRequest', financialAidRequestSchema);