const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: String,
  userName: String,
  userRole: String,
  action: {
    type: String,
    enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['User', 'Project', 'Task', 'Risk', 'Issue', 'Document'],
    required: true
  },
  entityId: mongoose.Schema.Types.ObjectId,
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  description: String,
  ipAddress: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ entityType: 1, entityId: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);
