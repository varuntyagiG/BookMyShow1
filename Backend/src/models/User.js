const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['customer', 'cinema_partner', 'user', 'admin'],
      default: 'customer',
    },
    businessName: {
      type: String,
      trim: true,
      default: '',
    },
    partnerPhone: {
      type: String,
      trim: true,
      default: '',
    },
    businessAddress: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    partnerStatus: {
      type: String,
      enum: ['pending', 'approved', 'active', 'suspended'],
      default: 'active',
      index: true,
    },
    approvalNotes: {
      type: String,
      default: '',
    },
    suspendedReason: {
      type: String,
      default: '',
    },
    isDeactivated: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare candidate password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
