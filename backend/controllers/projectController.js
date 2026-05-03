const Project = require('../models/Project');
const User = require('../models/User');

exports.getProjects = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const projects = await Project.find({
      $or: [{ createdBy: userId }, { members: userId }]
    })
    .populate('members', 'name email')
    .populate('createdBy', 'name email')
    .lean();

    res.status(200).json({ projects });
  } catch (err) {
    next(err);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) return res.status(400).json({ message: 'Project name is required' });

    const project = new Project({
      name,
      description,
      createdBy: userId,
      members: [userId] // add creator to members
    });

    await project.save();
    res.status(201).json({ message: 'Project created', project });
  } catch (err) {
    next(err);
  }
};

exports.addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ message: 'User email is required' });

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (project.members.includes(user._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(user._id);
    await project.save();

    res.status(200).json({ message: 'Member added', project });
  } catch (err) {
    next(err);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only project creator can remove members' });
    }

    project.members = project.members.filter(memberId => memberId.toString() !== userId);
    await project.save();

    res.status(200).json({ message: 'Member removed', project });
  } catch (err) {
    next(err);
  }
};
