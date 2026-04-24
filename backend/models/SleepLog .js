const mongoose = require('mongoose');

const sleepLogSchema = new mongoose.Schema(
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
    startTime: {
      type: Date,
      required: [true, 'Sleep start time is required'],
    },
    // endTime null means baby is currently sleeping
    endTime: {
      type: Date,
      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true; // null is valid (ongoing)
          return v > this.startTime;
        },
        message: 'End time must be after start time',
      },
    },
    quality: {
      type: String,
      enum: ['good', 'average', 'poor'],
      default: 'average',
    },
    notes: {
      type: String,
      maxlength: [300, 'Notes too long'],
      default: '',
    },
  },
  { timestamps: true }
);

// ── Virtual: duration in minutes ─────────────────────────────────────────────
sleepLogSchema.virtual('durationMinutes').get(function () {
  if (!this.endTime) return null;
  return Math.round((this.endTime - this.startTime) / 60000);
});

// ── Indexes ───────────────────────────────────────────────────────────────────
sleepLogSchema.index({ babyId: 1, startTime: -1 });

sleepLogSchema.set('toJSON', { virtuals: true });
sleepLogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SleepLog', sleepLogSchema);