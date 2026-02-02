const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  caseId: { type: String, unique: true },
  name: { type: String, required: true },
  pmId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectManager', required: true },
  status: String,
  health: String,
  priority: String,
  type: String,
  branch: String,
  startDate: Date,
  endDate: Date,
  budget: Number,
  spent: Number,
  progress: Number,
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Project', ProjectSchema);
