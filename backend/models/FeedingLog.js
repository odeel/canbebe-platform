const mongoose = require('mongoose');

const feedingLogSchema = new mongoose.Schema(
  {
    babyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Baby',
      required: true,
    },
    loggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['breast', 'formula', 'solid', 'water'],
      required: true,
    },
    // ml for liquid, grams for solid — omit if unknown
    quantity: {
      type: Number,
      min: [0, 'Quantity cannot be negative'],
      default: null,
    },
    // Duration in minutes (for breast/bottle sessions)
    durationMinutes: {
      type: Number,
      min: 0,
      default: null,
    },
    time: {
      type: Date,
      required: [true, 'Feeding time is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: [300, 'Notes too long'],
      default: '',
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
feedingLogSchema.index({ babyId: 1, time: -1 });

module.exports = mongoose.model('FeedingLog', feedingLogSchema);