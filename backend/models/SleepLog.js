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
      default: Date.now,
    },
    endTime: {
      type: Date,
      default: null,
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

sleepLogSchema.index({ babyId: 1, startTime: -1 });

module.exports = mongoose.model('SleepLog', sleepLogSchema);