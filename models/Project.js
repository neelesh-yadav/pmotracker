const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  caseId: String,
  name: String,
  pmId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectManager' },
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

  resources: [
    {
      resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
      allocation: Number,
      actualEffort: Number,
      role: String
    }
  ],

  createdBy: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
});

module.exports = mongoose.model('Project', ProjectSchema);
