exports.addSleepLog = async (req, res) => {
  res.json({ success: true, message: "Sleep log added" });
};

exports.addFeedingLog = async (req, res) => {
  res.json({ success: true, message: "Feeding log added" });
};

exports.addDiaperLog = async (req, res) => {
  res.json({ success: true, message: "Diaper log added" });
};