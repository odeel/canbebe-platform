const FeedingLog = require('../models/FeedingLog');
const SleepLog = require('../models/SleepLog');
const DiaperLog = require('../models/DiaperLog');

// ── helper: build date range filter ──────────────────────────────────────────
function dayRange(dateStr) {
  if (!dateStr) return {};
  const d = new Date(dateStr);
  const next = new Date(d); next.setDate(next.getDate() + 1);
  return { $gte: d, $lt: next };
}

// POST /api/logs/feeding
exports.addFeedingLog = async (req, res, next) => {
  try {
    const { babyId, type, quantity, durationMinutes, time, notes } = req.body;
    if (!babyId || !type)
      return res.status(400).json({ success: false, error: 'babyId and type required.' });

    const log = await FeedingLog.create({
      babyId,
      loggedBy: req.user._id,
      type,
      quantity: quantity ?? null,
      durationMinutes: durationMinutes ?? null,
      time: time ? new Date(time) : new Date(),
      notes: notes || '',
    });
    res.status(201).json({ success: true, log });
  } catch (err) { next(err); }
};

// POST /api/logs/sleep
exports.addSleepLog = async (req, res, next) => {
  try {
    const { babyId, startTime, endTime, quality, notes } = req.body;
    if (!babyId || !startTime)
      return res.status(400).json({ success: false, error: 'babyId and startTime required.' });

    const log = await SleepLog.create({
      babyId,
      loggedBy: req.user._id,
      startTime: new Date(startTime),
      endTime: endTime ? new Date(endTime) : null,
      quality: quality || 'average',
      notes: notes || '',
    });
    res.status(201).json({ success: true, log });
  } catch (err) { next(err); }
};

// POST /api/logs/diaper
exports.addDiaperLog = async (req, res, next) => {
  try {
    const { babyId, type, color, time, notes } = req.body;
    if (!babyId || !type)
      return res.status(400).json({ success: false, error: 'babyId and type required.' });

    const log = await DiaperLog.create({
      babyId,
      loggedBy: req.user._id,
      type,
      color: color || null,
      time: time ? new Date(time) : new Date(),
      notes: notes || '',
    });
    res.status(201).json({ success: true, log });
  } catch (err) { next(err); }
};

// GET /api/logs/:babyId?type=feeding|sleep|diaper&date=YYYY-MM-DD
exports.getLogs = async (req, res, next) => {
  try {
    const { babyId } = req.params;
    const { type, date } = req.query;
    const range = dayRange(date);

    const results = {};

    if (!type || type === 'feeding') {
      const filter = { babyId };
      if (range.$gte) filter.time = range;
      results.feeding = await FeedingLog.find(filter).sort({ time: -1 });
    }
    if (!type || type === 'sleep') {
      const filter = { babyId };
      if (range.$gte) filter.startTime = range;
      results.sleep = await SleepLog.find(filter).sort({ startTime: -1 });
    }
    if (!type || type === 'diaper') {
      const filter = { babyId };
      if (range.$gte) filter.time = range;
      results.diaper = await DiaperLog.find(filter).sort({ time: -1 });
    }

    const logs = type
      ? (results[type] || [])
      : [...(results.feeding || []), ...(results.sleep || []), ...(results.diaper || [])];

    res.json({ success: true, logs, ...results });
  } catch (err) { next(err); }
};