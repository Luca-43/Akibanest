const express = require('express');
const router = express.Router();
const {
  getLoans, applyLoan, approveLoan,
  rejectLoan, recordRepayment, getLoanStats,
} = require('../controllers/loanController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getLoanStats);
router.get('/', getLoans);
router.post('/', applyLoan);
router.put('/:id/approve', authorize('admin', 'treasurer'), approveLoan);
router.put('/:id/reject', authorize('admin', 'treasurer'), rejectLoan);
router.post('/:id/repay', authorize('admin', 'treasurer'), recordRepayment);

module.exports = router;