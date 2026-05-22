const Member = require('../models/Member');

// Generate next member number for org
const generateMemberNumber = async (orgId) => {
  const count = await Member.countDocuments({ organization: orgId });
  return `MBR${String(count + 1).padStart(4, '0')}`;
};

// @route  GET /api/members
// @access Private
exports.getMembers = async (req, res, next) => {
  try {
    const { status, role, search } = req.query;
    const query = { organization: req.user.organization._id };

    if (status) query.status = status;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { memberNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await Member.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: members.length, members });
  } catch (error) { next(error); }
};

// @route  POST /api/members
// @access Private (admin, treasurer)
exports.addMember = async (req, res, next) => {
  try {
    const orgId = req.user.organization._id;
    const memberNumber = await generateMemberNumber(orgId);
    const member = await Member.create({
      ...req.body, organization: orgId, memberNumber,
    });
    res.status(201).json({ success: true, message: 'Member added successfully', member });
  } catch (error) { next(error); }
};

// @route  GET /api/members/:id
// @access Private
exports.getMember = async (req, res, next) => {
  try {
    const member = await Member.findOne({
      _id: req.params.id, organization: req.user.organization._id,
    });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, member });
  } catch (error) { next(error); }
};

// @route  PUT /api/members/:id
// @access Private (admin, treasurer)
exports.updateMember = async (req, res, next) => {
  try {
    const member = await Member.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true, runValidators: true }
    );
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, message: 'Member updated', member });
  } catch (error) { next(error); }
};

// @route  DELETE /api/members/:id (deactivate)
// @access Private (admin only)
exports.deactivateMember = async (req, res, next) => {
  try {
    const member = await Member.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      { status: 'inactive' }, { new: true }
    );
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });
    res.json({ success: true, message: 'Member deactivated', member });
  } catch (error) { next(error); }
};

// @route  GET /api/members/stats
// @access Private
exports.getMemberStats = async (req, res, next) => {
  try {
    const orgId = req.user.organization._id;
    const total = await Member.countDocuments({ organization: orgId });
    const active = await Member.countDocuments({ organization: orgId, status: 'active' });
    const inactive = await Member.countDocuments({ organization: orgId, status: 'inactive' });
    res.json({ success: true, stats: { total, active, inactive } });
  } catch (error) { next(error); }
};