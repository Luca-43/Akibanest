const Contribution = require('../models/Contribution');
const Member = require('../models/Member');

// @route GET /api/contributions
// @access Private
exports.getContributions = async (req, res) => {
  try {
    const { month, memberId, status } = req.query;
    const query = { organization: req.user.organization._id };
    if (month) query.month = month;
    if (memberId) query.member = memberId;
    if (status) query.status = status;

    const contributions = await Contribution.find(query)
      .populate('member', 'name memberNumber phone')
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 });

    const total = contributions.reduce((sum, c) => sum + c.amount, 0);

    res.json({ success: true, count: contributions.length, total, contributions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/contributions
// @access Private
exports.addContribution = async (req, res) => {
  try {
    const { memberId, amount, type, paymentMethod, mpesaCode, notes } = req.body;
    const orgId = req.user.organization._id;

    const member = await Member.findOne({ _id: memberId, organization: orgId });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const contribution = await Contribution.create({
      organization: orgId,
      member: memberId,
      amount, type, paymentMethod, mpesaCode, notes, month,
      recordedBy: req.user._id,
    });

    // Update member total contributions
    await Member.findByIdAndUpdate(memberId, {
      $inc: { totalContributions: amount },
    });

    const populated = await contribution.populate('member', 'name memberNumber');
    res.status(201).json({ success: true, message: 'Contribution recorded', contribution: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route GET /api/contributions/stats
// @access Private
exports.getStats = async (req, res) => {
  try {
    const orgId = req.user.organization._id;
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Total savings ever
    const totalResult = await Contribution.aggregate([
      { $match: { organization: orgId, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // This month contributions
    const monthResult = await Contribution.aggregate([
      { $match: { organization: orgId, status: 'confirmed', month: thisMonth } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Last 6 months trend
    const trend = await Contribution.aggregate([
      { $match: { organization: orgId, status: 'confirmed' } },
      { $group: { _id: '$month', total: { $sum: '$amount' } } },
      { $sort: { _id: -1 } },
      { $limit: 6 },
    ]);

    // Recent contributions
    const recent = await Contribution.find({ organization: orgId })
      .populate('member', 'name memberNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      totalSavings: totalResult[0]?.total || 0,
      thisMonth: monthResult[0]?.total || 0,
      trend: trend.reverse(),
      recent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};