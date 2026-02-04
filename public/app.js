// Global state
let currentUser = null;
let currentProjectId = null;
const API_BASE = window.location.origin + '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }
  
  loadCurrentUser();
  loadDashboard();
  loadNotificationCount();
  
  // Setup form handlers
  setupForms();
  
  // Poll notifications every 30 seconds
  setInterval(loadNotificationCount, 30000);
});

// Load current user
async function loadCurrentUser() {
  try {
    const response = await apiCall('/auth/me');
    currentUser = response;
    
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role.replace('_', ' ');
    document.getElementById('userAvatar').textContent = currentUser.initials || currentUser.name[0];
    
    // Show/hide tabs based on role
    if (currentUser.role === 'PMO') {
      document.getElementById('usersTab').style.display = 'block';
      document.getElementById('createTaskBtn').style.display = 'block';
      document.getElementById('createResourceBtn').style.display = 'block';
    } else if (currentUser.role === 'PM') {
      document.getElementById('createTaskBtn').style.display = 'block';
      document.getElementById('createResourceBtn').style.display = 'block';
    } else {
      document.getElementById('resourcesTab').style.display = 'none';
      document.getElementById('createTaskBtn').style.display = 'none';
    }
  } catch (error) {
    console.error('Failed to load user:', error);
    logout();
  }
}

// API call helper
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(API_BASE + endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });
  
  if (response.status === 401) {
    logout();
    return;
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
  
  return response.json();
}

// Switch view
function switchView(viewName) {
  // Update tabs
  document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');
  
  // Update views
  document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
  document.getElementById(viewName).classList.add('active');
  
  // Load data for view
  switch(viewName) {
    case 'dashboard':
      loadDashboard();
      break;
    case 'projects':
      loadProjects();
      break;
    case 'tasks':
      loadMyTasks();
      break;
    case 'resources':
      loadResources();
      break;
    case 'users':
      loadUsers();
      break;
  }
}

// Load dashboard
async function loadDashboard() {
  try {
    const stats = await apiCall('/stats/dashboard');
    
    document.getElementById('totalProjects').textContent = stats.total || 0;
    document.getElementById('inProgressProjects').textContent = stats.actual || 0;
    document.getElementById('myTasksCount').textContent = stats.myTasks || 0;
    document.getElementById('activeRisks').textContent = stats.risks || 0;
    
    // Load recent projects
    const projects = await apiCall('/projects');
    renderRecentProjects(projects.slice(0, 5));
  } catch (error) {
    console.error('Dashboard load error:', error);
  }
}

// Render recent projects
function renderRecentProjects(projects) {
  const html = `
    <table>
      <thead>
        <tr>
          <th>Case ID</th>
          <th>Project Name</th>
          <th>PM</th>
          <th>Status</th>
          <th>Health</th>
          <th>Progress</th>
        </tr>
      </thead>
      <tbody>
        ${projects.map(p => `
          <tr onclick="viewProject('${p._id}')">
            <td>${p.caseId}</td>
            <td>${p.name}</td>
            <td>${p.pmId?.name || 'Unassigned'}</td>
            <td><span class="status-badge">${p.status.replace('_', ' ')}</span></td>
            <td><span class="status-badge status-${p.health.toLowerCase().replace('_', '-')}">${p.health.replace('_', ' ')}</span></td>
            <td>${p.progress || 0}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  document.getElementById('recentProjectsTable').innerHTML = html;
}

