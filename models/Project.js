const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: String,
  pmId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  resources: [
    {
      resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: String,
      allocation: Number
    }
  ],
  
  status: { 
    type: String, 
    enum: ['Draft', 'Planning', 'In_Progress', 'On_Hold', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  currentPhase: {
    type: String,
    enum: ['Initiation', 'Planning', 'Execution', 'Monitoring', 'Closure'],
    default: 'Initiation'
  },
  health: { 
    type: String, 
    enum: ['On_Track', 'At_Risk', 'Critical', 'Completed'],
    default: 'On_Track'
  },
  priority: { 
    type: String, 
    enum: ['Critical', 'High', 'Medium', 'Low'],
    default: 'Medium'
  },
  type: { 
    type: String, 
    enum: ['Internal', 'External', 'Strategic', 'Operational'],
    default: 'Internal'
  },
  branch: String,
  
  plannedStartDate: Date,
  plannedEndDate: Date,
  actualStartDate: Date,
  actualEndDate: Date,
  
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completedMilestones: { type: Number, default: 0 },
  totalMilestones: { type: Number, default: 0 },
  
  budget: {
    total: { type: Number, default: 0 },
    allocated: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    variance: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  
  teamMembers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    allocation: Number,
    startDate: Date,
    endDate: Date,
    actualEffort: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  }],
  
  milestones: [{
    name: { type: String, required: true },
    description: String,
    dueDate: { type: Date, required: true },
    completedDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'In_Progress', 'Completed', 'Delayed'],
      default: 'Pending'
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  
  riskSummary: {
    total: { type: Number, default: 0 },
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 }
  },
  
  issueSummary: {
    total: { type: Number, default: 0 },
    open: { type: Number, default: 0 },
    resolved: { type: Number, default: 0 }
  },
  
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}, { timestamps: true });

ProjectSchema.index({ caseId: 1 });
ProjectSchema.index({ status: 1, health: 1 });
ProjectSchema.index({ pmId: 1 });

ProjectSchema.pre('save', function(next) {
  if (this.budget.total > 0) {
    this.budget.variance = this.budget.spent - this.budget.allocated;
  }
  this.totalMilestones = this.milestones.length;
  this.completedMilestones = this.milestones.filter(m => m.status === 'Completed').length;
  next();
});

module.exports = mongoose.model('Project', ProjectSchema);
