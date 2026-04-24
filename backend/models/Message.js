const mongoose = require('mongoose');

// Recognized intents — used for analytics and routing
const INTENTS = [
  'sleep',
  'feeding',
  'diaper',
  'vaccine',
  'health',
  'emotion',
  'milestone',
  'product',
  'community',
  'general',
];

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [8000, 'Message too long'],
      trim: true,
    },
    // Detected topic/intent (set by AI pipeline)
    intent: {
      type: String,
      enum: INTENTS,
      default: 'general',
    },
    // Set to true when AI detected a potentially medical concern
    // Triggers "Ce sujet mérite un avis médical 🩺" injection
    flaggedMedical: {
      type: Boolean,
      default: false,
    },
    // Soft-delete: keep message for context but hide from UI
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Compound index: fetch messages for a conversation in order
messageSchema.index({ conversationId: 1, createdAt: 1 });
// Medical flag index — for compliance reporting
messageSchema.index({ flaggedMedical: 1 });

module.exports = mongoose.model('Message', messageSchema);
module.exports.INTENTS = INTENTS;