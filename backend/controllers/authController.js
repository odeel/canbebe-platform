const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, language } = req.body;
    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ success: false, error: 'firstName, lastName, email and password are required.' });

    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ success: false, error: 'Email already in use.' });

    // pre-save hook hashes the password
    const user = await User.create({ firstName, lastName, email, password, role: role || 'mother', language: language || 'en' });
    res.status(201).json({ success: true, token: signToken(user._id), user: user.toJSON() });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password required.' });

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });

    if (!(await user.comparePassword(password)))
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });

    res.json({ success: true, token: signToken(user._id), user: user.toJSON() });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = (req, res) => res.json({ success: true, user: req.user });

// GET /api/auth/users  (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (search) filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, users, total });
  } catch (err) { next(err); }
};

// PUT /api/auth/users/:id/status  (admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

// DELETE /api/auth/users/:id  (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
};
// GET /api/auth/users  (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (search) filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const [users, total] = await Promise.all([
      User.find(filter)
        .populate('babies', 'name birthDate gender currentDiaperSize')  // ← add this
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, users, total });
  } catch (err) { next(err); }
};