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
    const stats = data.dashboard || { totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0 };
    const recentTasks = data.recentTasks || [];

    document.getElementById('stat-total').textContent = stats.totalTasks;
    document.getElementById('stat-completed').textContent = stats.completedTasks;
    document.getElementById('stat-pending').textContent = stats.pendingTasks;
    document.getElementById('stat-overdue').textContent = stats.overdueTasks;

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
