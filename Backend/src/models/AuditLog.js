const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    adminEmail: {
      type: String,
      default: ''
    },
    action: {
      type: String,
      required: [true, 'Action type is required'],
      index: true
      // e.g. 'PARTNER_APPROVED', 'PARTNER_SUSPENDED', 'PARTNER_REACTIVATED',
      // 'MOVIE_CREATED', 'MOVIE_UPDATED', 'MOVIE_ARCHIVED',
      // 'CINEMA_STATUS_CHANGED', 'SHOW_CANCELLED', 'BOOKING_CANCELLED', 'OFFER_CREATED'
    },
    entityType: {
      type: String,
      required: true,
      index: true
      // 'User', 'Movie', 'Cinema', 'Show', 'Booking', 'Offer', 'City'
    },
    entityId: {
      type: String,
      required: true
    },
    entityName: {
      type: String,
      default: ''
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
