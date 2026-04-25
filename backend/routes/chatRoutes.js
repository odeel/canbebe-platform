const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const { protect } = require('../middleware/Auth');
const {
  sendMessage, getConversations, getMessages,
  getMemory, clearMemory, transcribeAudio, speak,
} = require('../controllers/chatController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/',                              protect, sendMessage);
router.get('/history',                        protect, getConversations);
router.get('/memory',                         protect, getMemory);
router.delete('/memory',                      protect, clearMemory);
router.get('/:conversationId/messages',       protect, getMessages);
router.post('/transcribe', protect, upload.single('audio'), transcribeAudio);
router.post('/speak',                         protect, speak);

module.exports = router;
