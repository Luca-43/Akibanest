const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Organization name is required'],
    trim: true, maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  type: {
    type: String,
    enum: ['chama', 'sacco', 'investment_group', 'welfare', 'other'],
    default: 'chama',
  },
  description: { type: String, maxlength: 500 },
  registrationNumber: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String },
  logo: { type: String },
  // Financial settings
  currency: { type: String, default: 'KES' },
  contributionAmount: { type: Number, default: 0 },
  contributionFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'annually'],
    default: 'monthly',
  },
  loanInterestRate: { type: Number, default: 10 },
  maxLoanMultiplier: { type: Number, default: 3 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Organization', OrganizationSchema);