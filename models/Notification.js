const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, required: true },
  recipientType: { type: String, enum: ['user', 'member'], default: 'user' },
  type: {
    type: String,
    enum: ['contribution', 'loan_applied', 'loan_approved', 'loan_rejected', 'loan_repayment', 'meeting', 'announcement', 'general'],
    default: 'general',
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  data: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);