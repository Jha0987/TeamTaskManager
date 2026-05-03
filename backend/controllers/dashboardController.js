const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id; // From authMiddleware

    // Find all projects for this user
    const projects = await Project.find({
      $or: [{ createdBy: userId }, { members: userId }]
    }).lean();

    const projectIds = projects.map(p => p._id);

    // Find tasks across all these projects
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .lean();

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
      stats: { total, completed, pending, overdue },
      recentTasks
    });
  } catch (err) {
    next(err);
  }
};
