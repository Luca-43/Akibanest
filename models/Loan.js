const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount: { type: Number, required: true },
  purpose: { type: String },
  interestRate: { type: Number, default: 10 },
  termMonths: { type: Number, default: 12 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'disbursed', 'completed'],
    default: 'pending',
  },
  amountPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  appliedDate: { type: Date, default: Date.now },
  approvedDate: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Loan', LoanSchema);