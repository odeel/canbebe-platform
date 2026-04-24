const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Auth');
const {
    getAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
} = require('../controllers/announcementController');

router.get('/', protect, getAnnouncements);
router.post('/', protect, createAnnouncement);
router.delete('/:id', protect, deleteAnnouncement);

module.exports = router;