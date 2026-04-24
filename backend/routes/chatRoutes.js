const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Auth');
const { sendMessage, getConversations, getMessages } = require('../controllers/chatController');

router.post('/', protect, sendMessage);
router.get('/history', protect, getConversations);
router.get('/:conversationId/messages', protect, getMessages);

module.exports = router;