const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('./authMiddleware');

async function authenticateVendorToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Cinema Partner access denied. No authentication token provided.'
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
        message: 'Cinema Partner account not found or session expired.'
      });
    }

    if (user.isDeactivated) {
      return res.status(403).json({
        success: false,
        message: 'Your partner account has been deactivated. Please contact partner support.'
      });
    }

    if (user.role !== 'cinema_partner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Cinema Partner privileges required.'
      });
    }

    if (user.partnerStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your Cinema Partner account is currently suspended. Please contact partner operations.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired partner session token.'
    });
  }
}

module.exports = {
  authenticateVendorToken
};
