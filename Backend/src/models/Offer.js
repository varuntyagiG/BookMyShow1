const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      default: 'percentage'
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: 0
    },
    minBookingAmount: {
      type: Number,
      default: 0
    },
    maxDiscount: {
      type: Number,
      default: 0 // 0 means no cap
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date,
      required: [true, 'Expiry date is required']
    },
    usageLimit: {
      type: Number,
      default: 1000
    },
    timesUsed: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
      index: true
    },
    applicableCategories: {
      type: [String],
      default: ['movie', 'event', 'play', 'sport', 'activity']
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Offer', offerSchema);
