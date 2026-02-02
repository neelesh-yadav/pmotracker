const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String, required: true },
  plannedCapacity: { type: Number, default: 40 },
  skills: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', ResourceSchema);
