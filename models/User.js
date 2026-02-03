const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['PMO', 'PM', 'Team', 'Stakeholder'], default: 'PM' },
  initials: String,
  phone: String,
  forcePasswordReset: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
