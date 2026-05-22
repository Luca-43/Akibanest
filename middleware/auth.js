const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — verify JWT token
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).populate('organization');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Role-based access control
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action`,
      });
    }
    next();
  };
};

// Ensure user only accesses their own organization's data
exports.sameOrg = (req, res, next) => {
  const orgId = req.params.orgId || req.body.organizationId;
  if (orgId && orgId !== req.user.organization._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};