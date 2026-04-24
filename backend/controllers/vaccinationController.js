const Vaccination = require("../models/Vaccination");
const { calculateVaccinationProgress } = require("../utils/progress");

exports.getVaccination = async (req, res, next) => {
  try {
    const vaccination = await Vaccination.findOne({
      babyId: req.params.babyId,
    });

    const progress = calculateVaccinationProgress(vaccination.vaccines);

    res.json({ success: true, vaccination, progress });
  } catch (err) {
    next(err);
  }
};

exports.updateVaccine = async (req, res, next) => {
  try {
    const { vaccineName, done } = req.body;

    const vaccination = await Vaccination.findOne({
      babyId: req.params.babyId,
    });

    const vaccine = vaccination.vaccines.find(
      (v) => v.name === vaccineName
    );

    if (vaccine) {
      vaccine.done = done;
      vaccine.doneDate = done ? new Date() : null;
    }

    await vaccination.save();

    res.json({ success: true, vaccination });
  } catch (err) {
    next(err);
  }
};