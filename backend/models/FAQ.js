const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
    {
        question: { type: String, required: true, trim: true },
        answer: { type: String, required: true },
        category: {
            type: String,
            enum: ['app', 'feeding', 'sleep', 'vaccines', 'ai'],
            default: 'app',
        },
        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('FAQ', faqSchema);