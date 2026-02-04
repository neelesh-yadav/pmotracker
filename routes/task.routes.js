const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');

// --------------------
// CREATE TASK (PM)
// --------------------
router.post('/', authMiddleware, async (req, res) => {
  try {
    const task = new Task({
      projectId: req.body.projectId,
      resourceId: req.body.resourceId,
      pmId: req.user.id,
      date: req.body.date,
      plannedTask: req.body.plannedTask,
      actualTask: req.body.actualTask,
      status: req.body.status
    });

    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task' });
  }
});

// --------------------
// GET TASKS (PM / PMO)
// --------------------
router.get('/', authMiddleware, async (req, res) => {
  try {
    let query = {};

    // PM sees only their tasks
    if (req.user.role === 'PM') {
      query.pmId = req.user.id;
    }

    // Optional project filter
    if (req.query.projectId) {
      query.projectId = req.query.projectId;
    }

    const tasks = await Task.find(query)
      .populate('projectId')
      .populate('resourceId');

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

module.exports = router;

