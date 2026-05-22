const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization', required: true,
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member', required: true,
  },
  amount: { type: Number, required: [true, 'Amount is required'], min: 1 },
  type: {
    type: String,
    enum: ['regular', 'emergency', 'special', 'fine', 'registration'],
    default: 'regular',
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'cash', 'bank', 'cheque'],
    default: 'mpesa',
  },
  mpesaCode: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'confirmed',
  },
  month: { type: String }, // e.g. "2025-05"
  notes: { type: String },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('Contribution', ContributionSchema);