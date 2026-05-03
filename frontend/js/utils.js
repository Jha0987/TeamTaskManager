export function formatDate(dateStr) {
  if (!dateStr) return '';
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

export function isOverdue(dateStr, status) {
  if (status === 'done' || !dateStr) return false;
  return new Date(dateStr) < new Date();
}

export function showAlert(message, type = 'error') {
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) existingAlert.remove();

  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;font-weight:bold;">&times;</button>
  `;
  
  // Insert at top of main content or container
  const container = document.querySelector('.page-content') || document.querySelector('.auth-container') || document.body;
  container.insertBefore(alertDiv, container.firstChild);

  setTimeout(() => alertDiv.remove(), 5000);
}

export function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '<div class="spinner"></div>';
  }
}

export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/pages/login.html';
}

export async function loadComponents() {
  const user = getUser();
  if (!user && !window.location.pathname.includes('login') && !window.location.pathname.includes('signup')) {
    window.location.href = '/pages/login.html';
    return;
  }

  // Load Sidebar
  const sidebarContainer = document.getElementById('sidebar-container');
  if (sidebarContainer) {
    try {
      const res = await fetch('/components/sidebar.html');
      const html = await res.text();
      sidebarContainer.innerHTML = html;
      
      // Highlight active link
      const path = window.location.pathname.split('/').pop();
      const links = sidebarContainer.querySelectorAll('.nav-link');
      links.forEach(link => {
        const role = link.getAttribute('data-role');
        if (role === 'admin' && user?.role !== 'Admin') {
          link.style.display = 'none';
          return;
        }

        if (link.getAttribute('href').includes(path)) {
          link.style.backgroundColor = 'var(--color-primary)';
          link.style.color = 'white';
        }
      });

      // Set user name
      const userNameEl = document.getElementById('sidebar-user-name');
      if (userNameEl && user) userNameEl.textContent = user.name;

      const userRoleEl = document.getElementById('sidebar-user-role');
      if (userRoleEl && user) {
        userRoleEl.textContent = user.role === 'Admin' ? 'Administrator' : 'Member';
      }
    } catch (e) {
      console.error('Failed to load sidebar', e);
    }
  }

  // Bind logout globally if needed
  window.logout = logout;
}

// Ensure auth check on load
document.addEventListener('DOMContentLoaded', loadComponents);
