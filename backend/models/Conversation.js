const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Optional: conversation may be about a specific baby
    babyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Baby',
      default: null,
    },
    // Rolling AI-generated summary — updated every 10 messages
    summary: {
      type: String,
      default: '',
      maxlength: [2000, 'Summary too long'],
    },
    // Total messages exchanged — used to trigger auto-summary
    messageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    // Conversation title (auto-generated from first message)
    title: {
      type: String,
      default: 'Nouvelle conversation',
      maxlength: [120, 'Title too long'],
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
conversationSchema.index({ userId: 1, lastMessageAt: -1 });
conversationSchema.index({ babyId: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);