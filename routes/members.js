const express = require('express');
const router = express.Router();
const {
  getMembers, addMember, getMember,
  updateMember, deactivateMember, getMemberStats,
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All member routes require login

router.get('/stats', getMemberStats);
router.get('/', getMembers);
router.post('/', authorize('admin', 'treasurer', 'secretary'), addMember);
router.get('/:id', getMember);
router.put('/:id', authorize('admin', 'treasurer', 'secretary'), updateMember);
router.delete('/:id', authorize('admin'), deactivateMember);

module.exports = router;