// Load all projects
async function loadProjects() {
  try {
    const projects = await apiCall('/projects');
    const html = `
      <table>
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Name</th>
            <th>PM</th>
            <th>Status</th>
            <th>Health</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${projects.map(p => `
            <tr>
              <td>${p.caseId}</td>
              <td>${p.name}</td>
              <td>${p.pmId?.name || 'N/A'}</td>
              <td><span class="status-badge">${p.status.replace('_', ' ')}</span></td>
              <td><span class="status-badge status-${p.health.toLowerCase().replace('_', '-')}">${p.health.replace('_', ' ')}</span></td>
              <td><span class="status-badge priority-${p.priority.toLowerCase()}">${p.priority}</span></td>
              <td>
                <button class="btn btn-sm btn-secondary" onclick="viewProject('${p._id}')">View</button>
                ${currentUser.role === 'PMO' ? `<button class="btn btn-sm btn-danger" onclick="deleteProject('${p._id}')">Delete</button>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    document.getElementById('projectsTable').innerHTML = html;
  } catch (error) {
    console.error('Projects load error:', error);
  }
}

// View project details
async function viewProject(projectId) {
  currentProjectId = projectId;
  try {
    const project = await apiCall(`/projects/${projectId}`);
    
    document.getElementById('projectId').value = project._id;
    document.getElementById('projectName').value = project.name;
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectPriority').value = project.priority;
    document.getElementById('projectStatus').value = project.status;
    
    showModal('projectModal');
    showProjectTab('details');
  } catch (error) {
    console.error('Project load error:', error);
  }
}

// Show project tab
function showProjectTab(tab) {
  document.getElementById('projectDetailsTab').style.display = tab === 'details' ? 'block' : 'none';
  document.getElementById('projectTasksTab').style.display = tab === 'tasks' ? 'block' : 'none';
  document.getElementById('projectRisksTab').style.display = tab === 'risks' ? 'block' : 'none';
  document.getElementById('projectIssuesTab').style.display = tab === 'issues' ? 'block' : 'none';
  
  if (tab === 'tasks') loadProjectTasks(currentProjectId);
  if (tab === 'risks') loadProjectRisks(currentProjectId);
  if (tab === 'issues') loadProjectIssues(currentProjectId);
}

// Load project tasks
async function loadProjectTasks(projectId) {
  try {
    const tasks = await apiCall(`/tasks?projectId=${projectId}`);
    const html = tasks.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(t => `
            <tr>
              <td>${t.taskId}</td>
              <td>${t.title}</td>
              <td>${t.assignedTo?.name || 'Unassigned'}</td>
              <td><span class="status-badge">${t.status.replace('_', ' ')}</span></td>
              <td><span class="status-badge priority-${t.priority.toLowerCase()}">${t.priority}</span></td>
              <td>${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<div class="empty-state"><p>No tasks yet</p></div>';
    
    document.getElementById('projectTasksList').innerHTML = html;
  } catch (error) {
    console.error('Tasks load error:', error);
  }
}

// Load project risks
async function loadProjectRisks(projectId) {
  try {
    const risks = await apiCall(`/risks?projectId=${projectId}`);
    const html = risks.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Probability</th>
            <th>Impact</th>
            <th>Level</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${risks.map(r => `
            <tr>
              <td>${r.riskId}</td>
              <td>${r.title}</td>
              <td>${r.category}</td>
              <td>${r.probability.replace('_', ' ')}</td>
              <td>${r.impact.replace('_', ' ')}</td>
              <td><span class="status-badge priority-${r.riskLevel.toLowerCase()}">${r.riskLevel}</span></td>
              <td>${r.status}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<div class="empty-state"><p>No risks identified</p></div>';
    
    document.getElementById('projectRisksList').innerHTML = html;
  } catch (error) {
    console.error('Risks load error:', error);
  }
}

// Load project issues
async function loadProjectIssues(projectId) {
  try {
    const issues = await apiCall(`/issues?projectId=${projectId}`);
    const html = issues.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Severity</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned To</th>
          </tr>
        </thead>
        <tbody>
          ${issues.map(i => `
            <tr>
              <td>${i.issueId}</td>
              <td>${i.title}</td>
              <td><span class="status-badge priority-${i.severity.toLowerCase()}">${i.severity}</span></td>
              <td><span class="status-badge priority-${i.priority.toLowerCase()}">${i.priority}</span></td>
              <td>${i.status.replace('_', ' ')}</td>
              <td>${i.assignedTo?.name || 'Unassigned'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<div class="empty-state"><p>No issues reported</p></div>';
    
    document.getElementById('projectIssuesList').innerHTML = html;
  } catch (error) {
    console.error('Issues load error:', error);
  }
}

// Load my tasks
async function loadMyTasks() {
  try {
    const tasks = await apiCall('/tasks');
    const html = tasks.length > 0 ? `
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Project</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(t => `
            <tr>
              <td>${t.taskId}</td>
              <td>${t.title}</td>
              <td>${t.projectId?.name || 'N/A'}</td>
              <td><span class="status-badge">${t.status.replace('_', ' ')}</span></td>
              <td><span class="status-badge priority-${t.priority.toLowerCase()}">${t.priority}</span></td>
              <td>${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}</td>
              <td>
                <button class="btn btn-sm btn-secondary" onclick="updateTaskStatus('${t._id}', '${t.status}')">Update</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    ` : '<div class="empty-state"><p class="empty-state-text">No tasks assigned</p></div>';
    
    document.getElementById('tasksTable').innerHTML = html;
  } catch (error) {
    console.error('Tasks load error:', error);
  }
}

// Update task status
async function updateTaskStatus(taskId, currentStatus) {
  const statuses = ['To_Do', 'In_Progress', 'In_Review', 'Completed'];
  const currentIndex = statuses.indexOf(currentStatus);
  const nextStatus = statuses[currentIndex + 1] || 'Completed';
  
  try {
    await apiCall(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: nextStatus })
    });
    loadMyTasks();
    showSuccess('Task updated successfully!');
  } catch (error) {
    showError('Failed to update task');
  }
}

// Load resources
async function loadResources() {
  try {
    const resources = await apiCall('/resources');
    const html = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Email</th>
            <th>Capacity</th>
            ${currentUser.role === 'PMO' ? '<th>Projects</th>' : ''}
            ${currentUser.role === 'PM' ? '<th>Status</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${resources.map(r => `
            <tr>
              <td>${r.name}</td>
              <td>${r.role}</td>
              <td>${r.email}</td>
              <td>${r.plannedCapacity} hrs/week</td>
              ${currentUser.role === 'PMO' ? `<td>${r.assignedProjects?.length || 0} projects</td>` : ''}
              ${currentUser.role === 'PM' ? `<td>${r.isShared ? '<span class="status-badge status-at-risk">Shared</span>' : '<span class="status-badge status-on-track">Dedicated</span>'}</td>` : ''}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    document.getElementById('resourcesTable').innerHTML = html;
  } catch (error) {
    console.error('Resources load error:', error);
  }
}

// Load users (PMO only)
async function loadUsers() {
  if (currentUser.role !== 'PMO') return;
  
  try {
    const [pms, users] = await Promise.all([
      apiCall('/pms'),
      apiCall('/users')
    ]);
    
    // Render PMs
    const pmsHtml = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Assigned Projects</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${pms.map(pm => `
            <tr>
              <td>${pm.name}</td>
              <td>${pm.email}</td>
              <td>${pm.phone || 'N/A'}</td>
              <td>${pm.assignedProjects?.length || 0}</td>
              <td>
                <button class="btn btn-sm btn-danger" onclick="deletePM('${pm._id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    document.getElementById('pmsTable').innerHTML = pmsHtml;
    
    // Render all users
    const usersHtml = `
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Department</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td>${u.name}</td>
              <td>${u.email}</td>
              <td><span class="status-badge">${u.role.replace('_', ' ')}</span></td>
              <td>${u.department || 'N/A'}</td>
              <td><span class="status-badge status-${u.isActive ? 'on-track' : 'at-risk'}">${u.isActive ? 'Active' : 'Inactive'}</span></td>
              <td>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${u._id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    document.getElementById('allUsersTable').innerHTML = usersHtml;
  } catch (error) {
    console.error('Users load error:', error);
  }
}

// Delete PM
async function deletePM(pmId) {
  if (!confirm('Are you sure you want to delete this PM? Their user account will also be deleted.')) return;
  
  try {
    await apiCall(`/pms/${pmId}`, { method: 'DELETE' });
    showSuccess('PM deleted successfully');
    loadUsers();
  } catch (error) {
    showError('Failed to delete PM');
  }
}

// Delete user
async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) return;
  
  try {
    await apiCall(`/users/${userId}`, { method: 'DELETE' });
    showSuccess('User deleted successfully');
    loadUsers();
  } catch (error) {
    showError('Failed to delete user');
  }
}

// Delete project
async function deleteProject(projectId) {
  if (!confirm('Are you sure you want to delete this project?')) return;
  
  try {
    await apiCall(`/projects/${projectId}`, { method: 'DELETE' });
    showSuccess('Project deleted successfully');
    loadProjects();
  } catch (error) {
    showError('Failed to delete project');
  }
}

// Load notification count
async function loadNotificationCount() {
  try {
    const data = await apiCall('/notifications/unread-count');
    const count = data.count || 0;
    document.getElementById('notificationCount').textContent = count;
    document.getElementById('notificationCount').style.display = count > 0 ? 'flex' : 'none';
  } catch (error) {
    console.error('Notification count error:', error);
  }
}

// Setup forms
function setupForms() {
  // Project form
  document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const projectId = document.getElementById('projectId').value;
    const data = {
      name: document.getElementById('projectName').value,
      description: document.getElementById('projectDescription').value,
      priority: document.getElementById('projectPriority').value,
      status: document.getElementById('projectStatus').value
    };
    
    try {
      if (projectId) {
        await apiCall(`/projects/${projectId}`, { method: 'PUT', body: JSON.stringify(data) });
        showSuccess('Project updated successfully');
      } else {
        await apiCall('/projects', { method: 'POST', body: JSON.stringify(data) });
        showSuccess('Project created successfully');
      }
      closeModal('projectModal');
      loadProjects();
      loadDashboard();
    } catch (error) {
      showError(error.message);
    }
  });
  
  // Task form
  document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      projectId: document.getElementById('taskProject').value || document.getElementById('taskProjectId').value,
      title: document.getElementById('taskTitle').value,
      description: document.getElementById('taskDescription').value,
      assignedTo: document.getElementById('taskAssignedTo').value,
      priority: document.getElementById('taskPriority').value,
      status: document.getElementById('taskStatus').value,
      dueDate: document.getElementById('taskDueDate').value
    };
    
    try {
      await apiCall('/tasks', { method: 'POST', body: JSON.stringify(data) });
      showSuccess('Task created successfully');
      closeModal('taskModal');
      loadMyTasks();
      if (currentProjectId) loadProjectTasks(currentProjectId);
    } catch (error) {
      showError(error.message);
    }
  });
  
  // Risk form
  document.getElementById('riskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      projectId: document.getElementById('riskProjectId').value,
      title: document.getElementById('riskTitle').value,
      description: document.getElementById('riskDescription').value,
      category: document.getElementById('riskCategory').value,
      probability: document.getElementById('riskProbability').value,
      impact: document.getElementById('riskImpact').value,
      mitigationPlan: document.getElementById('riskMitigationPlan').value
    };
    
    try {
      await apiCall('/risks', { method: 'POST', body: JSON.stringify(data) });
      showSuccess('Risk added successfully');
      closeModal('riskModal');
      if (currentProjectId) loadProjectRisks(currentProjectId);
    } catch (error) {
      showError(error.message);
    }
  });
  
  // Resource form
  document.getElementById('resourceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('resourceName').value,
      role: document.getElementById('resourceRole').value,
      email: document.getElementById('resourceEmail').value,
      plannedCapacity: document.getElementById('resourceCapacity').value
    };
    
    try {
      await apiCall('/resources', { method: 'POST', body: JSON.stringify(data) });
      showSuccess('Resource added successfully');
      closeModal('resourceModal');
      loadResources();
    } catch (error) {
      showError(error.message);
    }
  });
  
  // User form
  document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('userName').value,
      email: document.getElementById('userEmail').value,
      role: document.getElementById('userRole').value,
      department: document.getElementById('userDepartment').value
    };
    
    try {
      await apiCall('/users', { method: 'POST', body: JSON.stringify(data) });
      showSuccess('User created successfully. Default password: password123');
      closeModal('userModal');
      loadUsers();
    } catch (error) {
      showError(error.message);
    }
  });
  
  // PM form
  document.getElementById('pmForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('pmName').value,
      email: document.getElementById('pmEmail').value,
      phone: document.getElementById('pmPhone').value
    };
    
    try {
      await apiCall('/pms', { method: 'POST', body: JSON.stringify(data) });
      showSuccess('PM created successfully. Login password: pm123');
      closeModal('pmModal');
      loadUsers();
    } catch (error) {
      showError(error.message);
    }
  });
}

