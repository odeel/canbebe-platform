const mongoose = require('mongoose');

// ── BUG FIX: Vaccines are in a SEPARATE Vaccination collection.
// Do NOT embed them here. The original code duplicated vaccine data
// in both Baby and Vaccination — this causes desync bugs.
// Baby stores only profile data.

const babySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Baby must have an owner'],
    },
    name: {
      type: String,
      required: [true, 'Baby name is required'],
      trim: true,
      maxlength: [60, 'Name too long'],
    },
    birthDate: {
      type: Date,
      required: [true, 'Birth date is required'],
      validate: {
        validator: (v) => v <= new Date(),
        message: 'Birth date cannot be in the future',
      },
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'unknown'],
      default: 'unknown',
    },
    // Latest known weight/height — not a log (logs go in separate collections)
    weight: {
      type: Number,
      min: [0.5, 'Weight too low'],
      max: [30, 'Weight too high'],
    },
    height: {
      type: Number,
      min: [20, 'Height too low'],
      max: [120, 'Height too high'],
    },
    currentDiaperSize: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6],
      default: 1,
    },
    feedingType: {
      type: String,
      enum: ['breastfeeding', 'formula', 'mixed'],
      default: 'breastfeeding',
    },
    // Family members who can view/edit this baby's data
    sharedWith: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['father', 'grandmother', 'babysitter'],
        },
        permissions: {
          type: [String],
          enum: ['view', 'edit', 'log'],
          default: ['view'],
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ── Virtual: age in months (used everywhere in business logic) ────────────────
babySchema.virtual('ageInMonths').get(function () {
  const now = new Date();
  const birth = new Date(this.birthDate);
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  return Math.max(0, months);
});

// ── Indexes ───────────────────────────────────────────────────────────────────
babySchema.index({ owner: 1 });
babySchema.index({ 'sharedWith.userId': 1 });

// Include virtuals in JSON
babySchema.set('toJSON', { virtuals: true });
babySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Baby', babySchema);