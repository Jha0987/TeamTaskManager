const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id; // From authMiddleware
    const isAdmin = req.user.role === 'Admin';

    // Admins can see all projects/tasks; members only see their own workspace.
    const projectQuery = isAdmin
      ? {}
      : { $or: [{ createdBy: userId }, { members: userId }] };

    const projects = await Project.find(projectQuery)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email role')
      .lean();

    const projectIds = projects.map(p => p._id);

    // Find tasks across all these projects
    const taskQuery = isAdmin ? {} : { project: { $in: projectIds } };

    const tasks = await Task.find(taskQuery)
      .populate('project', 'name')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    const users = isAdmin
      ? await User.find({}).select('name email role createdAt').sort({ createdAt: -1 }).lean()
      : [];

    let total = tasks.length;
    let completed = 0;
    let pending = 0;
    let overdue = 0;
    
    const now = Date.now();

    tasks.forEach(task => {
      const isOverdue = task.dueDate && new Date(task.dueDate).getTime() < now && task.status !== 'done';
      
      if (task.status === 'done') {
        completed++;
      } else if (isOverdue) {
        overdue++;
      } else {
        pending++;
      }
    });

    const recentTasks = tasks.slice(0, 5);

    res.status(200).json({
      role: req.user.role,
      stats: { total, completed, pending, overdue },
      recentTasks,
      projects,
      users
    });
  } catch (err) {
    next(err);
  }
};
