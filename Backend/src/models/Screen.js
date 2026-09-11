const mongoose = require('mongoose');

const seatRowSchema = new mongoose.Schema(
  {
    row: {
      type: String,
      required: true,
      trim: true
    },
    tier: {
      type: String,
      enum: ['Normal', 'Premium', 'Recliner'],
      default: 'Normal'
    },
    basePrice: {
      type: Number,
      default: 200
    },
    seatsCount: {
      type: Number,
      default: 12
    },
    disabledSeats: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const screenSchema = new mongoose.Schema(
  {
    cinema: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true,
      index: true
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    screenNumber: {
      type: String,
      required: [true, 'Screen number/identifier is required'],
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Screen name is required'],
      trim: true
    },
    screenType: {
      type: String,
      enum: ['Standard 2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX', 'Gold Class'],
      default: 'Standard 2D'
    },
    totalCapacity: {
      type: Number,
      required: true,
      default: 120
    },
    seatingLayout: [seatRowSchema],
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index: screen number must be unique per cinema
screenSchema.index({ cinema: 1, screenNumber: 1 }, { unique: true });

module.exports = mongoose.model('Screen', screenSchema);
