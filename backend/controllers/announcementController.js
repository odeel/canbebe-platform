const Announcement = require('../models/Announcement');
const User = require('../models/User');

// ── GET /api/announcements ────────────────────────────────────────────────────
exports.getAnnouncements = async (req, res, next) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json({ success: true, announcements });
    } catch (err) {
        next(err);
    }
};

// ── POST /api/announcements ───────────────────────────────────────────────────
exports.createAnnouncement = async (req, res, next) => {
    try {
        const { title, body, type, target, schedule, pushNotification } = req.body;
        if (!title || !body) {
            return res.status(400).json({ success: false, error: 'Titre et message requis.' });
        }

        // Calculate reach based on target
        const targetArr = Array.isArray(target) ? target : [target || 'All Users'];
        let reach = 0;
        if (targetArr.includes('All Users')) {
            reach = await User.countDocuments({ isActive: true });
        } else {
            const roleMap = {
                'Mothers': 'mother',
                'Fathers': 'father',
                'Babysitters': 'babysitter',
                'Grandparents': 'grandparent',
            };
            const roles = targetArr.map(t => roleMap[t]).filter(Boolean);
            if (roles.length) {
                reach = await User.countDocuments({ role: { $in: roles }, isActive: true });
            }
        }

        const announcement = await Announcement.create({
            title,
            body,
            type: type || 'info',
            target: targetArr,
            reach,
            opened: 0,
            sentAt: schedule === 'now' ? new Date() : null,
            scheduledAt: schedule === 'later' ? new Date(Date.now() + 3600000) : null,
        });

        res.status(201).json({ success: true, announcement });
    } catch (err) {
        next(err);
    }
};

// ── DELETE /api/announcements/:id ─────────────────────────────────────────────
exports.deleteAnnouncement = async (req, res, next) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};