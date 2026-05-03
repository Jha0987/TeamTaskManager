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

  if (!user || user.role !== 'Admin') {
    loadingEl.innerHTML = '<div class="empty-state">Project management is available to Admins only. Use Tasks to track work.</div>';
    btnOpenModal.style.display = 'none';
    return;
  }

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
              <button class="btn btn-secondary btn-manage-members" data-id="${p._id}">Manage Members</button>
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

  const memberModal = document.getElementById('project-members-modal');
  const memberList = document.getElementById('project-members-list');
  const memberForm = document.getElementById('addMemberForm');
  const memberProjectTitle = document.getElementById('member-project-title');
  let activeProject = null;

  const openMemberModal = (project) => {
    activeProject = project;
    memberProjectTitle.textContent = project.name;
    renderMemberList(project.members || []);
    memberModal.classList.add('active');
  };

  const closeMemberModal = () => {
    memberModal.classList.remove('active');
    activeProject = null;
    memberForm.reset();
  };

  function renderMemberList(members) {
    if (!members.length) {
      memberList.innerHTML = '<div class="empty-state">No members added yet.</div>';
      return;
    }

    memberList.innerHTML = members.map(member => `
      <div class="card" style="padding: 0.9rem; display:flex; justify-content:space-between; align-items:center; gap:1rem;">
        <div>
          <div style="font-weight:600;">${member.name}</div>
          <div style="color: var(--color-text-muted); font-size: 0.92rem;">${member.email}</div>
        </div>
        <button class="btn btn-secondary btn-remove-member" data-member-id="${member._id}">Remove</button>
      </div>
    `).join('');

    document.querySelectorAll('.btn-remove-member').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const userId = e.target.getAttribute('data-member-id');
        try {
          await api.delete(`/projects/${activeProject._id}/remove-member`, { userId });
          const data = await api.get('/projects');
          const updated = data.projects.find(p => p._id === activeProject._id);
          openMemberModal(updated);
          loadProjects();
        } catch (err) {
          showAlert(err.message || 'Failed to remove member');
        }
      });
    });
  }

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-manage-members');
    if (!btn) return;
    const projectId = btn.getAttribute('data-id');
    const data = await api.get('/projects');
    const project = data.projects.find(p => p._id === projectId);
    if (project) openMemberModal(project);
  });

  memberForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('memberEmail').value;
    try {
      await api.post(`/projects/${activeProject._id}/add-member`, { email });
      const data = await api.get('/projects');
      const updated = data.projects.find(p => p._id === activeProject._id);
      openMemberModal(updated);
      loadProjects();
      memberForm.reset();
    } catch (err) {
      showAlert(err.message || 'Failed to add member');
    }
  });

  document.getElementById('btn-close-member-modal').addEventListener('click', closeMemberModal);
  document.getElementById('btn-cancel-member-modal').addEventListener('click', closeMemberModal);
  memberModal.addEventListener('click', (e) => {
    if (e.target === memberModal) closeMemberModal();
  });

  loadProjects();
});
