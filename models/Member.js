const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization', required: true,
  },
  memberNumber: { type: String, required: true },
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, required: [true, 'Phone is required'], trim: true },
  nationalId: { type: String, trim: true },
  avatar: { type: String },
  role: {
    type: String,
    enum: ['chairperson', 'treasurer', 'secretary', 'member'],
    default: 'member',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  joinDate: { type: Date, default: Date.now },
  nextOfKin: {
    name: String, phone: String, relationship: String,
  },
  totalContributions: { type: Number, default: 0 },
  totalLoans: { type: Number, default: 0 },
  loanBalance: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

// Ensure memberNumber is unique per organization
MemberSchema.index({ organization: 1, memberNumber: 1 }, { unique: true });
MemberSchema.index({ organization: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Member', MemberSchema);

const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization', required: true,
  },
  memberNumber: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  nationalId: { type: String, trim: true },
  avatar: { type: String },
  role: {
    type: String,
    enum: ['chairperson', 'treasurer', 'secretary', 'member'],
    default: 'member',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  pin: { type: String, default: '1234' },
  joinDate: { type: Date, default: Date.now },
  nextOfKin: { name: String, phone: String, relationship: String },
  totalContributions: { type: Number, default: 0 },
  totalLoans: { type: Number, default: 0 },
  loanBalance: { type: Number, default: 0 },
  notes: { type: String },
}, { timestamps: true });

MemberSchema.index({ organization: 1, memberNumber: 1 }, { unique: true });
MemberSchema.index({ organization: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('Member', MemberSchema);