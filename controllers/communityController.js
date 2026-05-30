const Community = require('../models/Community');

// GET /api/community — get all posts for org
exports.getPosts = async (req, res) => {
  try {
    const { type } = req.query;
    const query = { organization: req.user.organization._id };
    if (type) query.type = type;
    const posts = await Community.find(query)
      .sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, count: posts.length, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/community — create post/announcement
exports.createPost = async (req, res) => {
  try {
    const { title, body, type, isPinned } = req.body;
    const post = await Community.create({
      organization: req.user.organization._id,
      title, body,
      type: type || 'discussion',
      isPinned: isPinned && req.user.role === 'admin' ? true : false,
      author: req.user._id,
      authorType: 'user',
      authorName: req.user.name,
    });
    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/community/:id/comment — add comment
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Community.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      {
        $push: {
          comments: {
            author: req.user._id,
            authorType: 'user',
            authorName: req.user.name,
            text,
          }
        }
      },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/community/:id/resolve — resolve issue (admin)
exports.resolvePost = async (req, res) => {
  try {
    const post = await Community.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      { status: 'resolved' },
      { new: true }
    );
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/community/:id — delete post (admin)
exports.deletePost = async (req, res) => {
  try {
    await Community.findOneAndDelete({
      _id: req.params.id,
      organization: req.user.organization._id,
    });
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};