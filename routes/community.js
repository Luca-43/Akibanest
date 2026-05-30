const express = require('express');
const router = express.Router();
const {
  getPosts, createPost, addComment,
  resolvePost, deletePost,
} = require('../controllers/communityController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getPosts);
router.post('/', createPost);
router.post('/:id/comment', addComment);
router.put('/:id/resolve', authorize('admin'), resolvePost);
router.delete('/:id', authorize('admin'), deletePost);

module.exports = router;