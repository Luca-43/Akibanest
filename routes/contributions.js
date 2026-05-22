const express = require('express');
const router = express.Router();
const { getContributions, addContribution, getStats } = require('../controllers/contributionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getStats);
router.get('/', getContributions);
router.post('/', addContribution);

module.exports = router;