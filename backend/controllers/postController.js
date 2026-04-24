const Post = require("../models/Post");

exports.createPost = async (req, res, next) => {
  try {
    const post = await Post.create(req.body);
    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (err) {
    next(err);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);

    post.comments.push(req.body);

    await post.save();

    res.json({ success: true, post });
  } catch (err) {
    next(err);
  }
};