const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie'
    },
    movieCustomId: {
      type: String,
      default: ''
    },
    categoryType: {
      type: String,
      enum: ['movie', 'event', 'sport', 'play', 'activity', 'stream'],
      default: 'movie'
    },
    movieTitle: {
      type: String,
      required: true
    },
    theatreName: {
      type: String,
      required: true
    },
    showtime: {
      type: String,
      required: true
    },
    showDate: {
      type: String,
      default: 'Today'
    },
    seats: {
      type: [String],
      required: true,
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one seat must be selected.'
      }
    },
    seatsCount: {
      type: Number,
      required: true
    },
    ticketPrice: {
      type: Number,
      required: true
    },
    convenienceFee: {
      type: Number,
      default: 45
    },
    includeSnacks: {
      type: Boolean,
      default: false
    },
    snacksFee: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid'
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    },
    // B2B Cinema Partner linkage
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      index: true
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    screen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen'
    },
    screenName: {
      type: String,
      default: 'Screen 1'
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      index: true
    },
    // Ticket Check-in & Gate Validation
    ticketValidated: {
      type: Boolean,
      default: false,
      index: true
    },
    validatedAt: {
      type: Date
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    validationHistory: [
      {
        validatedAt: { type: Date, default: Date.now },
        validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, default: 'CHECK_IN' },
        notes: { type: String, default: '' }
      }
    ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtuals for unified cross-panel compatibility
bookingSchema.virtual('status').get(function () {
  return this.bookingStatus;
});

bookingSchema.virtual('amount').get(function () {
  return this.totalAmount;
});

// Compound index to quickly look up bookings by movie, theatre, showtime and date
bookingSchema.index({ movieTitle: 1, theatreName: 1, showtime: 1, showDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
