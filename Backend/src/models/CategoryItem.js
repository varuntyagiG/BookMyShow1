const mongoose = require('mongoose');

const categoryItemSchema = new mongoose.Schema(
  {
    categoryType: {
      type: String,
      required: true,
      enum: ['banner', 'event', 'sport', 'play', 'activity', 'premiere'],
      index: true
    },
    customId: {
      type: String,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    date: {
      type: String,
      default: ''
    },
    venue: {
      type: String,
      default: ''
    },
    price: {
      type: String,
      default: ''
    },
    rentPrice: {
      type: String,
      default: ''
    },
    buyPrice: {
      type: String,
      default: ''
    },
    city: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: ''
    },
    badge: {
      type: String,
      default: ''
    },
    link: {
      type: String,
      default: ''
    },
    movieId: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

categoryItemSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('CategoryItem', categoryItemSchema);
