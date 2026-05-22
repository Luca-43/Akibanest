const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { getStats } = require('../controllers/contributionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/contributions', getStats);

module.exports = router;