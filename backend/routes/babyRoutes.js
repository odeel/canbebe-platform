const express = require('express');
const router  = express.Router();
const { protect, canAccessBaby } = require('../middleware/Auth');
const {
    createBaby,
    getBabies,
    getBaby,
    updateBaby,
} = require('../controllers/babyController');

router.use(protect);

router.get('/',          getBabies);
router.post('/',         createBaby);
router.get('/:babyId',   canAccessBaby('view'), getBaby);
router.put('/:babyId',   canAccessBaby('edit'), updateBaby);

module.exports = router;