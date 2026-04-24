const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        userName: { type: String, default: 'Anonymous' },
        userAvatar: { type: String, default: 'U' },
        stars: { type: Number, min: 1, max: 5, required: true },
        review: { type: String, required: true },
        product: { type: String, default: 'App' },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Rating', ratingSchema);