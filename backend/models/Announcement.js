const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        body: { type: String, required: true },
        type: {
            type: String,
            enum: ['info', 'feature', 'promo', 'health', 'maintenance'],
            default: 'info',
        },
        target: [{ type: String }],
        reach: { type: Number, default: 0 },
        opened: { type: Number, default: 0 },
        scheduledAt: { type: Date, default: null },
        sentAt: { type: Date, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);