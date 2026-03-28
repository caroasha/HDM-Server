const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  title: { type: String },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  category: { type: String, default: 'general' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', photoSchema);