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
    }
  },
  {
    timestamps: true
  }
);

// Compound index to quickly look up bookings by movie, theatre, showtime and date
bookingSchema.index({ movieTitle: 1, theatreName: 1, showtime: 1, showDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
