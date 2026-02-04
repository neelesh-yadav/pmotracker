const mongoose = require('mongoose');
require('dotenv').config();

async function migrateToV3() {
  try {
    console.log('🔄 Starting PMO Tracker v3.0 Migration...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Update Users - Add permissions
    console.log('👤 Updating users...');
    await mongoose.connection.db.collection('users').updateMany(
      { permissions: { $exists: false } },
      {
        $set: {
          permissions: {
            canCreateProjects: false,
            canApproveProjects: false,
            canManageBudget: false,
            canViewAllProjects: false,
            canManageUsers: false,
            canManageRisks: false,
            canUploadDocuments: true
          },
          capacity: 40,
          availability: 'Available',
          isActive: true
        }
      }
    );
    
    // Set PMO permissions
    await mongoose.connection.db.collection('users').updateMany(
      { role: 'PMO' },
      {
        $set: {
          'permissions.canCreateProjects': true,
          'permissions.canApproveProjects': true,
          'permissions.canManageBudget': true,
          'permissions.canViewAllProjects': true,
          'permissions.canManageUsers': true,
          'permissions.canManageRisks': true
        }
      }
    );
    
    // Set PM permissions
    await mongoose.connection.db.collection('users').updateMany(
      { role: 'PM' },
      {
        $set: {
          'permissions.canCreateProjects': true,
          'permissions.canManageBudget': true,
          'permissions.canManageRisks': true
        }
      }
    );
    
    // Update Projects
    console.log('📊 Updating projects...');
    await mongoose.connection.db.collection('projects').updateMany(
      { currentPhase: { $exists: false } },
      {
        $set: {
          currentPhase: 'Execution',
          milestones: [],
          teamMembers: [],
          riskSummary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
          issueSummary: { total: 0, open: 0, resolved: 0 }
        }
      }
    );
    
    // Migrate budget structure
    console.log('💰 Migrating budgets...');
    const projects = await mongoose.connection.db.collection('projects').find({
      budget: { $type: 'number' }
    }).toArray();
    
    for (const project of projects) {
      await mongoose.connection.db.collection('projects').updateOne(
        { _id: project._id },
        {
          $set: {
            'budget.total': project.budget || 0,
            'budget.allocated': project.budget || 0,
            'budget.spent': project.spent || 0,
            'budget.variance': (project.spent || 0) - (project.budget || 0),
            'budget.currency': 'USD'
          },
          $unset: { budget: '', spent: '' }
        }
      );
    }
    
    // Update status values
    await mongoose.connection.db.collection('projects').updateMany(
      { status: 'In Progress' },
      { $set: { status: 'In_Progress' } }
    );
    
    console.log('\n✨ Migration completed successfully!');
    console.log('🎉 Your PMO Tracker is now v3.0!');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

console.log('╔════════════════════════════════════════╗');
console.log('║   PMO Tracker v3.0 Migration Script   ║');
console.log('╚════════════════════════════════════════╝\n');
migrateToV3();
