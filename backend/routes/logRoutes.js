const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Auth');
const {
  addSleepLog,
  addFeedingLog,
  addDiaperLog,
  getLogs,
} = require('../controllers/logController');

router.get('/:babyId', protect, getLogs);
router.post('/sleep', protect, addSleepLog);
router.post('/feeding', protect, addFeedingLog);
router.post('/diaper', protect, addDiaperLog);

module.exports = router;