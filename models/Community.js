const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, required: true },
  authorType: { type: String, enum: ['user', 'member'], default: 'member' },
  authorName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const CommunitySchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  type: { type: String, enum: ['announcement', 'issue', 'discussion', 'poll'], default: 'discussion' },
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, required: true },
  authorType: { type: String, enum: ['user', 'member'], default: 'user' },
  authorName: { type: String, required: true },
  status: { type: String, enum: ['open', 'resolved', 'closed'], default: 'open' },
  isPinned: { type: Boolean, default: false },
  comments: [CommentSchema],
  likes: [{ type: mongoose.Schema.Types.ObjectId }],
}, { timestamps: true });

module.exports = mongoose.model('Community', CommunitySchema);