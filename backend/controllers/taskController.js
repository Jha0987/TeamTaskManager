const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getTasks = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ message: 'projectId query param required' });

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

    // Only project members can delete
    const isMember = project.members.some(memberId => memberId.toString() === req.user.id);
    const isCreator = project.createdBy.toString() === req.user.id;

    if (!isMember && !isCreator) {
      return res.status(403).json({ message: 'Not authorized to delete tasks in this project' });
    }

    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
