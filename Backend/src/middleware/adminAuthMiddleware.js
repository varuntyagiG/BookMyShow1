const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('./authMiddleware');

async function authenticateAdminToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Platform Admin access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;
    if (decoded.id && decoded.id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(decoded.id).select('-password');
    }
    if (!user && decoded.email) {
      user = await User.findOne({ email: decoded.email.toLowerCase() }).select('-password');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found or session expired.'
      });
    }

    if (user.isDeactivated) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated.'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Super Admin / Platform Admin privileges required.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired admin session token.'
    });
  }
}

module.exports = {
  authenticateAdminToken
};
