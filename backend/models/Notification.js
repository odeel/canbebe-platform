const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'vaccine_due',
  'vaccine_overdue',
  'milestone',
  'diaper_size_upgrade',
  'feeding_tip',
  'sleep_tip',
  'mental_health_check',
  'product_recommendation',
  'community_reply',
  'system',
];

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    babyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Baby',
      default: null,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: [120, 'Title too long'],
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, 'Message too long'],
    },
    // When the notification should fire / was fired
    scheduledAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    read: {
      type: Boolean,
      default: false,
    },
    // Deduplication key — prevents sending same type for same baby in same window
    // Format: `${type}:${babyId}:${YYYY-MM}` or `${type}:${babyId}:${vaccineName}`
    dedupKey: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
notificationSchema.index({ userId: 1, read: 1, scheduledAt: -1 });
notificationSchema.index({ babyId: 1 });
notificationSchema.index({ scheduledAt: 1 });
// Sparse unique index on dedupKey — prevents duplicate notifications
notificationSchema.index(
  { dedupKey: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;