import { api } from './api.js';
import { formatDate, isOverdue, showLoading, showAlert, loadComponents } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const navbarContainer = document.getElementById('navbar-container');
  if(navbarContainer) {
    const res = await fetch('/components/navbar.html');
    navbarContainer.innerHTML = await res.text();
    document.getElementById('navbar-title').textContent = 'Dashboard Overview';
  }

  showLoading('dashboard-loading');

  try {
    const data = await api.get('/dashboard');
    const stats = data.stats || { total: 0, completed: 0, pending: 0, overdue: 0 };
    const recentTasks = data.recentTasks || [];
    const userRole = data.role || 'Member';
    const isAdmin = userRole === 'Admin';

    const adminOverview = document.getElementById('admin-overview');
    const memberOverview = document.getElementById('member-overview');

    if (isAdmin) {
      adminOverview.classList.remove('hidden');
      memberOverview.classList.add('hidden');
    } else {
      memberOverview.classList.remove('hidden');
      adminOverview.classList.add('hidden');
    }

    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-completed').textContent = stats.completed;
    document.getElementById('stat-pending').textContent = stats.pending;
    document.getElementById('stat-overdue').textContent = stats.overdue;

    if (isAdmin) {
      const users = data.users || [];
      const usersList = document.getElementById('admin-users-list');

      if (users.length === 0) {
        usersList.innerHTML = '<div class="empty-state">No users found.</div>';
      } else {
        usersList.innerHTML = users.map(user => `
          <div class="card" style="padding: 1rem; display:flex; justify-content:space-between; align-items:center; gap:1rem;">
            <div>
              <div style="font-weight:600;">${user.name}</div>
              <div style="color: var(--color-text-muted); font-size: 0.92rem;">${user.email}</div>
            </div>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <select class="admin-role-select form-control" data-user-id="${user._id || user.id}" style="width: 140px;">
                <option value="Member" ${user.role === 'Member' ? 'selected' : ''}>Member</option>
                <option value="Admin" ${user.role === 'Admin' ? 'selected' : ''}>Admin</option>
              </select>
              <button class="btn btn-primary btn-save-role" data-user-id="${user._id || user.id}">Save</button>
            </div>
          </div>
        `).join('');

        document.querySelectorAll('.btn-save-role').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            const userId = e.target.getAttribute('data-user-id');
            const select = document.querySelector(`.admin-role-select[data-user-id="${userId}"]`);
            try {
              await api.patch(`/users/${userId}/role`, { role: select.value });
              showAlert('User role updated', 'success');
              window.location.reload();
            } catch (err) {
              showAlert(err.message || 'Failed to update role');
            }
          });
        });
      }
    }

    const tasksListEl = document.getElementById('recent-tasks-list');
    
    if (recentTasks.length === 0) {
      tasksListEl.innerHTML = '<div class="empty-state">No recent tasks found.</div>';
    } else {
      tasksListEl.innerHTML = recentTasks.map(task => {
        let badgeClass = '';
        let statusText = task.status;
        
        if (isOverdue(task.dueDate, task.status)) {
          badgeClass = 'badge-overdue';
          statusText = 'overdue';
        } else if (task.status === 'done') {
          badgeClass = 'badge-done';
        } else if (task.status === 'inprogress') {
          badgeClass = 'badge-inprogress';
          statusText = 'in progress';
        } else {
          badgeClass = 'badge-todo';
        }

        return `
          <div class="recent-task-item">
            <div class="recent-task-info">
              <h4>${task.title}</h4>
              <div class="recent-task-meta">
                ${task.projectId?.name || 'Unknown Project'} &bull; Due: ${formatDate(task.dueDate)}
              </div>
            </div>
            <div>
              <span class="badge ${badgeClass}">${statusText.toUpperCase()}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    document.getElementById('dashboard-loading').classList.add('hidden');
    document.getElementById('dashboard-content').classList.remove('hidden');

  } catch (err) {
    document.getElementById('dashboard-loading').classList.add('hidden');
    showAlert(err.message || 'Failed to load dashboard data');
  }
});
