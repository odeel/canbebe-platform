const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── Verify JWT and attach user to request ─────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Accès refusé. Token manquant.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur introuvable ou désactivé.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Token invalide.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expiré.' });
    }
    next(err);
  }
};

// ── Check that user can access a baby (owner OR shared) ───────────────────────
const canAccessBaby = (permissionRequired = 'view') => async (req, res, next) => {
  try {
    const Baby = require('../models/Baby');
    const babyId = req.params.babyId || req.body.babyId;

    if (!babyId) {
      return res.status(400).json({ success: false, error: 'babyId requis.' });
    }

    const baby = await Baby.findById(babyId);
    if (!baby || !baby.isActive) {
      return res.status(404).json({ success: false, error: 'Bébé introuvable.' });
    }

    const userId = req.user._id.toString();
    const isOwner = baby.owner.toString() === userId;

    if (isOwner) {
      req.baby = baby;
      return next();
    }

    // Check shared access
    const shared = baby.sharedWith.find(
      (s) => s.userId.toString() === userId
    );

    if (!shared) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé à ce bébé.',
      });
    }

    if (
      permissionRequired !== 'view' &&
      !shared.permissions.includes(permissionRequired)
    ) {
      return res.status(403).json({
        success: false,
        error: `Permission '${permissionRequired}' requise.`,
      });
    }

    req.baby = baby;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect, canAccessBaby };