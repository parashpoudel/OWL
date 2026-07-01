const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const Conquest = require('../models/Conquest');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } });

// Create a new conquest (admin only)
router.post('/', auth, adminOnly, upload.array('images', 12), async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const uploadPromises = (req.files || []).map(file => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'past-conquests' }, (error, result) => {
          if (error) return reject(error);
          resolve({ url: result.secure_url, caption: '', public_id: result.public_id });
        });
        stream.end(file.buffer);
      });
    });

    const images = await Promise.all(uploadPromises);

    const conquest = new Conquest({
      title,
      images,
      author: req.userId
    });

    await conquest.save();

    res.json({ success: true, conquest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// List conquests (public)
router.get('/', async (req, res) => {
  try {
    const list = await Conquest.find({}, 'title images createdAt').sort({ createdAt: -1 }).lean();
    const summary = list.map(c => ({ _id: c._id, title: c.title, cover: c.images && c.images[0]?.url, count: c.images?.length || 0, createdAt: c.createdAt }));
    res.json({ success: true, conquests: summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get single conquest
router.get('/:id', async (req, res) => {
  try {
    const c = await Conquest.findById(req.params.id).lean();
    if (!c) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, conquest: c });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Delete conquest (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    const c = await Conquest.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Not found' });

    // Attempt to delete images from Cloudinary when public_id available
    const deletePromises = (c.images || []).map(img => {
      if (!img.public_id) return Promise.resolve();
      return new Promise((resolve) => {
        cloudinary.uploader.destroy(img.public_id, (err, result) => {
          // ignore individual errors but log
          if (err) console.error('Cloudinary destroy error:', err);
          resolve(result);
        });
      });
    });

    await Promise.all(deletePromises);

    await Conquest.deleteOne({ _id: c._id });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
