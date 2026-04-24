const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Auth');
const {
    register,
    login,
    getMe,
    getAllUsers,
    toggleUserStatus,
    deleteUser,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Admin-only user management
router.get('/users', protect, getAllUsers);
router.put('/users/:id/status', protect, toggleUserStatus);
router.delete('/users/:id', protect, deleteUser);

module.exports = router;