const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  time: { type: String, required: true },
  format: { type: String, default: '2D' },
  status: { type: String, enum: ['available', 'filling_fast', 'almost_full', 'sold_out'], default: 'available' },
  price: { type: String, default: '₹450' },
  bookedSeats: { type: [String], default: [] }
}, { _id: true });

const theatreSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  distance: { type: String, default: '' },
  facilities: { type: [String], default: ['M-Ticket', 'F&B'] },
  showtimes: [showtimeSchema]
}, { _id: true });

const movieSchema = new mongoose.Schema(
  {
    customId: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    synopsis: {
      type: String,
      default: ''
    },
    genre: {
      type: [String],
      default: []
    },
    language: {
      type: String,
      default: 'Hindi'
    },
    certificate: {
      type: String,
      default: 'UA'
    },
    duration: {
      type: String,
      default: ''
    },
    releaseDate: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      default: 8.0
    },
    voteCount: {
      type: String,
      default: '10K'
    },
    posterUrl: {
      type: String,
      default: ''
    },
    backdropUrl: {
      type: String,
      default: ''
    },
    formats: {
      type: [String],
      default: ['2D']
    },
    cities: {
      type: [String],
      default: ['Mumbai', 'Delhi-NCR', 'Bengaluru']
    },
    cast: [
      {
        name: String,
        role: String,
        photo: String
      }
    ],
    theatres: [theatreSchema],
    isPromoted: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['published', 'draft', 'archived'],
      default: 'published',
      index: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Text index for search (disable language_override since Movie has a language field)
movieSchema.index({ title: 'text', language: 'text', genre: 'text' }, { default_language: 'none', language_override: 'none' });

module.exports = mongoose.model('Movie', movieSchema);
