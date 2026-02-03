const mongoose = require('mongoose');

const ProjectManagerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  initials: String,
  assignedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ProjectManager', ProjectManagerSchema);
