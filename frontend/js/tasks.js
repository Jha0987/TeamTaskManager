import { api } from './api.js';
import { formatDate, isOverdue, showLoading, showAlert, getUser } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const navbarContainer = document.getElementById('navbar-container');
  if(navbarContainer) {
    const res = await fetch('/components/navbar.html');
    navbarContainer.innerHTML = await res.text();
    document.getElementById('navbar-title').textContent = 'Project Board';
  }

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('projectId');
  
  if (!projectId) {
    showAlert('No project ID specified.');
    return;
  }

  const boardEl = document.getElementById('kanban-board');
  const loadingEl = document.getElementById('tasks-loading');
  const user = getUser();
  const isAdmin = user?.role === 'Admin';
  let projectMembers = [];
  let tasks = [];

  // Modal elements
  const modal = document.getElementById('task-modal');
  const btnOpenModal = document.getElementById('btn-open-task-modal');
  const btnCloseModal = document.getElementById('btn-close-task-modal');
  const btnCancel = document.getElementById('btn-cancel-task');
  const taskForm = document.getElementById('taskForm');
  const modalTitle = document.getElementById('task-modal-title');

  if (!isAdmin) {
    btnOpenModal.style.display = 'none';
  }

  const openModal = (task = null) => {
    taskForm.reset();
    const assigneeSelect = document.getElementById('taskAssignee');
    assigneeSelect.innerHTML = '<option value="">Unassigned</option>' + 
      projectMembers.map(m => `<option value="${m._id}">${m.name}</option>`).join('');

    if (!isAdmin) {
      assigneeSelect.value = user?.id || '';
      assigneeSelect.disabled = true;
      document.getElementById('taskTitle').readOnly = true;
      document.getElementById('taskDesc').readOnly = true;
      document.getElementById('taskDueDate').disabled = true;
    } else {
      assigneeSelect.disabled = false;
      document.getElementById('taskTitle').readOnly = false;
      document.getElementById('taskDesc').readOnly = false;
      document.getElementById('taskDueDate').disabled = false;
    }

    if (task) {
      modalTitle.textContent = 'Edit Task';
      document.getElementById('taskId').value = task._id;
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskDesc').value = task.description || '';
      document.getElementById('taskAssignee').value = task.assignedTo?._id || task.assignedTo || '';
      if (task.dueDate) {
        document.getElementById('taskDueDate').value = new Date(task.dueDate).toISOString().split('T')[0];
      }
    } else {
      modalTitle.textContent = 'Add Task';
      document.getElementById('taskId').value = '';
    }
    modal.classList.add('active');
  };

  const closeModal = () => modal.classList.remove('active');

  btnOpenModal.addEventListener('click', () => openModal());
  btnCloseModal.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  async function loadData() {
    showLoading('tasks-loading');
    boardEl.classList.add('hidden');
    
    try {
      // Fetch project to get name and members, then tasks
      const [projData, tasksData] = await Promise.all([
        api.get('/projects'), // Getting all to find members
        api.get(`/tasks?projectId=${projectId}`)
      ]);
      
      const project = projData.projects.find(p => p._id === projectId);
      if (project) {
        document.getElementById('project-title').textContent = project.name;
        projectMembers = project.members || [];
      }
      
      tasks = tasksData.tasks || [];
      renderBoard();
      
      loadingEl.innerHTML = '';
      boardEl.classList.remove('hidden');
    } catch (err) {
      loadingEl.innerHTML = '';
      showAlert(err.message || 'Failed to load tasks');
    }
  }

  function renderBoard() {
    const columns = {
      'todo': { list: document.getElementById('list-todo'), count: document.getElementById('count-todo') },
      'inprogress': { list: document.getElementById('list-inprogress'), count: document.getElementById('count-inprogress') },
      'done': { list: document.getElementById('list-done'), count: document.getElementById('count-done') }
    };

    // Clear lists
    Object.values(columns).forEach(col => { col.list.innerHTML = ''; col.count.textContent = '0'; });

    tasks.forEach(task => {
      // Fallback map status
      let s = task.status;
      if(s === 'Todo') s = 'todo';
      if(s === 'In Progress') s = 'inprogress';
      if(s === 'Done') s = 'done';
      
      const col = columns[s] || columns['todo'];
      const overdue = isOverdue(task.dueDate, s);
      
      const card = document.createElement('div');
      card.className = `task-card ${overdue ? 'overdue' : ''}`;
      
      card.innerHTML = `
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          <span>Assignee: ${task.assignedTo?.name || 'Unassigned'}</span>
        </div>
        <div class="task-meta" style="${overdue ? 'color: var(--color-danger); font-weight: 500;' : ''}">
          Due: ${formatDate(task.dueDate)}
        </div>
        <div class="task-actions">
          <select class="status-select" data-id="${task._id}" ${!isAdmin && task.assignedTo?._id !== user?.id ? 'disabled' : ''}>
            <option value="todo" ${s === 'todo' ? 'selected' : ''}>Todo</option>
            <option value="inprogress" ${s === 'inprogress' ? 'selected' : ''}>In Progress</option>
            <option value="done" ${s === 'done' ? 'selected' : ''}>Done</option>
          </select>
          <div class="action-buttons" style="display:${isAdmin ? 'flex' : 'none'};">
            <button class="btn-edit" data-id="${task._id}">Edit</button>
            <button class="btn-delete" data-id="${task._id}">Del</button>
          </div>
        </div>
      `;
      col.list.appendChild(card);
    });

    // Update counts
    columns['todo'].count.textContent = columns['todo'].list.children.length;
    columns['inprogress'].count.textContent = columns['inprogress'].list.children.length;
    columns['done'].count.textContent = columns['done'].list.children.length;
    
    // Bind events
    document.querySelectorAll('.status-select').forEach(sel => {
      sel.addEventListener('change', async (e) => {
        const taskId = e.target.getAttribute('data-id');
        let newStatus = e.target.value;
        // Mapping back to backend expected enum if needed, assuming backend accepts lowercase
        try {
          await api.patch(`/tasks/${taskId}`, { status: newStatus });
          loadData();
        } catch(err) {
          showAlert(err.message);
          loadData(); // revert
        }
      });
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const taskId = e.target.getAttribute('data-id');
        const task = tasks.find(t => t._id === taskId);
        if(task) openModal(task);
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if(!confirm('Delete this task?')) return;
        const taskId = e.target.getAttribute('data-id');
        try {
          await api.delete(`/tasks/${taskId}`);
          loadData();
        } catch(err) {
          showAlert(err.message);
        }
      });
    });
  }

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    const btnSubmit = document.getElementById('btn-submit-task');
    
    const id = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDesc').value;
    const assignedTo = document.getElementById('taskAssignee').value || undefined;
    const dueDate = document.getElementById('taskDueDate').value || undefined;

    const payload = { title, description, assignedTo, dueDate, projectId };

    try {
      btnSubmit.disabled = true;
      btnSubmit.textContent = 'Saving...';
      
      if (id) {
        await api.patch(`/tasks/${id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      
      closeModal();
      loadData();
    } catch (err) {
      showAlert(err.message || 'Failed to save task');
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Save Task';
    }
  });

  loadData();
});
