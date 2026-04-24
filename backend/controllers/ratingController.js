const Rating = require('../models/Rating');

// ── GET /api/ratings ──────────────────────────────────────────────────────────
exports.getRatings = async (req, res, next) => {
    try {
        const { search } = req.query;
        const filter = {};
        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { review: { $regex: search, $options: 'i' } },
                { product: { $regex: search, $options: 'i' } },
            ];
        }

        const ratings = await Rating.find(filter).sort({ createdAt: -1 });

        // Build breakdown
        const breakdown = [5, 4, 3, 2, 1].map(s => ({
            stars: s,
            count: ratings.filter(r => r.stars === s).length,
        }));

        const avg =
            ratings.length
                ? (ratings.reduce((acc, r) => acc + r.stars, 0) / ratings.length).toFixed(1)
                : 0;

        res.json({ success: true, ratings, breakdown, avg, total: ratings.length });
    } catch (err) {
        next(err);
    }
};

// ── POST /api/ratings ─────────────────────────────────────────────────────────
exports.createRating = async (req, res, next) => {
    try {
        const { stars, review, product } = req.body;
        if (!stars || !review) {
            return res.status(400).json({ success: false, error: 'Étoiles et avis requis.' });
        }

        const rating = await Rating.create({
            userId: req.user._id,
            userName: req.user.name,
            userAvatar: req.user.name[0].toUpperCase(),
            stars: Number(stars),
            review,
            product: product || 'App',
        });

        res.status(201).json({ success: true, rating });
    } catch (err) {
        next(err);
    }
};

// ── DELETE /api/ratings/:id ───────────────────────────────────────────────────
exports.deleteRating = async (req, res, next) => {
    try {
        await Rating.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};