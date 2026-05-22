const Member = require('../models/Member');
const Contribution = require('../models/Contribution');
const Loan = require('../models/Loan');

// @route GET /api/reports/dashboard
// @access Private
exports.getDashboard = async (req, res) => {
  try {
    const orgId = req.user.organization._id;
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Members stats
    const totalMembers = await Member.countDocuments({ organization: orgId });
    const activeMembers = await Member.countDocuments({ organization: orgId, status: 'active' });

    // Contributions stats
    const savingsResult = await Contribution.aggregate([
      { $match: { organization: orgId, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const monthResult = await Contribution.aggregate([
      { $match: { organization: orgId, status: 'confirmed', month: thisMonth } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Loans stats (safe if Loan model doesn't exist yet)
    let totalLoans = 0;
    try {
      const loanResult = await Loan.aggregate([
        { $match: { organization: orgId, status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      totalLoans = loanResult[0]?.total || 0;
    } catch(e) {}

    // Trend for last 6 months
    const trend = await Contribution.aggregate([
      { $match: { organization: orgId, status: 'confirmed' } },
      { $group: { _id: '$month', total: { $sum: '$amount' } } },
      { $sort: { _id: -1 } }, { $limit: 6 },
    ]);

    // Recent activity
    const recentContributions = await Contribution.find({ organization: orgId })
      .populate('member', 'name')
      .sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalMembers, activeMembers,
        totalSavings: savingsResult[0]?.total || 0,
        monthlyContributions: monthResult[0]?.total || 0,
        totalLoans,
      },
      trend: trend.reverse(),
      recentActivity: recentContributions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};