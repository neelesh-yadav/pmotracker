const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  issueId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['Technical', 'Resource', 'Scope', 'Schedule', 'Quality', 'Other']
  },
  severity: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true },
  priority: { type: String, enum: ['Urgent', 'High', 'Medium', 'Low'], required: true },
  status: { type: String, enum: ['Open', 'In_Progress', 'Resolved', 'Closed'], default: 'Open' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolution: String,
  resolutionDate: Date,
  reportedDate: { type: Date, default: Date.now },
  dueDate: Date,
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}, { timestamps: true });

IssueSchema.index({ projectId: 1, status: 1 });

module.exports = mongoose.model('Issue', IssueSchema);
