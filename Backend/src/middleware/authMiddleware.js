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
        message: 'Your account has been deactivated. Please contact customer support.'
      });
    }

    req.user = {
      _id: user._id,
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: 'customer',
      isDeactivated: !!user.isDeactivated
    };
    next();
  } catch (_err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
