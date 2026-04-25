/**
 * Run this from your backend folder:
 *   node apply-fix.js
 *
 * It patches Post.js and postController.js in-place.
 */

const fs = require('fs');
const path = require('path');

// ─── 1. Patch models/Post.js ─────────────────────────────────────────────────
const postModelPath = path.join(__dirname, 'models', 'Post.js');
let postModel = fs.readFileSync(postModelPath, 'utf8');

// Fix 1a: remove strict tag enum → accept any string
postModel = postModel.replace(
  /\/\/ Searchable tags[\s\S]*?tags:\s*\{[\s\S]*?enum:\s*\[[\s\S]*?\],[\s\S]*?default:\s*\['general'\],\s*\},/,
  `// Searchable tags — accepts any string (English or French)
    tags: {
      type: [String],
      default: ['general'],
    },`
);

// Fix 1b: add 'admin' to authorRole enum if missing
if (!postModel.includes("'admin'")) {
  postModel = postModel.replace(
    "enum: ['mother', 'father', 'grandmother', 'babysitter', 'pregnant']",
    "enum: ['mother', 'father', 'grandmother', 'babysitter', 'pregnant', 'admin']"
  );
}

fs.writeFileSync(postModelPath, postModel, 'utf8');
console.log('✅ models/Post.js patched');

// ─── 2. Replace controllers/postController.js entirely ───────────────────────
const postControllerPath = path.join(__dirname, 'controllers', 'postController.js');

const newController = `const Post = require('../models/Post');

// GET /api/community
exports.getPosts = async (req, res, next) => {
  try {
    const { tag, search, status, page = 1, limit = 20 } = req.query;

    const filter = status === 'all' ? {} : { deleted: false };
    if (tag && tag !== 'All') filter.tags = { $regex: new RegExp('^' + tag + '$', 'i') };
    if (search) filter.$or = [{ content: { $regex: search, $options: 'i' } }];

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'firstName lastName role profileImage')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Post.countDocuments(filter),
    ]);

    res.json({ success: true, posts, total });
  } catch (err) { next(err); }
};

// POST /api/community
exports.createPost = async (req, res, next) => {
  try {
    const { content, tags, anonymous } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'content required.' });

    const VALID_ROLES = ['mother', 'father', 'grandmother', 'babysitter', 'pregnant', 'admin'];

    const post = await Post.create({
      author: req.user._id,
      authorRole: VALID_ROLES.includes(req.user.role) ? req.user.role : undefined,
      content,
      tags: (Array.isArray(tags) && tags.length) ? tags : ['general'],
    });

    await post.populate('author', 'firstName lastName role profileImage');
    const out = post.toJSON();
    out.anonymous = !!anonymous;
    res.status(201).json({ success: true, post: out });
  } catch (err) { next(err); }
};

// POST /api/community/:postId/comment
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, error: 'content required.' });

    const post = await Post.findById(req.params.postId);
    if (!post || post.deleted) return res.status(404).json({ success: false, error: 'Post not found.' });

    post.comments.push({ userId: req.user._id, content });
    await post.save();
    await post.populate('author', 'firstName lastName role');
    res.json({ success: true, post });
  } catch (err) { next(err); }
};

// PUT /api/community/:postId/like
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post || post.deleted) return res.status(404).json({ success: false, error: 'Post not found.' });

    const uid = req.user._id.toString();
    const idx = post.likes.findIndex(id => id.toString() === uid);
    if (idx === -1) post.likes.push(req.user._id);
    else post.likes.splice(idx, 1);

    await post.save();
    res.json({ success: true, liked: idx === -1, likes: post.likes.length });
  } catch (err) { next(err); }
};

// PUT /api/community/:postId/status  (admin)
exports.setPostStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });

    post.deleted = (status === 'removed');
    await post.save();
    res.json({ success: true, post });
  } catch (err) { next(err); }
};

// GET /api/community/admin  (admin)
exports.getAllPostsAdmin = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status === 'approved') filter.deleted = false;
    else if (status === 'removed') filter.deleted = true;
    if (search) filter.$or = [{ content: { $regex: search, $options: 'i' } }];

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'firstName lastName role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Post.countDocuments(filter),
    ]);

    const enriched = posts.map(p => {
      const obj = p.toJSON();
      obj.status = p.deleted ? 'removed' : 'approved';
      return obj;
    });

    res.json({ success: true, posts: enriched, total });
  } catch (err) { next(err); }
};

// DELETE /api/community/:postId  (admin — permanent delete)
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.postId);
    if (!post) return res.status(404).json({ success: false, error: 'Post not found.' });
    res.json({ success: true });
  } catch (err) { next(err); }
};
`;

fs.writeFileSync(postControllerPath, newController, 'utf8');
console.log('✅ controllers/postController.js replaced');
console.log('');
console.log('Now restart your server: npm start');
