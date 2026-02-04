const mongoose = require('mongoose');

const RiskSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  riskId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['Technical', 'Financial', 'Resource', 'Schedule', 'External', 'Operational'],
    required: true
  },
  probability: {
    type: String,
    enum: ['Very_Low', 'Low', 'Medium', 'High', 'Very_High'],
    required: true
  },
  impact: {
    type: String,
    enum: ['Very_Low', 'Low', 'Medium', 'High', 'Very_High'],
    required: true
  },
  riskScore: Number,
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
  status: {
    type: String,
    enum: ['Identified', 'Assessed', 'Mitigated', 'Accepted', 'Occurred'],
    default: 'Identified'
  },
  mitigationPlan: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  identifiedDate: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}, { timestamps: true });

RiskSchema.index({ projectId: 1, status: 1 });

RiskSchema.pre('save', function(next) {
  const probValues = { Very_Low: 1, Low: 2, Medium: 3, High: 4, Very_High: 5 };
  const impactValues = { Very_Low: 1, Low: 2, Medium: 3, High: 4, Very_High: 5 };
  this.riskScore = probValues[this.probability] * impactValues[this.impact];
  if (this.riskScore >= 20) this.riskLevel = 'Critical';
  else if (this.riskScore >= 12) this.riskLevel = 'High';
  else if (this.riskScore >= 6) this.riskLevel = 'Medium';
  else this.riskLevel = 'Low';
  next();
});

module.exports = mongoose.model('Risk', RiskSchema);
