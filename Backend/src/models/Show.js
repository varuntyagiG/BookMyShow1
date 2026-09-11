const mongoose = require('mongoose');

const pricingTiersSchema = new mongoose.Schema(
  {
    normal: { type: Number, default: 180 },
    premium: { type: Number, default: 250 },
    recliner: { type: Number, default: 400 }
  },
  { _id: false }
);

const showSchema = new mongoose.Schema(
  {
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true,
      index: true
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
      index: true
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true
    },
    movieTitle: {
      type: String,
      required: true,
      trim: true
    },
    showDate: {
      type: String,
      required: [true, 'Show date is required'], // e.g. '2026-09-20' or 'Today'
      trim: true,
      index: true
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'], // e.g. '07:30 PM'
      trim: true
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'], // e.g. '10:00 PM'
      trim: true
    },
    format: {
      type: String,
      default: '2D'
    },
    ticketPrice: {
      type: Number,
      required: true,
      default: 200
    },
    pricingTiers: {
      type: pricingTiersSchema,
      default: () => ({ normal: 180, premium: 250, recliner: 400 })
    },
    bookedSeats: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Index to quickly query shows by cinema, screen, date
showSchema.index({ cinema: 1, screen: 1, showDate: 1, startTime: 1 });

module.exports = mongoose.model('Show', showSchema);
