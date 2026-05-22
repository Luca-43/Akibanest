const Loan = require('../models/Loan');
const Member = require('../models/Member');

// @route GET /api/loans
exports.getLoans = async (req, res) => {
  try {
    const { status, memberId } = req.query;
    const query = { organization: req.user.organization._id };
    if (status) query.status = status;
    if (memberId) query.member = memberId;

    const loans = await Loan.find(query)
      .populate('member', 'name memberNumber phone')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    const totalDisbursed = loans
      .filter(l => l.status === 'approved' || l.status === 'completed')
      .reduce((sum, l) => sum + l.amount, 0);

    res.json({ success: true, count: loans.length, totalDisbursed, loans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/loans
exports.applyLoan = async (req, res) => {
  try {
    const { memberId, amount, purpose, termMonths, interestRate, notes } = req.body;
    const orgId = req.user.organization._id;

    const member = await Member.findOne({ _id: memberId, organization: orgId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const rate = interestRate || 10;
    const term = termMonths || 12;
    const interest = (amount * rate * term) / (100 * 12);
    const totalRepayable = amount + interest;

    const loan = await Loan.create({
      organization: orgId,
      member: memberId,
      amount, purpose, termMonths: term,
      interestRate: rate, totalRepayable,
      balance: totalRepayable,
      notes,
    });

    await Member.findByIdAndUpdate(memberId, {
      $inc: { totalLoans: amount },
      loanBalance: totalRepayable,
    });

    const populated = await loan.populate('member', 'name memberNumber');
    res.status(201).json({ success: true, message: 'Loan application submitted', loan: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/loans/:id/approve
exports.approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      {
        status: 'approved',
        approvedDate: Date.now(),
        approvedBy: req.user._id,
      },
      { new: true }
    ).populate('member', 'name memberNumber');

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }
    res.json({ success: true, message: 'Loan approved', loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/loans/:id/reject
exports.rejectLoan = async (req, res) => {
  try {
    const loan = await Loan.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      { status: 'rejected', rejectedReason: req.body.reason },
      { new: true }
    ).populate('member', 'name memberNumber');

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    await Member.findByIdAndUpdate(loan.member._id, {
      $inc: { totalLoans: -loan.amount },
      loanBalance: 0,
    });

    res.json({ success: true, message: 'Loan rejected', loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/loans/:id/repay
exports.recordRepayment = async (req, res) => {
  try {
    const { amount, paymentMethod, mpesaCode } = req.body;
    const loan = await Loan.findOne({
      _id: req.params.id,
      organization: req.user.organization._id,
    });

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }
    if (loan.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Loan is not active' });
    }

    loan.repayments.push({
      amount, paymentMethod, mpesaCode,
      recordedBy: req.user._id,
    });
    loan.amountPaid += amount;
    loan.balance = Math.max(0, loan.totalRepayable - loan.amountPaid);

    if (loan.balance === 0) loan.status = 'completed';
    await loan.save();

    await Member.findByIdAndUpdate(loan.member, {
      loanBalance: loan.balance,
    });

    res.json({ success: true, message: 'Repayment recorded', loan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/loans/stats
exports.getLoanStats = async (req, res) => {
  try {
    const orgId = req.user.organization._id;
    const all = await Loan.find({ organization: orgId });

    const stats = {
      total: all.length,
      pending: all.filter(l => l.status === 'pending').length,
      approved: all.filter(l => l.status === 'approved').length,
      rejected: all.filter(l => l.status === 'rejected').length,
      completed: all.filter(l => l.status === 'completed').length,
      totalDisbursed: all.filter(l => ['approved','completed'].includes(l.status)).reduce((s, l) => s + l.amount, 0),
      totalOutstanding: all.filter(l => l.status === 'approved').reduce((s, l) => s + l.balance, 0),
    };

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};