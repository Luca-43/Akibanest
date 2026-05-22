const User = require('../models/User');
const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @route  POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { orgName, orgType, adminName, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const organization = await Organization.create({
      name: orgName, type: orgType || 'chama',
      phone, email,
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      organization: organization._id,
      name: adminName, email,
      password: hashedPassword,
      phone, role: 'admin',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Organization registered successfully',
      token,
      user: {
        id: user._id, name: user.name,
        email: user.email, role: user.role,
        organization: { id: organization._id, name: organization.name, type: organization.type },
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .populate('organization', 'name type logo currency');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated. Contact your admin.' });
    }

    // Update last login without triggering pre-save hook
    await User.findByIdAndUpdate(user._id, { lastLogin: Date.now() });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id, name: user.name,
        email: user.email, role: user.role,
        phone: user.phone, avatar: user.avatar,
        organization: user.organization,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('organization', 'name type logo currency contributionAmount');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route  PUT /api/auth/updateprofile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id, { name, phone }, { new: true, runValidators: true }
    ).populate('organization', 'name type');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @route  POST /api/auth/member-login
// @desc   Member login with member number + PIN
// @access Public
exports.memberLogin = async (req, res) => {
  try {
    const { memberNumber, pin, organizationId } = req.body;
    if (!memberNumber || !pin) {
      return res.status(400).json({ success: false, message: 'Please provide member number and PIN' });
    }

    const Member = require('../models/Member');
    const member = await Member.findOne({
      memberNumber: memberNumber.toUpperCase().trim(),
      organization: organizationId,
      status: 'active',
    }).populate('organization', 'name type currency');

    if (!member) {
      return res.status(401).json({ success: false, message: 'Member not found or inactive' });
    }

    if (member.pin !== pin) {
      return res.status(401).json({ success: false, message: 'Invalid PIN' });
    }

    const token = generateToken(member._id);

    res.json({
      success: true,
      token,
      isMember: true,
      member: {
        id: member._id,
        name: member.name,
        memberNumber: member.memberNumber,
        phone: member.phone,
        role: member.role,
        totalContributions: member.totalContributions,
        loanBalance: member.loanBalance,
        organization: member.organization,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};