const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment too long'],
    },
    // Soft-delete for moderation
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Denormalized role for faster display (matches User.role)
    authorRole: {
      type: String,
      enum: ['mother', 'father', 'grandmother', 'babysitter', 'pregnant', 'admin'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      maxlength: [3000, 'Post too long'],
    },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], required: true },
      },
    ],
    // Array of userIds who liked
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
    // Searchable tags — accepts English or French values
    tags: {
      type: [String],
      default: ['general'],
    },
    // Whether the author chose to post anonymously
    anonymous: {
      type: Boolean,
      default: false,
    },
    // Soft-delete
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ── Virtual: like count ───────────────────────────────────────────────────────
postSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

// ── Indexes ───────────────────────────────────────────────────────────────────
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ author: 1 });

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Post', postSchema);