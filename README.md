# 🎯 PMO Project Tracker - Enterprise Edition

Complete, production-ready Project Management Office tracking system with full feature set.

![Version](https://img.shields.io/badge/version-2.0.0-blue) ![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### Project Management
- ✅ Create, view, edit, and delete projects
- ✅ Full project details with all metadata
- ✅ Search by Case ID or project name
- ✅ Filter by status and priority
- ✅ Sort by any column
- ✅ Auto-generated Case IDs (PRJ-2026-XXX)
- ✅ Real-time statistics dashboard

### Project Manager Management
- ✅ Add and manage Project Managers
- ✅ Beautiful PM cards with workload visualization
- ✅ Auto-generated initials from names
- ✅ Track project assignments
- ✅ View total and in-progress project counts

### Resource Capacity Planning
- ✅ Visual utilization progress bars
- ✅ Real-time capacity calculations
- ✅ Status indicators (Optimal/Over-allocated/Under-utilized)
- ✅ Availability tracking
- ✅ Utilization percentage with color coding

### User Interface
- ✅ Clean, professional design
- ✅ Tab-based navigation
- ✅ Modal forms for data entry
- ✅ Color-coded status badges
- ✅ Responsive layout (desktop, tablet, mobile)
- ✅ Role-based access control

### Security
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based permissions (PMO, PM, Team, Stakeholder)
- ✅ Protected API endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account (free tier works great)
- Git (for version control)

### Local Setup

1. **Install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env and add your MongoDB URI and JWT secret
```

3. **Start the server**
```bash
npm start
```

4. **Open your browser**
```
http://localhost:3000
```

5. **Initialize the database**
- Click "Initialize Database" on the login page
- This creates sample data and an admin user

6. **Login**
- Email: `admin@pmo.com`
- Password: `admin123`

## 🌐 Deploy to Production

### Deploy to Render (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/pmo-tracker.git
git push -u origin main
```

2. **Create Render Account**
- Go to [render.com](https://render.com)
- Sign up with GitHub

3. **Create New Web Service**
- Click "New +" → "Web Service"
- Connect your repository
- Configure:
  - Name: `pmo-tracker`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Plan: Free

4. **Add Environment Variables**
```
MONGODB_URI = your_mongodb_connection_string
JWT_SECRET = your_random_secret_key
NODE_ENV = production
```

5. **Deploy**
- Click "Create Web Service"
- Wait 3-5 minutes for deployment
- Your app will be live at: `https://your-app.onrender.com`

### Get MongoDB Connection String

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Create database user
4. Whitelist IP: `0.0.0.0/0`
5. Get connection string
6. Replace `<password>` with your actual password

## 📖 User Guide

### For PMO (Super Admin)

**Dashboard Access:**
- View all projects across the organization
- Create and assign new projects
- Add and manage Project Managers
- Monitor resource capacity
- Delete projects

**Creating a Project:**
1. Click "New Project" button
2. Fill in:
   - Project Name (required)
   - Select Project Manager (required)
   - Priority, Type, Branch
   - Budget (in crores)
   - Start and End dates
3. Click "Add Project"

**Adding a PM:**
1. Go to "Project Managers" tab
2. Click "Add PM"
3. Enter: Name, Email, Phone
4. Click "Add PM"

### For Project Managers

**Dashboard Access:**
- View only assigned projects
- Create new projects
- Update project status
- View resource capacity

**Project Management:**
- Click any project to view details
- Update project information
- Track progress

### For Team Members

**Dashboard Access:**
- Read-only view of projects
- Update assigned tasks
- View project status

### For Stakeholders

**Dashboard Access:**
- Read-only view of all projects
- View dashboards and reports
- No editing capabilities

## 🎨 UI Components

### Stats Cards
- Total Projects
- Approved (Completed)
- Pending (Planning)
- Rejected (Cancelled)
- Actual (In Progress)
- Breach (At Risk)

### Project Table
- Sortable columns
- Filterable by status and priority
- Search by Case ID or name
- Click row for details

### PM Cards
- Avatar with initials
- Contact information
- Project count statistics
- List of assigned projects

### Resource Table
- Utilization progress bars
- Color-coded status
- Capacity calculations
- Availability tracking

## 🔧 API Endpoints

### Authentication
```
POST /api/auth/login        - Login
POST /api/auth/register     - Register new user
GET  /api/auth/me           - Get current user
```

### Project Managers
```
GET    /api/pms             - Get all PMs
POST   /api/pms             - Create PM (PMO only)
PUT    /api/pms/:id         - Update PM
DELETE /api/pms/:id         - Delete PM
```

### Projects
```
GET    /api/projects        - Get all projects
GET    /api/projects/:id    - Get single project
POST   /api/projects        - Create project
PUT    /api/projects/:id    - Update project
DELETE /api/projects/:id    - Delete project
```

### Resources
```
GET    /api/resources       - Get all resources
POST   /api/resources       - Create resource
PUT    /api/resources/:id   - Update resource
DELETE /api/resources/:id   - Delete resource
```

### Stats
```
GET /api/stats/dashboard    - Get dashboard statistics
```

### System
```
GET  /health                - Health check
POST /api/seed              - Initialize database with sample data
```

## 📁 Project Structure

```
pmo-tracker-final/
├── server.js              # Backend server (Node.js/Express)
├── package.json           # Dependencies
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── public/
    └── index.html        # Frontend application (HTML/CSS/JS)
```

## 🔐 Environment Variables

```env
MONGODB_URI    # MongoDB connection string
JWT_SECRET     # Random secret for JWT tokens
PORT           # Server port (default: 3000)
NODE_ENV       # Environment (production/development)
```

## 🐛 Troubleshooting

### Cannot connect to database
- Verify MONGODB_URI is correct
- Check MongoDB Atlas whitelist includes `0.0.0.0/0`
- Ensure password doesn't contain special characters

### App not loading
- Check Render logs for errors
- Verify all environment variables are set
- Clear browser cache

### Login fails
- Run database initialization first
- Check credentials: `admin@pmo.com` / `admin123`
- Verify JWT_SECRET is set

## 💰 Costs

### Free Tier
- MongoDB Atlas: Free (M0 cluster)
- Render: Free (with limitations)
- GitHub: Free (public repository)
- **Total: $0/month**

### Paid Upgrade (Optional)
- MongoDB M10: $9/month (more storage/performance)
- Render Standard: $7/month (always-on, no sleep)
- **Total: $16/month**

## 📊 Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- Pure Vanilla JavaScript
- HTML5 + CSS3
- No frameworks (lightweight & fast)

## 🤝 Support

For issues:
1. Check troubleshooting section
2. Review Render logs
3. Check browser console (F12)

## 📝 License

MIT License - See LICENSE file for details

## 🎉 Success Checklist

- [ ] Node.js installed
- [ ] MongoDB Atlas account created
- [ ] Connection string obtained
- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables configured
- [ ] Database initialized
- [ ] Admin login successful
- [ ] Can create PM
- [ ] Can create project
- [ ] All features working

---

**Made with ❤️ for PMO teams worldwide**

⭐ Star this repo if helpful!
