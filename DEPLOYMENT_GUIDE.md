# 🚀 Complete Deployment Guide

This guide will walk you through deploying your PMO Tracker from scratch.

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] Email address (for account signups)
- [ ] 30 minutes of time
- [ ] Internet connection
- [ ] Basic knowledge of copying/pasting

**No coding knowledge required!**

---

## Step 1: Set Up MongoDB Database (5 minutes)

### What is MongoDB?
MongoDB is like an online Excel spreadsheet that stores all your project data.

### Instructions:

1. **Go to MongoDB Atlas**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Click "Sign up"

2. **Create Account**
   - Enter your email
   - Create a password
   - Verify your email

3. **Create a Free Cluster**
   - Click "Build a Database"
   - Select "M0 FREE" option
   - Choose "AWS" as provider
   - Select region closest to you (e.g., Mumbai for India)
   - Click "Create"

4. **Create Database User**
   - You'll see "Security Quickstart"
   - Username: Type `pmoAdmin`
   - Password: Click "Autogenerate Secure Password"
   - **IMPORTANT**: Copy this password and save it in Notepad!
   - Click "Create User"

5. **Set Up Network Access**
   - Click "Add My Current IP Address"
   - Also click "Add a Different IP Address"
   - Enter: `0.0.0.0/0` (allows access from anywhere)
   - Click "Add Entry"
   - Click "Finish and Close"

6. **Get Connection String**
   - Click "Connect" button
   - Click "Drivers"
   - Copy the connection string (starts with `mongodb+srv://`)
   - Open Notepad and paste it
   - Replace `<password>` with the password you saved earlier
   - Should look like: `mongodb+srv://pmoAdmin:YourPassword@cluster0.xxxxx.mongodb.net/pmo-tracker?retryWrites=true&w=majority`
   - **Save this - you'll need it later!**

✅ **MongoDB Setup Complete!**

---

## Step 2: Upload Code to GitHub (5 minutes)

### What is GitHub?
GitHub is like Google Drive for code - it stores your project files safely online.

### Instructions:

