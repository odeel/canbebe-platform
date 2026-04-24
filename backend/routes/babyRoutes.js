const express = require('express');
const router = express.Router();
const { protect, canAccessBaby } = require('../middleware/Auth');
const { createBaby, getBabies, getBaby, updateBaby } = require('../controllers/babyController');

router.post('/', protect, createBaby);
router.get('/', protect, getBabies);
router.get('/:babyId', protect, canAccessBaby('view'), getBaby);
router.put('/:babyId', protect, canAccessBaby('edit'), updateBaby);

module.exports = router;