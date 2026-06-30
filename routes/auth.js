const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Blog = require('../models/Blog');
const { auth, adminOnly } = require('../middleware/auth');
const { sendCredentialsEmail } = require('../utils/email');

const router = express.Router();

// Register - requires admin, but allows initial admin bootstrap when no admin exists
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;

    const existingAdmin = await User.exists({ isAdmin: true });

    if (existingAdmin) {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.isAdmin) {
          return res.status(403).json({ error: 'Admin access only' });
        }
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      if (!isAdmin) {
        return res.status(400).json({ error: 'The first user must be an admin' });
      }
    }

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    user = new User({
      username,
      email,
      password,
      isAdmin: Boolean(isAdmin)
    });

    await user.save();

    const emailResult = await sendCredentialsEmail(email, username, password);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      emailSent: emailResult.success,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
console.log("Login request");
console.log("MongoDB state:", require('mongoose').connection.readyState);

const mongoose = require('mongoose');

console.log('Mongo readyState:', mongoose.connection.readyState);

if (mongoose.connection.readyState !== 1) {
  return res.status(503).json({
    error: 'Database is not connected',
    state: mongoose.connection.readyState
  });
}
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users and recent posts (admin only)
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const recentPosts = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('author', 'username email');

    res.json({
      users,
      recentPosts,
      userCount: users.length,
      postCount: await Blog.countDocuments()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (admin only)
router.delete('/user/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
