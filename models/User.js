const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['PMO', 'PM', 'Team_Member', 'Stakeholder'], 
    default: 'Team_Member' 
  },
  initials: String,
  phone: String,
  department: String,
  skills: [String],
  capacity: { type: Number, default: 40 },
  availability: {
    type: String,
    enum: ['Available', 'Partially_Available', 'Unavailable'],
    default: 'Available'
  },
  permissions: {
    canCreateProjects: { type: Boolean, default: false },
    canApproveProjects: { type: Boolean, default: false },
    canManageBudget: { type: Boolean, default: false },
    canViewAllProjects: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canManageRisks: { type: Boolean, default: false },
    canUploadDocuments: { type: Boolean, default: true }
  },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true },
    deadlineReminders: { type: Boolean, default: true },
    statusUpdates: { type: Boolean, default: true }
  },
  forcePasswordReset: { type: Boolean, default: true },
  lastLogin: Date,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}, { timestamps: true });

UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, isActive: 1 });

UserSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.initials = this.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 3);
  }
  next();
});

module.exports = mongoose.model('User', UserSchema);
