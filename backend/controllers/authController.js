const User = require("../models/User");

exports.register = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};