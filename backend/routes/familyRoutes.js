const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/Auth');
const {
    searchUsers,
    addCaretaker,
    removeCaretaker,
    getMyCaretakers,
} = require('../controllers/familyController');

// All routes require authentication
router.use(protect);

router.get('/search',        searchUsers);      // GET  /api/family/search?q=&role=
router.get('/my',            getMyCaretakers);  // GET  /api/family/my
router.post('/add',          addCaretaker);     // POST /api/family/add
router.delete('/remove/:userId', removeCaretaker); // DELETE /api/family/remove/:userId

module.exports = router;
