const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  taskId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  status: {
    type: String,
    enum: ['To_Do', 'In_Progress', 'In_Review', 'Blocked', 'Completed', 'Cancelled'],
    default: 'To_Do'
  },
  priority: {
    type: String,
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  
  startDate: Date,
  dueDate: Date,
  completedDate: Date,
  estimatedHours: Number,
  actualHours: { type: Number, default: 0 },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  
  tags: [String],
  
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}, { timestamps: true });

TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Task', TaskSchema);
