const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/Auth');
const { getPosts, createPost, addComment, toggleLike, setPostStatus, getAllPostsAdmin, deletePost, } = require('../controllers/postController');

router.get('/', getPosts);          // public feed (approved only)
router.get('/admin', protect, getAllPostsAdmin);  // admin: all posts
router.post('/', protect, createPost);
router.post('/:postId/comment', protect, addComment);
router.put('/:postId/like', protect, toggleLike);
router.put('/:postId/status', protect, setPostStatus);   // admin
router.delete('/:postId', protect, deletePost);
module.exports = router;