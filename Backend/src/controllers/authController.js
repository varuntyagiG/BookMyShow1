const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

function generateToken(user) {
  return jwt.sign(
    {
      id: user._id ? user._id.toString() : user.id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Customer Registration
async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check existing user in MongoDB
    const existingUser = await User.findOne({ email: trimmedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: trimmedEmail,
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      role: 'customer'
    });

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.'
    });
  }
}

// Customer Sign In / Login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find user in MongoDB
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.'
      });
    }

    if (user.isDeactivated) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact customer support.'
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      message: 'Welcome back, ' + user.name + '!',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: 'customer'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.'
    });
  }
}

// Get current customer profile
async function getMe(req, res) {
  try {
    const Booking = require('../models/Booking');
    const [freshUser, totalBookings] = await Promise.all([
      User.findById(req.user._id).select('-password'),
      Booking.countDocuments({ user: req.user._id })
    ]);

    return res.json({
      success: true,
      user: {
        ...req.user,
        name: freshUser?.name || req.user.name,
        phone: freshUser?.phone || req.user.phone,
        createdAt: freshUser?.createdAt,
        totalBookings
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching profile.'
    });
  }
}

// Update current customer profile
async function updateMe(req, res) {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { returnDocument: 'after' }
    ).select('-password');

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        ...req.user,
        name: updatedUser.name,
        phone: updatedUser.phone
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.'
    });
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateMe
};
