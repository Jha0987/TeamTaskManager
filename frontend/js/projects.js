import { api } from './api.js';
import { formatDate, showLoading, showAlert, loadComponents, getUser } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const navbarContainer = document.getElementById('navbar-container');
  if(navbarContainer) {
    const res = await fetch('/components/navbar.html');
    navbarContainer.innerHTML = await res.text();
    document.getElementById('navbar-title').textContent = 'Projects';
  }

  const modal = document.getElementById('create-project-modal');
  const btnOpenModal = document.getElementById('btn-open-create-modal');
  const btnCloseModal = document.getElementById('btn-close-create-modal');
  const btnCancel = document.getElementById('btn-cancel-create');
  const createForm = document.getElementById('createProjectForm');
  const projectsList = document.getElementById('projects-list');
  const loadingEl = document.getElementById('projects-loading');

  const user = getUser();
  
  // Only admins might be allowed to create projects normally, but for this demo let anyone try, backend will enforce if needed.

  const openModal = () => modal.classList.add('active');
  const closeModal = () => {
    modal.classList.remove('active');
    createForm.reset();
  };

  btnOpenModal.addEventListener('click', openModal);
  btnCloseModal.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  async function loadProjects() {
    showLoading('projects-loading');
    projectsList.classList.add('hidden');
    projectsList.innerHTML = '';
    
    try {
      const data = await api.get('/projects');
      const projects = data.projects || [];
      
      loadingEl.innerHTML = '';
      
      if (projects.length === 0) {
        projectsList.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">No projects found. Create one to get started.</div>';
      } else {
        projectsList.innerHTML = projects.map(p => `
          <div class="card project-card">
            <div class="project-header">
              <div class="project-name">${p.name}</div>
              <div class="project-desc" title="${p.description || ''}">${p.description || 'No description'}</div>
            </div>
            <div class="project-meta">
              <span>Members: ${p.members?.length || 0}</span>
              <span>Created: ${formatDate(p.createdAt)}</span>
            </div>
            <div class="project-actions">
              <a href="tasks.html?projectId=${p._id}" class="btn btn-primary">View Tasks</a>
            </div>
          </div>
        `).join('');
      }
      
      projectsList.classList.remove('hidden');
    } catch (err) {
      loadingEl.innerHTML = '';
      showAlert(err.message || 'Failed to load projects');
    }
  }

  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-submit-project');
    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDesc').value;

    try {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Creating...';
      await api.post('/projects', { name, description });
      closeModal();
      loadProjects();
    } catch (err) {
      showAlert(err.message || 'Failed to create project');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Create Project';
    }
  });

  loadProjects();
});
