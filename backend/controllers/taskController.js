const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

const canAccessProject = (project, user) => {
  if (!project || !user) return false;

  return (
    user.role === 'Admin' ||
    project.createdBy.toString() === user.id ||
    project.members.some(memberId => memberId.toString() === user.id)
  );
};

exports.getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ message: 'projectId query param required' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ message: 'Not authorized to view tasks in this project' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .lean();
      
    res.status(200).json({ tasks });
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, dueDate, status } = req.body;
    
    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required' });
    }

    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admins can create tasks' });
    }

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ message: 'Not authorized to create tasks in this project' });
    }

    if (assignedTo) {
      const assignee = await User.findById(assignedTo).select('name email');
      if (!assignee) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }

      const isAssigneeInProject = project.members.some(memberId => memberId.toString() === assignedTo);
      if (!isAssigneeInProject) {
        return res.status(400).json({ message: 'Assigned user must be a member of the project' });
      }
    }

    const task = new Task({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || undefined,
      dueDate,
      status: status || 'todo'
    });

    await task.save();
    res.status(201).json({ message: 'Task created', task });
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, assignedTo, dueDate, status } = req.body;
    
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ message: 'Not authorized to update tasks in this project' });
    }

    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user.id;
    const isStatusOnlyUpdate = Object.keys(req.body).every(key => ['status'].includes(key));

    if (req.user.role !== 'Admin' && !(isAssignee && isStatusOnlyUpdate)) {
      return res.status(403).json({ message: 'Members can only update the status of tasks assigned to them' });
    }

    if (assignedTo !== undefined && assignedTo) {
      const assignee = await User.findById(assignedTo).select('name email');
      if (!assignee) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }

      const isAssigneeInProject = project.members.some(memberId => memberId.toString() === assignedTo);
      if (!isAssigneeInProject) {
        return res.status(400).json({ message: 'Assigned user must be a member of the project' });
      }
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || undefined;
    if (dueDate) task.dueDate = dueDate;
    if (status) task.status = status;

    await task.save();
    res.status(200).json({ message: 'Task updated', task });
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'Admin' || !canAccessProject(project, req.user)) {
      return res.status(403).json({ message: 'Not authorized to delete tasks in this project' });
    }

    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
