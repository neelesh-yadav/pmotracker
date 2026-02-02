const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Create Project
router.post('/', auth, async (req, res) => {
  const count = await Project.countDocuments();
  const year = new Date().getFullYear();

  const project = new Project({
    ...req.body,
    caseId: `PRJ-${year}-${String(count + 1).padStart(3, '0')}`
  });

  await project.save();
  res.json(project);
});

// Get All Projects
router.get('/', auth, async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
});

module.exports = router;

