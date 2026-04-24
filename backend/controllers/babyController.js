const Baby = require("../models/Baby");

exports.createBaby = async (req, res, next) => {
  try {
    const baby = await Baby.create(req.body);
    res.json({ success: true, baby });
  } catch (err) {
    next(err);
  }
};

exports.getBaby = async (req, res, next) => {
  try {
    const baby = await Baby.findById(req.params.babyId);
    res.json({ success: true, baby });
  } catch (err) {
    next(err);
  }
};

exports.updateBaby = async (req, res, next) => {
  try {
    const baby = await Baby.findByIdAndUpdate(
      req.params.babyId,
      req.body,
      { new: true }
    );
    res.json({ success: true, baby });
  } catch (err) {
    next(err);
  }
};