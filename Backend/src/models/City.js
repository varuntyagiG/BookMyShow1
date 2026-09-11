const mongoose = require('mongoose');

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'City name is required'],
      unique: true,
      trim: true,
      index: true
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    icon: {
      type: String,
      default: '🏙️'
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('City', citySchema);
