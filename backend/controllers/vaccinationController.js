const Vaccination = require('../models/Vaccine'); // Vaccine.js = per-baby schedule

// GET /api/vaccination/:babyId
exports.getVaccination = async (req, res, next) => {
  try {
    let record = await Vaccination.findOne({ babyId: req.params.babyId });

    // Create on first access if missing
    if (!record) {
      record = await Vaccination.create({ babyId: req.params.babyId });
    }

    res.json({
      success: true,
      vaccination: record,
      progress: record.progress,  // virtual: % complete
    });
  } catch (err) { next(err); }
};

// PUT /api/vaccination/:babyId  — mark a vaccine done/undone
exports.updateVaccine = async (req, res, next) => {
  try {
    const { vaccineName, done, doneDate, notes } = req.body;
    if (!vaccineName)
      return res.status(400).json({ success: false, error: 'vaccineName required.' });

    const record = await Vaccination.findOne({ babyId: req.params.babyId });
    if (!record)
      return res.status(404).json({ success: false, error: 'Vaccination record not found.' });

    const vaccine = record.vaccines.find(v => v.name === vaccineName);
    if (!vaccine)
      return res.status(404).json({ success: false, error: `Vaccine "${vaccineName}" not found.` });

    vaccine.done = !!done;
    vaccine.doneDate = done ? (doneDate ? new Date(doneDate) : new Date()) : null;
    if (notes !== undefined) vaccine.notes = notes;

    await record.save();
    res.json({ success: true, vaccination: record, progress: record.progress });
  } catch (err) { next(err); }
};

// GET /api/vaccination/:babyId/due  — vaccines due for baby's current age
exports.getDueVaccines = async (req, res, next) => {
  try {
    const Baby = require('../models/Baby');
    const baby = await Baby.findById(req.params.babyId);
    if (!baby) return res.status(404).json({ success: false, error: 'Baby not found.' });

    const record = await Vaccination.findOne({ babyId: req.params.babyId });
    if (!record) return res.json({ success: true, due: [] });

    const due = record.getDueVaccines(baby.ageInMonths);
    res.json({ success: true, due, ageInMonths: baby.ageInMonths });
  } catch (err) { next(err); }
};