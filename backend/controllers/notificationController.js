const Notification = require('../models/Notification');

// GET /api/notifications  — current user's notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, page = 1, limit = 30 } = req.query;
    const filter = { userId: req.user._id };
    if (unreadOnly === 'true') filter.read = false;

    const notifications = await Notification.find(filter)
      .sort({ scheduledAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
    res.json({ success: true, notifications, unreadCount });
  } catch (err) { next(err); }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true }
    );
    res.json({ success: true });
  } catch (err) { next(err); }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) { next(err); }
};

// Internal helper — called by other services to create notifications
// Not exposed as a route but exported for use in vaccination/baby controllers
exports.createNotification = async ({ userId, babyId, type, title, message, scheduledAt, dedupKey }) => {
  try {
    await Notification.create({ userId, babyId, type, title, message, scheduledAt: scheduledAt || new Date(), dedupKey });
  } catch (err) {
    // Silently ignore duplicate-key errors (dedupKey unique index)
    if (err.code !== 11000) throw err;
  }
};