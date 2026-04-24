const express = require('express');
const router = express.Router();
const { protect, canAccessBaby } = require('../middleware/Auth');
const { getVaccination, updateVaccine, getDueVaccines } = require('../controllers/vaccinationController');

router.get('/:babyId', protect, canAccessBaby('view'), getVaccination);
router.get('/:babyId/due', protect, canAccessBaby('view'), getDueVaccines);
router.put('/:babyId', protect, canAccessBaby('log'), updateVaccine);

module.exports = router;