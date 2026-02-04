const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  fileName: { type: String, required: true },
  originalFileName: String,
  fileUrl: String,
  fileSize: Number,
  mimeType: String,
  category: {
    type: String,
    enum: ['Charter', 'Plan', 'Report', 'Contract', 'Specification', 'Design', 'Other'],
    required: true
  },
  tags: [String],
  description: String,
  version: { type: Number, default: 1 },
  isLatest: { type: Boolean, default: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
  downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

DocumentSchema.index({ projectId: 1, category: 1 });

module.exports = mongoose.model('Document', DocumentSchema);
