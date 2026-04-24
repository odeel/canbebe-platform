const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Auth');
const {
    getFAQ,
    getAllFAQAdmin,
    createFAQ,
    updateFAQ,
    deleteFAQ,
} = require('../controllers/faqController');

router.get('/', getFAQ);               // public
router.get('/admin', protect, getAllFAQAdmin); // admin
router.post('/', protect, createFAQ);     // admin
router.put('/:id', protect, updateFAQ);     // admin
router.delete('/:id', protect, deleteFAQ);     // admin

module.exports = router;