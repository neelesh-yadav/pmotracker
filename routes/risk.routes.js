const express = require('express');
const router = express.Router();
const Risk = require('../models/Risk');
const authMiddleware = require('../middleware/auth');

// ➕ Create Risk (PM only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const risk = new Risk({
      projectId: req.body.projectId,
      description: req.body.description,
      impact: req.body.impact,
      mitigation: req.body.mitigation,
      createdBy: req.user.id
    });

    await risk.save();
    res.status(201).json(risk);
  } catch (error) {
    res.status(500).json({ message: 'Error creating risk' });
  }
});

// 📄 Get Risks
router.get('/', authMiddleware, async (req, res) => {
  try {
    let risks;

    if (req.user.role === 'PMO') {
      // PMO sees all risks
      risks = await Risk.find()
        .populate('projectId');
    } else {
      // PM sees only own project risks
      risks = await Risk.find({ createdBy: req.user.id })
        .populate('projectId');
    }

    res.json(risks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching risks' });
  }
});

module.exports = router;
