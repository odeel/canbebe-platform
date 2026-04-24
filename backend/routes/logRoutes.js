const express = require("express");
const router = express.Router();

const {
  addSleepLog,
  addFeedingLog,
  addDiaperLog,
} = require("../controllers/logController");

router.post("/sleep", addSleepLog);
router.post("/feeding", addFeedingLog);
router.post("/diaper", addDiaperLog);

module.exports = router;