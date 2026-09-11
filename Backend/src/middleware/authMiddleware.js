const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test_jwt_secret_key_123' : null);
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is missing. Please set JWT_SECRET in your .env file.');
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Look up user by MongoDB ObjectId or email
    let user = null;
    if (decoded.id && decoded.id.match(/^[0-9a-fA-F]{24}$/)) {
      user = await User.findById(decoded.id).select('-password');
    }
    if (!user && decoded.email) {
      user = await User.findOne({ email: decoded.email.toLowerCase() }).select('-password');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found or session expired.' });
    }

    if (user.isDeactivated) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact platform administration.'
      });
    }

    // Preserve exact RBAC roles: 'admin', 'cinema_partner', 'customer'
    const rawRole = (user.role || '').toLowerCase();
    let normalizedRole = 'customer';
    if (rawRole === 'admin') {
      normalizedRole = 'admin';
    } else if (rawRole === 'cinema_partner' || rawRole === 'partner') {
      normalizedRole = 'cinema_partner';
    }

    req.user = {
      _id: user._id,
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: normalizedRole,
      partnerStatus: user.partnerStatus || 'active',
      isDeactivated: !!user.isDeactivated,
      businessName: user.businessName || '',
      partnerPhone: user.partnerPhone || ''
    };
    next();
  } catch (_err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
}

// Ensure caller is a verified Platform Administrator
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Platform Administrator privileges required.'
    });
  }
  next();
}

// Ensure caller is an active Cinema Partner
function requireCinemaPartner(req, res, next) {
  if (!req.user || req.user.role !== 'cinema_partner') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Cinema Partner privileges required.'
    });
  }

  // Enforce administrative partner suspension
  if (req.user.partnerStatus === 'suspended') {
    return res.status(403).json({
      success: false,
      message: 'Your Cinema Partner account has been suspended by platform administration. Contact support.'
    });
  }

  next();
}

// Universal role authorization helper
function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of: ${roles.join(', ')}`
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireCinemaPartner,
  authorizeRoles,
  JWT_SECRET
};


