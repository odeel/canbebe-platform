const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name too long'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // NEVER returned in queries by default
    },
    role: {
      type: String,
      enum: ['mother', 'father', 'grandmother', 'babysitter', 'pregnant'],
      default: 'mother',
    },
    // Babies this user owns (populated via Baby.owner)
    babies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Baby',
      },
    ],
    // Babies shared with this user by another family member
    sharedBabies: [
      {
        babyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Baby',
          required: true,
        },
        permissions: {
          type: [String],
          enum: ['view', 'edit', 'log'],
          default: ['view'],
        },
        sharedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    language: {
      type: String,
      enum: ['fr', 'ar', 'en'],
      default: 'fr',
    },
    pushToken: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// ── Instance methods ──────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// ── Static helpers ────────────────────────────────────────────────────────────
userSchema.statics.hashPassword = async function (plainPassword) {
  return bcrypt.hash(plainPassword, 12);
};

// Strip sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);