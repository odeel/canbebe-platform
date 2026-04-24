const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Auth');
const { getRatings, createRating, deleteRating } = require('../controllers/ratingController');

router.get('/', protect, getRatings);
router.post('/', protect, createRating);
router.delete('/:id', protect, deleteRating);

module.exports = router;