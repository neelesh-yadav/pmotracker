const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['Task_Assigned', 'Deadline_Reminder', 'Status_Update', 'Risk_Alert', 
           'Issue_Escalated', 'Approval_Request'],
    required: true
  },
  title: { type: String, required: true },
  message: String,
  relatedProjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  relatedTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  isRead: { type: Boolean, default: false },
  readAt: Date,
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
