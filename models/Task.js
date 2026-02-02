const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  name: String,
  projectId: String,
  resource: String,
  plannedStart: Date,
  plannedEnd: Date,
  actualHours: Number,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);

