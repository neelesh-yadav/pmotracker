const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  name: String,
  weeklyCapacity: Number,
  allocatedHours: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resource', ResourceSchema);

