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
      enum: ['percentage', 'fixed', 'flat', 'b1g1'],
      default: 'percentage'
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: 0,
      default: 0
    },
    minBookingAmount: {
      type: Number,
      default: 0
    },
    maxDiscount: {
      type: Number,
      default: 0 // 0 means no cap
    },
    maxDiscountAmount: {
      type: Number,
      default: 0
    },
    bankName: {
      type: String,
      default: ''
    },
    cardType: {
      type: String,
      default: 'All'
    },
    category: {
      type: String,
      default: 'bank'
    },
    badgeText: {
      type: String,
      default: ''
    },
    usageLimitPerUser: {
      type: Number,
      default: 1
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual to synchronize maxDiscount and maxDiscountAmount
offerSchema.pre('save', function () {
  if (this.maxDiscountAmount && !this.maxDiscount) {
    this.maxDiscount = this.maxDiscountAmount;
  } else if (this.maxDiscount && !this.maxDiscountAmount) {
    this.maxDiscountAmount = this.maxDiscount;
  }
  if (this.isActive !== undefined) {
    this.status = this.isActive ? 'active' : 'inactive';
  }
});

module.exports = mongoose.model('Offer', offerSchema);

