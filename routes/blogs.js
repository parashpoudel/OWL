const express = require('express');
const Blog = require('../models/Blog');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Create blog post
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, content, images, tags } = req.body;

    const blog = new Blog({
      title,
      description,
      content,
      author: req.userId,
      authorName: req.body.authorName,
      images: images || [],
      tags: tags || []
    });

    await blog.save();
    await blog.populate('author', 'username email');

    res.status(201).json({
      success: true,
      message: 'Blog post created',
      blog
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 });

    res.json({ blogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username email')
      .populate('comments.user', 'username');

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update blog (author only)
router.put('/:id', auth, async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('author', 'username email');

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete blog (author or admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.author.toString() !== req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like blog
router.post('/:id/like', auth, async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (blog.likes.includes(req.userId)) {
      blog.likes = blog.likes.filter(id => id.toString() !== req.userId);
    } else {
      blog.likes.push(req.userId);
    }

    await blog.save();
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text, username } = req.body;

    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    blog.comments.push({
      user: req.userId,
      username: username,
      text: text
    });

    await blog.save();
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