// Modal functions
function showModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function openProjectModal() {
  document.getElementById('projectForm').reset();
  document.getElementById('projectId').value = '';
  showModal('projectModal');
}

async function openTaskModal(projectId = null) {
  document.getElementById('taskForm').reset();
  
  // Load projects for dropdown
  const projects = await apiCall('/projects');
  const projectSelect = document.getElementById('taskProject');
  projectSelect.innerHTML = '<option value="">Select Project</option>' +
    projects.map(p => `<option value="${p._id}">${p.name}</option>`).join('');
  
  // Load team members
  const users = await apiCall('/users');
  const teamMembers = users.filter(u => u.role === 'Team_Member');
  const assignSelect = document.getElementById('taskAssignedTo');
  assignSelect.innerHTML = '<option value="">Select Team Member</option>' +
    teamMembers.map(u => `<option value="${u._id}">${u.name}</option>`).join('');
  
  if (projectId) {
    document.getElementById('taskProjectId').value = projectId;
    projectSelect.value = projectId;
    projectSelect.disabled = true;
  }
  
  showModal('taskModal');
}

function openRiskModal(projectId) {
  document.getElementById('riskForm').reset();
  document.getElementById('riskProjectId').value = projectId;
  showModal('riskModal');
}

function openIssueModal(projectId) {
  // Similar to risk modal
  showModal('issueModal');
}

function openResourceModal() {
  document.getElementById('resourceForm').reset();
  showModal('resourceModal');
}

function openUserModal() {
  document.getElementById('userForm').reset();
  showModal('userModal');
}

function openPMModal() {
  document.getElementById('pmForm').reset();
  showModal('pmModal');
}

// Utility functions
function showSuccess(message) {
  alert('✓ ' + message);
}

function showError(message) {
  alert('✗ ' + message);
}

function logout() {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
}
