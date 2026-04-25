const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      trim: true,
      default: 'Anonymous',
    },
    stars: {
      type: Number,
      required: [true, 'Stars rating is required'],
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      maxlength: [1000, 'Review too long'],
    },
    product: {
      type: String,
      trim: true,
      default: 'App',
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

ratingSchema.index({ userId: 1 });
ratingSchema.index({ stars: 1 });

module.exports = mongoose.model('Rating', ratingSchema);