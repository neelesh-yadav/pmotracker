const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  caseId: String,
  name: String,
  pm: String,
  priority: String,
  type: String,
  branch: String,
  budgetCrores: Number,
  startDate: Date,
  endDate: Date,
  status: {
    type: String,
    default: 'Pending'
  },
  plannedProgress: { type: Number, default: 0 },
  actualProgress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