1. **Create GitHub Account** (if you don't have one)
   - Visit: https://github.com/signup
   - Follow signup process
   - Verify your email

2. **Create New Repository**
   - Click "+" button in top right
   - Click "New repository"
   - Repository name: `pmo-project-tracker`
   - Description: "Enterprise PMO Project Management System"
   - Select "Public"
   - Check "Add a README file"
   - Click "Create repository"

3. **Upload Your Files**
   - You should see a button "Add file"
   - Click "Upload files"
   - Drag and drop ALL files from the `pmo-tracker-final` folder:
     * server.js
     * package.json
     * .gitignore
     * .env.example
     * README.md
     * DEPLOYMENT_GUIDE.md (this file)
     * public folder (with index.html inside)
   
   **OR upload one by one:**
   - Click "Add file" → "Create new file"
   - For each file:
     * Type the filename (e.g., `server.js`)
     * Copy content from the downloaded file
     * Paste into GitHub
     * Click "Commit new file"
     * Repeat for all files

4. **Create public Folder**
   - Click "Add file" → "Create new file"
   - Type: `public/index.html`
   - Copy content from your index.html file
   - Click "Commit new file"

5. **Verify Structure**
   Your repository should have:
   ```
   - .gitignore
   - .env.example
   - DEPLOYMENT_GUIDE.md
   - README.md
   - package.json
   - server.js
   - public/
     - index.html
   ```

✅ **GitHub Upload Complete!**

---

## Step 3: Deploy on Render (10 minutes)

### What is Render?
Render makes your application accessible on the internet 24/7.

### Instructions:

1. **Create Render Account**
   - Visit: https://render.com
   - Click "Get Started for Free"
   - Sign up with GitHub (easier!) or email
   - This connects Render to your GitHub

2. **Create New Web Service**
   - Click "New +" button in top right
   - Select "Web Service"
   - You'll see your GitHub repositories
   - Find `pmo-project-tracker` and click "Connect"

3. **Configure Service**
   Fill in these settings:
   
   **Basic Settings:**
   - Name: `pmo-tracker` (or any name you like)
   - Region: Choose closest to you
   - Branch: `main` (should be automatic)
   - Runtime: `Node`
   
   **Build Settings:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   
   **Instance Type:**
   - Plan: Select "Free"

4. **Add Environment Variables** (CRITICAL!)
   
   Scroll down to "Environment Variables"
   
   Click "Add Environment Variable" for each:
   
   **Variable 1:**
   - Key: `MONGODB_URI`
   - Value: (Paste your MongoDB connection string from Step 1)
   
   **Variable 2:**
   - Key: `JWT_SECRET`
   - Value: Type any random text (e.g., `my-super-secret-key-12345`)
   
   **Variable 3:**
   - Key: `NODE_ENV`
   - Value: `production`

5. **Create & Deploy**
   - Double-check all settings
   - Click "Create Web Service" at bottom
   - Wait 3-5 minutes while Render builds your app
   - You'll see logs scrolling (this is normal!)
   - When you see "Server running on port..." - it's done!

6. **Get Your URL**
   - At the top, you'll see a URL like: `https://pmo-tracker.onrender.com`
   - Click on it or copy it
   - **This is your live application URL!**

✅ **Deployment Complete!**

---

## Step 4: Initialize & Test (5 minutes)

1. **Open Your Application**
   - Go to your Render URL (e.g., `https://pmo-tracker.onrender.com`)
   - You should see a login page

2. **Initialize Database**
   - Click "Initialize Database" link
   - Click "Run Setup" button
   - Wait for success message
   - This creates sample data and admin user

3. **Login**
   - Email: `admin@pmo.com`
   - Password: `admin123`
   - Click "Login"

4. **Test Features**
   
   **Test 1: View Dashboard**
   - You should see stats cards
   - Sample projects listed
   - ✅ Working!
   
   **Test 2: Add Project Manager**
   - Click "Project Managers" tab
   - Click "Add PM" button
   - Enter: Name, Email, Phone
   - Click "Add PM"
   - New PM appears
   - ✅ Working!
   
   **Test 3: Create Project**
   - Click "Project Queue" tab
   - Click "New Project" button
   - Fill in project details
   - Select a PM
   - Click "Add Project"
   - New project appears in list
   - ✅ Working!
   
   **Test 4: View Capacity**
   - Click "Capacity Planning" tab
   - See resources with progress bars
   - ✅ Working!

5. **Everything Working?**
   - If YES: Congratulations! You're done! 🎉
   - If NO: Check troubleshooting section below

✅ **Application is Live and Working!**

---

## 🎉 Success! What Now?

### Share with Your Team

1. **Copy your URL**: `https://your-app-name.onrender.com`
2. **Share with team members**
3. **They can login with their own accounts** (you can create them)

### Next Steps

1. **Change Admin Password**
   - Create a new PMO user with your email
   - Use a strong password
   - Delete or change the default admin

2. **Add Real Data**
   - Add your real Project Managers
   - Create your actual projects
   - Update resource list

3. **Train Your Team**
   - Show them how to login
   - Explain their role (PMO, PM, Team, Stakeholder)
   - Walk through key features

---

## 🆘 Troubleshooting

### Problem: Can't Connect to Database

**Symptoms:** Server crashes, "MongoDB connection error" in logs

**Solutions:**
1. Check MONGODB_URI in Render environment variables
2. Make sure you replaced `<password>` with actual password
3. Verify MongoDB Atlas allows connections from `0.0.0.0/0`
4. Ensure connection string has `?retryWrites=true&w=majority` at end

### Problem: Application Not Loading

**Symptoms:** Blank page, 404 error

**Solutions:**
1. Check Render logs for errors
2. Verify all environment variables are set
3. Make sure `public/index.html` file exists in GitHub
4. Try "Manual Deploy" → "Clear build cache & deploy"

### Problem: Login Fails

**Symptoms:** "Invalid credentials" error

**Solutions:**
1. Did you run "Initialize Database"?
2. Using correct credentials: `admin@pmo.com` / `admin123`
3. Check browser console (F12) for errors
4. Clear browser cache (Ctrl+Shift+Delete)

### Problem: "Cannot POST /api/..."

**Symptoms:** API errors, features don't work

**Solutions:**
1. Check Render logs - server might have crashed
2. Verify MongoDB connection is working
3. Restart service: Click "Manual Deploy" → "Deploy latest commit"

### Problem: App Works But Then Stops

**Symptoms:** App sleeps after 15 minutes

**Explanation:**
- Free Render tier sleeps after 15 minutes of inactivity
- First load takes 30 seconds to "wake up"
- This is normal for free tier

**Solutions:**
- Upgrade to Render Standard ($7/month) for always-on service
- OR just wait 30 seconds on first load

---

## 📊 Understanding Your Setup

### What You Just Built:

```
Your Computer
    ↓
GitHub (stores code)
    ↓
Render (runs application)
    ↓
MongoDB (stores data)
    ↓
Your URL (accessible to everyone)
```

### How It Works:

1. **You or your team** visit your URL
2. **Render** serves your application
3. **User logs in** (authentication)
4. **Frontend** sends requests to backend
5. **Backend** queries MongoDB database
6. **Database** returns data
7. **Frontend** displays data beautifully

---

## 💰 Cost Breakdown

### Current Setup (FREE):
- MongoDB M0: $0/month
- Render Free: $0/month
- GitHub Public: $0/month
- **Total: $0/month** ✅

### Limitations:
- Render sleeps after 15 minutes
- Limited MongoDB storage (512MB)
- Limited MongoDB connections

### If You Need More:
- Render Standard: $7/month (no sleep, better performance)
- MongoDB M10: $9/month (more storage, backups)
- **Total: $16/month**

---

## 🔒 Security Best Practices

### Immediately After Deployment:

1. **Change default admin password**
   - Create new PMO user with your email
   - Use strong password (12+ characters, mixed case, numbers, symbols)
   - Delete default admin

2. **Keep secrets safe**
   - Never share MongoDB password
   - Never share JWT_SECRET
   - Never commit .env file to GitHub

3. **Regular backups**
   - MongoDB Atlas has automatic backups (paid tier)
   - Export important data regularly

4. **Monitor access**
   - Review Render logs weekly
   - Check for suspicious activity
   - Update passwords quarterly

---

## 📞 Getting Help

### If You're Stuck:

1. **Check This Guide**
   - Read troubleshooting section
   - Follow steps exactly as written

2. **Check Render Logs**
   - Render Dashboard → Your Service → Logs tab
   - Look for error messages (red text)

3. **Check Browser Console**
   - Press F12 in browser
   - Click "Console" tab
   - Look for errors

4. **Check MongoDB**
   - MongoDB Atlas Dashboard
   - Verify cluster is running
   - Check connection string

### Common Issues:

- **"MongoServerError"** → Check MongoDB connection string
- **"Cannot find module"** → Verify package.json uploaded to GitHub
- **"Port already in use"** → Render will handle this automatically
- **"Invalid token"** → Login again, token expired

---

## ✅ Deployment Checklist

Use this to verify everything is set up correctly:

**MongoDB:**
- [ ] Account created
- [ ] Free cluster created
- [ ] Database user created (pmoAdmin)
- [ ] Password saved securely
- [ ] Network access allows 0.0.0.0/0
- [ ] Connection string copied

**GitHub:**
- [ ] Account created
- [ ] Repository created (pmo-project-tracker)
- [ ] All files uploaded
- [ ] public/index.html exists
- [ ] server.js exists
- [ ] package.json exists

**Render:**
- [ ] Account created
- [ ] Web service created
- [ ] Connected to GitHub repository
- [ ] Build command: npm install
- [ ] Start command: npm start
- [ ] Environment variables set (3 total)
- [ ] Deployment completed successfully

**Application:**
- [ ] URL accessible
- [ ] Login page loads
- [ ] Database initialized
- [ ] Admin login works
- [ ] Can view dashboard
- [ ] Can add PM
- [ ] Can create project
- [ ] All tabs work

**Security:**
- [ ] Default password changed
- [ ] MongoDB password secure
- [ ] JWT_SECRET is random
- [ ] Team members have accounts

---

## 🎯 Next Steps

After successful deployment:

1. **Customize**
   - Add your organization logo
   - Adjust color scheme if needed
   - Modify project types/branches

2. **Populate Data**
   - Add all Project Managers
   - Create current projects
   - Import resource list

3. **Train Team**
   - Schedule training session
   - Create user guide
   - Assign roles correctly

4. **Monitor**
   - Check daily for first week
   - Review usage patterns
   - Gather feedback

5. **Optimize**
   - Consider paid tier if needed
   - Add more features as required
   - Scale as team grows

---

**Congratulations! Your PMO Tracker is now live! 🎉**

Your URL: `https://your-app-name.onrender.com`

Save this guide for future reference!
