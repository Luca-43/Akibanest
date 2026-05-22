const express = require('express');
const router = express.Router();
const {
  register, login, getMe,
  updateProfile, memberLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/member-login', memberLogin);
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);

module.exports = router;