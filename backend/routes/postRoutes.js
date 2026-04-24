const express = require("express");
const router = express.Router();

const {
  createPost,
  getPosts,
  addComment,
} = require("../controllers/postController");

router.post("/", createPost);
router.get("/", getPosts);
router.post("/:postId/comment", addComment);

module.exports = router;