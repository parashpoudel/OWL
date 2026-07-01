const mongoose = require('mongoose');

const conquestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  images: [{
    url: String,
    caption: String,
    public_id: String
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Conquest', conquestSchema);
