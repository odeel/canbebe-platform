const mongoose = require('mongoose');

const diaperLogSchema = new mongoose.Schema(
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
      enum: ['wet', 'dirty', 'both', 'dry'],
      required: true,
    },
    // Color note (useful for health tracking)
    color: {
      type: String,
      enum: ['yellow', 'green', 'brown', 'black', 'red', 'white', 'other'],
      default: null,
    },
    time: {
      type: Date,
      required: [true, 'Diaper change time is required'],
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
diaperLogSchema.index({ babyId: 1, time: -1 });

module.exports = mongoose.model('DiaperLog', diaperLogSchema);