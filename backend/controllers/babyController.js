const Baby = require('../models/Baby');
const Vaccination = require('../models/Vaccine'); // Vaccine.js = the per-baby schedule

// POST /api/baby
exports.createBaby = async (req, res, next) => {
  try {
    const { name, birthDate, gender, weight, height, feedingType } = req.body;
    if (!name || !birthDate)
      return res.status(400).json({ success: false, error: 'name and birthDate required.' });

    const baby = await Baby.create({
      owner: req.user._id,
      name, birthDate, gender, weight, height, feedingType,
    });

    // Create the vaccination schedule for this baby using the Algerian calendar
    await Vaccination.create({ babyId: baby._id });

    // Link baby to user
    req.user.babies.push(baby._id);
    await req.user.save();

    res.status(201).json({ success: true, baby });
  } catch (err) { next(err); }
};

// GET /api/baby  — list all babies for current user (owned + shared)
exports.getBabies = async (req, res, next) => {
  try {
    const owned = await Baby.find({ owner: req.user._id, isActive: true });
    const shared = await Baby.find({ 'sharedWith.userId': req.user._id, isActive: true });
    res.json({ success: true, babies: [...owned, ...shared] });
  } catch (err) { next(err); }
};

// GET /api/baby/:babyId
exports.getBaby = async (req, res, next) => {
  try {
    const baby = await Baby.findById(req.params.babyId);
    if (!baby || !baby.isActive)
      return res.status(404).json({ success: false, error: 'Baby not found.' });
    res.json({ success: true, baby });
  } catch (err) { next(err); }
};

// PUT /api/baby/:babyId
exports.updateBaby = async (req, res, next) => {
  try {
    const allowed = ['name', 'birthDate', 'gender', 'weight', 'height', 'feedingType', 'currentDiaperSize'];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const baby = await Baby.findByIdAndUpdate(req.params.babyId, update, { new: true, runValidators: true });
    if (!baby) return res.status(404).json({ success: false, error: 'Baby not found.' });
    res.json({ success: true, baby });
  } catch (err) { next(err); }
};