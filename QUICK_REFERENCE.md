# 🎯 Quick Reference Card

## 🔗 Important Links

- **Your Application**: https://your-app-name.onrender.com
- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **GitHub Repository**: https://github.com/YOUR_USERNAME/pmo-project-tracker

---

## 🔑 Default Credentials

**Admin Login:**
- Email: `admin@pmo.com`
- Password: `admin123`

⚠️ **CHANGE THIS IMMEDIATELY AFTER FIRST LOGIN!**

---

## 📊 Dashboard Overview

### Stats Cards
- **TOTAL**: All projects
- **APPROVED**: Completed projects
- **PENDING**: Planning stage projects
- **REJECTED**: Cancelled projects
- **ACTUAL**: In Progress projects
- **BREACH**: At Risk projects

### Three Main Tabs
1. **Project Queue** - View and manage all projects
2. **Capacity Planning** - Monitor resource utilization
3. **Project Managers** - Manage PMs (PMO only)

---

## 👥 User Roles

### PMO (Super Admin)
- ✅ View all projects
- ✅ Create/edit/delete projects
- ✅ Add/manage PMs
- ✅ Full system access

### PM (Project Manager)
- ✅ View assigned projects only
- ✅ Create new projects
- ✅ Update project status
- ❌ Cannot add PMs

### Team Member
- ✅ View projects
- ✅ Update tasks
- ❌ Cannot create projects

### Stakeholder
- ✅ View only (read-only)
- ❌ No editing capabilities

---

## ➕ Quick Actions

### Add a Project
1. Click "New Project" button
2. Fill in required fields:
   - Project Name*
   - Project Manager*
3. Optional: Priority, Type, Branch, Budget, Dates
4. Click "Add Project"

### Add a PM
1. Go to "Project Managers" tab
2. Click "Add PM" button
3. Enter:
   - Full Name*
   - Email*
   - Phone (optional)
4. Click "Add PM"

### View Project Details
- Click any project row in the table
- Modal opens with full details
- PMO can delete from here

---

## 🔍 Search & Filter

### Search
- Type in search box
- Searches: Case ID, Project Name
- Real-time filtering

### Filter by Status
- All Status
- Planning
- In Progress
- Completed
- Cancelled

### Filter by Priority
- All Priority
- Critical
- High
- Medium
- Low

### Sort
- Click any column header to sort
- Click again to reverse order

---

## 🎨 Status Badges

### Project Status
- 🟢 **Completed** (Green)
- 🟠 **In Progress** (Orange)
- 🔵 **Planning** (Blue)
- 🔴 **Cancelled** (Red)

### Priority Level
- 🔴 **Critical**
- 🟠 **High**
- 🔵 **Medium**
- ⚪ **Low**

### Health Status
- 🟢 **On Track**
- 🔴 **At Risk**
- 🔴 **Delayed**

### Resource Utilization
- 🟢 **Optimal** (60-100%)
- 🟠 **Under-utilized** (<60%)
- 🔴 **Over-allocated** (>100%)

---

## ⚙️ Environment Variables

**Required on Render:**

```
MONGODB_URI     Your MongoDB connection string
JWT_SECRET      Random secret key (30+ characters)
NODE_ENV        production
```

**Get MongoDB URI:**
1. MongoDB Atlas Dashboard
2. Click "Connect"
3. Choose "Drivers"
4. Copy connection string
5. Replace `<password>` with actual password

---

## 🆘 Common Issues & Quick Fixes

### Login Not Working
```
✅ Check: Did you initialize database?
✅ Check: Using admin@pmo.com / admin123?
✅ Fix: Clear browser cache (Ctrl+Shift+Delete)
```

### App Not Loading
```
✅ Check: Is Render service "Live"?
✅ Check: Are environment variables set?
✅ Fix: Redeploy (Manual Deploy → Deploy latest commit)
```

### Database Error
```
✅ Check: Is MONGODB_URI correct?
✅ Check: Did you replace <password>?
✅ Fix: Update environment variable on Render
```

### App Sleeps (Free Tier)
```
⚠️ Normal: Free tier sleeps after 15 min
⏱️ Wait: 30 seconds for first load
💰 Upgrade: $7/month for always-on
```

---

## 📱 Mobile Access

### Responsive Design
- ✅ Works on phones
- ✅ Works on tablets
- ✅ Works on desktop

### Best Experience
- Use modern browser (Chrome, Firefox, Safari)
- Portrait mode recommended for phones
- Landscape mode for tablets

---

## 🔐 Security Checklist

### After First Login:
- [ ] Change admin password
- [ ] Create your own PMO account
- [ ] Delete default admin
- [ ] Add team members with roles

### Regular Maintenance:
- [ ] Review user access monthly
- [ ] Update passwords quarterly
- [ ] Monitor Render logs weekly
- [ ] Backup important data

---

## 📈 Performance Tips

### Faster Loading
- Use modern browser
- Clear cache regularly
- Good internet connection
- Upgrade to paid Render tier

### Better Experience
- Filter projects to reduce table size
- Use search instead of scrolling
- Keep browser updated
- Close unused tabs

---

## 💾 Data Management

### Backup
- MongoDB Atlas has automatic backups (paid)
- Export projects manually as needed
- Keep important data in multiple places

### Cleanup
- Archive old projects quarterly
- Remove unused Project Managers
- Update resource list regularly

---

## 📞 Support Contacts

### Technical Issues:
1. Check DEPLOYMENT_GUIDE.md
2. Review Render logs
3. Check browser console (F12)

### Documentation:
- Full docs: README.md
- Deployment: DEPLOYMENT_GUIDE.md
- This guide: QUICK_REFERENCE.md

---

## 🎓 Training Materials

### For New Users:
1. Show them login page
2. Explain their role
3. Walk through their tab
4. Demonstrate key features

### For PMs:
- How to create projects
- How to update status
- How to view capacity

### For PMO:
- How to add PMs
- How to manage projects
- How to monitor resources

---

## 📊 Reports & Analytics

### Available Stats:
- Total project count
- Status breakdown
- Priority distribution
- Resource utilization
- PM workload

### Export Options:
- Take screenshots
- Copy table data
- Generate reports manually

---

## 🔄 Update Process

### Code Updates:
1. Update files on GitHub
2. Render auto-deploys (2-3 min)
3. Refresh browser
4. Test changes

### Data Updates:
- Changes save automatically
- Refresh page to see updates
- No manual save needed

---

## ⚡ Keyboard Shortcuts

### General:
- `F12` - Open developer tools
- `Ctrl+Shift+R` - Hard refresh
- `Ctrl+F` - Search on page

### Browser:
- `Ctrl+T` - New tab
- `Ctrl+W` - Close tab
- `Ctrl+Shift+T` - Reopen closed tab

---

## 📋 Monthly Checklist

### Start of Month:
- [ ] Review project status
- [ ] Update resource allocations
- [ ] Check capacity planning
- [ ] Archive completed projects

### Mid-Month:
- [ ] Monitor at-risk projects
- [ ] Review PM workload
- [ ] Check system health

### End of Month:
- [ ] Generate reports
- [ ] Plan next month
- [ ] Team feedback review

---

**Print this page and keep it handy! 📄**

Last Updated: February 2026
Version: 2.0.0
