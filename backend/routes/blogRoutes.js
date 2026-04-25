const express = require('express');
const router  = express.Router();
const { getBlogs } = require('../controllers/blogController');

router.get('/', getBlogs);

module.exports = router;