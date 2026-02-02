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

console.log('🔧 Starting PMO Tracker Server...');
console.log('📂 Serving static files from public/ directory');

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
    console.error('💡 Check your MONGODB_URI environment variable');
  }
};

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    message: 'PMO Tracker API is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  console.log('📄 Serving login.html');
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
      role: role || 'PM',
      initials
    });

    await user.save();
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
        initials: user.initials
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
    
    // ALSO create login account for PM
    const hashedPassword = await bcrypt.hash('pm123', 10);
    
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'PM',
      initials
    });
    res.status(201).json(pm);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.put('/api/pms/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'PMO') {
      return res.status(403).json({ message: 'Access denied. PMO role required.' });
    }

    const pm = await ProjectManager.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!pm) {
      return res.status(404).json({ message: 'Project Manager not found' });
    }

    res.json(pm);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/pms/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'PMO') {
      return res.status(403).json({ message: 'Access denied. PMO role required.' });
    }

    await ProjectManager.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project Manager deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ RESOURCE ROUTES ============

app.get('/api/resources', authenticateToken, async (req, res) => {
  try {
    const resources = await Resource.find();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/resources', authenticateToken, async (req, res) => {
  try {
    const resource = new Resource(req.body);
    await resource.save();
    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ PROJECT ROUTES ============

app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    // ✅ Only PMO and PM can create projects
    if (!['PMO', 'PM'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Not allowed to create project' });
    }

    // ✅ If PM is creating project, auto-assign project to them
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
      createdBy: req.user.email
    });

    await project.save();

    await ProjectManager.findByIdAndUpdate(
      req.body.pmId,
      { $push: { assignedProjects: project._id } }
    );

    const populatedProject = await Project.findById(project._id)
      .populate('pmId')
      .populate('resources.resourceId');

    res.status(201).json(populatedProject);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ GET ALL PROJECTS (FOR DASHBOARD)
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    let query = {};

    // PM sees only own projects
    if (req.user.role === 'PM') {
      const pm = await ProjectManager.findOne({ email: req.user.email });
      if (pm) {
        query._id = { $in: pm.assignedProjects };
      }
    }

    const projects = await Project.find(query)
      .populate('pmId')
      .populate('resources.resourceId');

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



app.get('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('pmId')
      .populate('resources.resourceId')
      .populate('dependencies.upstreamId');
    
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
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    )
    .populate('pmId')
    .populate('resources.resourceId');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await ProjectManager.findByIdAndUpdate(
      project.pmId,
      { $pull: { assignedProjects: project._id } }
    );

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ DASHBOARD STATS ============

app.get('/api/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    const total = await Project.countDocuments();
    const approved = await Project.countDocuments({ status: 'Completed' });
    const pending = await Project.countDocuments({ status: 'Planning' });
    const rejected = await Project.countDocuments({ status: 'Cancelled' });
    const actual = await Project.countDocuments({ status: 'In Progress' });
    const breach = await Project.countDocuments({ health: 'At Risk' });

    res.json({
      total,
      approved,
      pending,
      rejected,
      actual,
      breach
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============ SEED DATA ============

app.post('/api/seed', async (req, res) => {
  try {
    // ✅ Check if PMO already exists
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

    console.log('📝 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = new User({
      name: 'Neelesh Yadav',
      email: 'admin@pmo.com',
      password: hashedPassword,
      role: 'PMO',
      initials: 'NY'
    });

    await adminUser.save();

    console.log('👥 Creating project managers...');
    const pm1 = await ProjectManager.create({
      name: 'John Smith',
      email: 'john.smith@company.com',
      phone: '+1-234-567-8901',
      initials: 'JS',
      createdBy: adminUser._id
    });

    const pm2 = await ProjectManager.create({
      name: 'Jane Doe',
      email: 'jane.doe@company.com',
      phone: '+1-234-567-8902',
      initials: 'JD',
      createdBy: adminUser._id
    });

    const pm3 = await ProjectManager.create({
      name: 'Robert Lee',
      email: 'robert.lee@company.com',
      phone: '+1-234-567-8903',
      initials: 'RL',
      createdBy: adminUser._id
    });

    console.log('💼 Creating resources...');
    await Resource.create([
      { name: 'Sarah Chen', role: 'Senior Developer', email: 'sarah.chen@company.com', plannedCapacity: 40 },
      { name: 'Marcus Johnson', role: 'Full Stack Developer', email: 'marcus.j@company.com', plannedCapacity: 40 },
      { name: 'Priya Sharma', role: 'UI/UX Designer', email: 'priya.sharma@company.com', plannedCapacity: 40 },
      { name: 'David Kim', role: 'DevOps Engineer', email: 'david.kim@company.com', plannedCapacity: 40 },
      { name: 'Emma Rodriguez', role: 'QA Engineer', email: 'emma.r@company.com', plannedCapacity: 40 },
      { name: 'James Anderson', role: 'Backend Developer', email: 'james.a@company.com', plannedCapacity: 40 }
    ]);

    console.log('📊 Creating projects...');
    const project1 = await Project.create({
      caseId: 'PRJ-2026-001',
      name: 'Customer Portal Redesign',
      pmId: pm1._id,
      status: 'In Progress',
      health: 'On Track',
      priority: 'High',
      type: 'Internal',
      branch: 'Technology',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-04-30'),
      budget: 25000000,
      progress: 55,
      createdBy: 'System'
    });

    pm1.assignedProjects.push(project1._id);
    await pm1.save();

    console.log('✅ Database seeded successfully!');

    res.json({
      message: 'Database seeded successfully',
      adminCredentials: {
        email: 'admin@pmo.com',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('❌ Seed error:', error);
    res.status(500).json({ message: 'Seed error', error: error.message });
  }
});

// Error handling
app.use((req, res) => {
  console.log('❌ 404 - Route not found:', req.url);
  res.status(404).json({ message: 'Route not found', path: req.url });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log('🚀 Server running on port', PORT);
    console.log('📊 Dashboard: http://localhost:' + PORT);
    console.log('🔧 API: http://localhost:' + PORT + '/api');
    console.log('💚 Health Check: http://localhost:' + PORT + '/health');
  });
};

startServer();
