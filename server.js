const authenticateToken = require('./middleware/auth');
const User = require('./models/User');
const ProjectManager = require('./models/Projectmanager');
const Resource = require('./models/Resource');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Risk = require('./models/Risk');
const Issue = require('./models/Issue');
const Document = require('./models/Document');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

console.log('🔧 Starting PMO Tracker v3.0 Server...');

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pmo-tracker';
    console.log('🔌 Attempting to connect to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
  }
};

// Audit Log Helper
async function createAuditLog(userId, action, entityType, entityId, changes = {}) {
  try {
    const user = await User.findById(userId);
    await AuditLog.create({
      userId,
      userEmail: user?.email,
      userName: user?.name,
      userRole: user?.role,
      action,
      entityType,
      entityId,
      changes,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

// Health check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    version: '3.0.0',
    message: 'PMO Tracker v3.0 API is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ============ AUTHENTICATION ROUTES ============

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Team_Member',
      initials
    });

    await user.save();
    await createAuditLog(user._id, 'CREATE', 'User', user._id);
    
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();
    await createAuditLog(user._id, 'LOGIN', 'User', user._id);

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        initials: user.initials,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ USER MANAGEMENT ROUTES ============

app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'PMO') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'PMO') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, email, password, role, department, skills, capacity } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'Team_Member',
      department,
      skills: skills || [],
      capacity: capacity || 40,
      createdBy: req.user.id
    });

    await user.save();
    await createAuditLog(req.user.id, 'CREATE', 'User', user._id);
    
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'PMO') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const oldUser = await User.findById(req.params.id);
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    await createAuditLog(req.user.id, 'UPDATE', 'User', user._id, {
      before: oldUser,
      after: user
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'PMO') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await User.findByIdAndDelete(req.params.id);
    await createAuditLog(req.user.id, 'DELETE', 'User', req.params.id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ PROJECT MANAGER ROUTES ============

app.get('/api/pms', authenticateToken, async (req, res) => {
  try {
    const pms = await ProjectManager.find().populate('assignedProjects');
    res.json(pms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/pms', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'PMO') {
      return res.status(403).json({ message: 'Access denied. PMO role required.' });
    }

    const { name, email, phone } = req.body;
    
    const existingPM = await ProjectManager.findOne({ email });
    if (existingPM) {
      return res.status(400).json({ message: 'Project Manager already exists' });
    }

    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();

    const pm = new ProjectManager({
      name,
      email,
      phone,
      initials,
      createdBy: req.user.id
    });

    await pm.save();
    
    // Create login account for PM
    const hashedPassword = await bcrypt.hash('pm123', 10);
    
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'PM',
      initials,
      permissions: {
        canCreateProjects: true,
        canManageBudget: true,
        canManageRisks: true,
        canUploadDocuments: true
      }
    });
    
    res.status(201).json(pm);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/pms/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'PMO') {
      return res.status(403).json({ message: 'Access denied. PMO role required.' });
    }

    const pm = await ProjectManager.findById(req.params.id);
    if (!pm) {
      return res.status(404).json({ message: 'PM not found' });
    }

    // Delete PM's user account
    await User.deleteOne({ email: pm.email });
    
    // Delete PM record
    await ProjectManager.findByIdAndDelete(req.params.id);
    
    await createAuditLog(req.user.id, 'DELETE', 'User', req.params.id);
    
    res.json({ message: 'Project Manager deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ RESOURCE ROUTES (ENHANCED) ============

// Get resources based on role
app.get('/api/resources', authenticateToken, async (req, res) => {
  try {
    let resources;
    
    if (req.user.role === 'PMO') {
      // PMO sees all resources with project details
      resources = await Resource.find();
      
      // Enhance with project allocation info
      const enrichedResources = await Promise.all(resources.map(async (resource) => {
        const projects = await Project.find({
          'teamMembers.userId': resource._id
        }).select('name caseId pmId');
        
        return {
          ...resource.toObject(),
          assignedProjects: projects
        };
      }));
      
      res.json(enrichedResources);
    } else if (req.user.role === 'PM') {
      // PM sees resources in their projects + shared resources
      const pm = await ProjectManager.findOne({ email: req.user.email });
      const myProjects = await Project.find({ pmId: pm._id });
      
      const resourceIds = new Set();
      myProjects.forEach(project => {
        project.teamMembers.forEach(member => {
          resourceIds.add(member.userId.toString());
        });
      });
      
      resources = await Resource.find({
        _id: { $in: Array.from(resourceIds) }
      });
      
      // Check if resource is shared with other projects
      const enrichedResources = await Promise.all(resources.map(async (resource) => {
        const allProjects = await Project.find({
          'teamMembers.userId': resource._id
        }).select('name caseId pmId');
        
        const myProjectIds = myProjects.map(p => p._id.toString());
        const sharedProjects = allProjects.filter(p => 
          !myProjectIds.includes(p._id.toString())
        );
        
        return {
          ...resource.toObject(),
          myProjects: allProjects.filter(p => myProjectIds.includes(p._id.toString())),
          sharedProjects: sharedProjects,
          isShared: sharedProjects.length > 0
        };
      }));
      
      res.json(enrichedResources);
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/resources', authenticateToken, async (req, res) => {
  try {
    // Both PMO and PM can create resources
    if (!['PMO', 'PM'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const resource = new Resource({
      ...req.body,
      createdBy: req.user.id
    });
    
    await resource.save();
    await createAuditLog(req.user.id, 'CREATE', 'Resource', resource._id);
    
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ PROJECT ROUTES ============

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    if (!['PMO', 'PM'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not allowed to create project' });
    }

    if (req.user.role === 'PM') {
      const pm = await ProjectManager.findOne({ email: req.user.email });
      if (!pm) {
        return res.status(400).json({ message: 'PM profile not found' });
      }
      req.body.pmId = pm._id;
    }

    const projectCount = await Project.countDocuments();
    const caseId = `PRJ-2026-${String(projectCount + 1).padStart(3, '0')}`;

    const project = new Project({
      ...req.body,
      caseId,
      createdBy: req.user.id
    });

    await project.save();

    if (req.body.pmId) {
      await ProjectManager.findByIdAndUpdate(
        req.body.pmId,
        { $push: { assignedProjects: project._id } }
      );
    }

    await createAuditLog(req.user.id, 'CREATE', 'Project', project._id);

    const populatedProject = await Project.findById(project._id)
      .populate('pmId')
      .populate('teamMembers.userId');

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'PM') {
      const pm = await ProjectManager.findOne({ email: req.user.email });
      if (pm) {
        query._id = { $in: pm.assignedProjects };
      }
    }

    const projects = await Project.find(query)
      .populate('pmId')
      .populate('teamMembers.userId');

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('pmId')
      .populate('teamMembers.userId')
      .populate('milestones.assignedTo');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const oldProject = await Project.findById(req.params.id);
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now(), lastModifiedBy: req.user.id },
      { new: true }
    )
    .populate('pmId')
    .populate('teamMembers.userId');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await createAuditLog(req.user.id, 'UPDATE', 'Project', project._id, {
      before: oldProject,
      after: project
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'PMO') {
      return res.status(403).json({ message: 'Only PMO can delete projects' });
    }

    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await ProjectManager.findByIdAndUpdate(
      project.pmId,
      { $pull: { assignedProjects: project._id } }
    );

    await Project.findByIdAndDelete(req.params.id);
    await createAuditLog(req.user.id, 'DELETE', 'Project', req.params.id);
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ TASK ROUTES ============

app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const { projectId, assignedTo, status } = req.query;
    let query = {};
    
    if (projectId) query.projectId = projectId;
    if (assignedTo) query.assignedTo = assignedTo;
    if (status) query.status = status;
    
    // Filter by role
    if (req.user.role === 'PM') {
      const pm = await ProjectManager.findOne({ email: req.user.email });
      const myProjects = await Project.find({ pmId: pm._id }).select('_id');
      query.projectId = { $in: myProjects.map(p => p._id) };
    } else if (req.user.role === 'Team_Member') {
      query.assignedTo = req.user.id;
    }
    
    const tasks = await Task.find(query)
      .populate('projectId', 'name caseId')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    // Generate task ID
    const taskCount = await Task.countDocuments({ projectId: req.body.projectId });
    const taskId = `TSK-${String(taskCount + 1).padStart(4, '0')}`;
    
    const task = new Task({
      ...req.body,
      taskId,
      assignedBy: req.user.id,
      createdBy: req.user.id
    });
    
    await task.save();
    
    // Create notification for assigned user
    if (task.assignedTo) {
      await Notification.create({
        userId: task.assignedTo,
        type: 'Task_Assigned',
        title: 'New Task Assigned',
        message: `You have been assigned task: ${task.title}`,
        relatedProjectId: task.projectId,
        relatedTaskId: task._id,
        priority: task.priority === 'Critical' ? 'Urgent' : 'Medium'
      });
    }
    
    await createAuditLog(req.user.id, 'CREATE', 'Task', task._id);
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name caseId');
    
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    )
    .populate('assignedTo', 'name email')
    .populate('projectId', 'name caseId');
    
    await createAuditLog(req.user.id, 'UPDATE', 'Task', task._id);
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    await createAuditLog(req.user.id, 'DELETE', 'Task', req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get my tasks (for current user)
app.get('/api/tasks/my-tasks', authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate('projectId', 'name caseId')
      .populate('assignedBy', 'name')
      .sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ RISK ROUTES ============

app.get('/api/risks', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = projectId ? { projectId } : {};
    
    const risks = await Risk.find(query)
      .populate('projectId', 'name caseId')
      .populate('ownerId', 'name email')
      .sort({ riskScore: -1 });
    
    res.json(risks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/risks', authenticateToken, async (req, res) => {
  try {
    const riskCount = await Risk.countDocuments({ projectId: req.body.projectId });
    const riskId = `RISK-${String(riskCount + 1).padStart(3, '0')}`;
    
    const risk = new Risk({
      ...req.body,
      riskId,
      createdBy: req.user.id
    });
    
    await risk.save();
    
    // Update project risk summary
    const project = await Project.findById(req.body.projectId);
    if (project) {
      project.riskSummary.total++;
      if (risk.riskLevel === 'Critical') project.riskSummary.critical++;
      else if (risk.riskLevel === 'High') project.riskSummary.high++;
      else if (risk.riskLevel === 'Medium') project.riskSummary.medium++;
      else if (risk.riskLevel === 'Low') project.riskSummary.low++;
      await project.save();
    }
    
    await createAuditLog(req.user.id, 'CREATE', 'Risk', risk._id);
    
    const populatedRisk = await Risk.findById(risk._id)
      .populate('projectId', 'name caseId')
      .populate('ownerId', 'name email');
    
    res.status(201).json(populatedRisk);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/risks/:id', authenticateToken, async (req, res) => {
  try {
    const risk = await Risk.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    )
    .populate('projectId', 'name caseId')
    .populate('ownerId', 'name email');
    
    await createAuditLog(req.user.id, 'UPDATE', 'Risk', risk._id);
    
    res.json(risk);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/risks/:id', authenticateToken, async (req, res) => {
  try {
    await Risk.findByIdAndDelete(req.params.id);
    await createAuditLog(req.user.id, 'DELETE', 'Risk', req.params.id);
    res.json({ message: 'Risk deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ ISSUE ROUTES ============

app.get('/api/issues', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = projectId ? { projectId } : {};
    
    const issues = await Issue.find(query)
      .populate('projectId', 'name caseId')
      .populate('assignedTo', 'name email')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/issues', authenticateToken, async (req, res) => {
  try {
    const issueCount = await Issue.countDocuments({ projectId: req.body.projectId });
    const issueId = `ISS-${String(issueCount + 1).padStart(3, '0')}`;
    
    const issue = new Issue({
      ...req.body,
      issueId,
      reportedBy: req.user.id
    });
    
    await issue.save();
    await createAuditLog(req.user.id, 'CREATE', 'Issue', issue._id);
    
    const populatedIssue = await Issue.findById(issue._id)
      .populate('projectId', 'name caseId')
      .populate('assignedTo', 'name email');
    
    res.status(201).json(populatedIssue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/issues/:id', authenticateToken, async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    )
    .populate('projectId', 'name caseId')
    .populate('assignedTo', 'name email');
    
    await createAuditLog(req.user.id, 'UPDATE', 'Issue', issue._id);
    
    res.json(issue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ NOTIFICATION ROUTES ============

app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.get('/api/notifications/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      userId: req.user.id, 
      isRead: false 
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ DASHBOARD STATS ============

app.get('/api/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'PM') {
      const pm = await ProjectManager.findOne({ email: req.user.email });
      if (pm) {
        query._id = { $in: pm.assignedProjects };
      }
    }
    
    const total = await Project.countDocuments(query);
    const approved = await Project.countDocuments({ ...query, status: 'Completed' });
    const pending = await Project.countDocuments({ ...query, status: 'Planning' });
    const rejected = await Project.countDocuments({ ...query, status: 'Cancelled' });
    const actual = await Project.countDocuments({ ...query, status: 'In_Progress' });
    const breach = await Project.countDocuments({ ...query, health: 'At_Risk' });
    
    const tasks = await Task.countDocuments(
      req.user.role === 'Team_Member' ? { assignedTo: req.user.id } : {}
    );
    
    const myTasks = await Task.countDocuments({ 
      assignedTo: req.user.id, 
      status: { $in: ['To_Do', 'In_Progress'] } 
    });
    
    const risks = await Risk.countDocuments(
      req.user.role === 'PM' ? { projectId: { $in: query._id?.$in || [] } } : {}
    );

    res.json({
      total,
      approved,
      pending,
      rejected,
      actual,
      breach,
      tasks,
      myTasks,
      risks
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ SEED DATA ============

app.post('/api/seed', async (req, res) => {
  try {
    const existingPMO = await User.findOne({ role: 'PMO' });

    if (existingPMO) {
      return res.status(403).json({
        message: 'Database already initialized. Seeding is disabled.'
      });
    }

    console.log('🌱 Starting database seed...');

    await User.deleteMany({});
    await ProjectManager.deleteMany({});
    await Resource.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Risk.deleteMany({});

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = new User({
      name: 'PMO Admin',
      email: 'admin@pmo.com',
      password: hashedPassword,
      role: 'PMO',
      initials: 'PA',
      permissions: {
        canCreateProjects: true,
        canApproveProjects: true,
        canManageBudget: true,
        canViewAllProjects: true,
        canManageUsers: true,
        canManageRisks: true
      }
    });

    await adminUser.save();

    const pm1 = await ProjectManager.create({
      name: 'John Smith',
      email: 'john.smith@company.com',
      phone: '+1-234-567-8901',
      initials: 'JS',
      createdBy: adminUser._id
    });

    await User.create({
      name: 'John Smith',
      email: 'john.smith@company.com',
      password: await bcrypt.hash('pm123', 10),
      role: 'PM',
      initials: 'JS',
      permissions: {
        canCreateProjects: true,
        canManageBudget: true,
        canManageRisks: true
      }
    });

    // Create team members
    const teamMember1 = await User.create({
      name: 'Sarah Chen',
      email: 'sarah.chen@company.com',
      password: await bcrypt.hash('team123', 10),
      role: 'Team_Member',
      initials: 'SC',
      department: 'Development',
      skills: ['JavaScript', 'React', 'Node.js'],
      capacity: 40
    });

    await Resource.create([
      { name: 'Sarah Chen', role: 'Senior Developer', email: 'sarah.chen@company.com', plannedCapacity: 40 },
      { name: 'Marcus Johnson', role: 'Full Stack Developer', email: 'marcus.j@company.com', plannedCapacity: 40 }
    ]);

    const project1 = await Project.create({
      caseId: 'PRJ-2026-001',
      name: 'Customer Portal Redesign',
      pmId: pm1._id,
      status: 'In_Progress',
      health: 'On_Track',
      priority: 'High',
      type: 'Internal',
      branch: 'Technology',
      plannedStartDate: new Date('2026-01-01'),
      plannedEndDate: new Date('2026-04-30'),
      budget: {
        total: 25000000,
        allocated: 25000000,
        spent: 5000000,
        variance: -20000000
      },
      progress: 35,
      createdBy: adminUser._id
    });

    pm1.assignedProjects.push(project1._id);
    await pm1.save();

    // Create sample task
    await Task.create({
      projectId: project1._id,
      taskId: 'TSK-0001',
      title: 'Setup development environment',
      description: 'Configure local dev environment and CI/CD pipeline',
      assignedTo: teamMember1._id,
      assignedBy: adminUser._id,
      status: 'In_Progress',
      priority: 'High',
      dueDate: new Date('2026-02-15'),
      estimatedHours: 16,
      createdBy: adminUser._id
    });

    console.log('✅ Database seeded successfully!');

    res.json({
      message: 'Database seeded successfully',
      credentials: {
        pmo: { email: 'admin@pmo.com', password: 'admin123' },
        pm: { email: 'john.smith@company.com', password: 'pm123' },
        team: { email: 'sarah.chen@company.com', password: 'team123' }
      }
    });

  } catch (error) {
    console.error('❌ Seed error:', error);
    res.status(500).json({ message: 'Seed error', error: error.message });
  }
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.url });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 PMO Tracker v3.0 running on port', PORT);
    console.log('📊 Dashboard: http://localhost:' + PORT);
    console.log('💚 Health Check: http://localhost:' + PORT + '/health');
  });
};

startServer();
