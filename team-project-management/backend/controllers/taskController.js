const mongoose = require('mongoose');
const Task = require('../models/Task');
const Project = require('../models/Project');

const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'title and projectId are required' });
    }

    const project = await Project.findOne({ _id: projectId, owner: req.user.id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      createdBy: req.user.id,
      assignedTo: assignedTo || null,
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;

    const filter = {};
    if (projectId) {
      const project = await Project.findOne({ _id: projectId, owner: req.user.id });
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      filter.project = projectId;
    } else {
      const projects = await Project.find({ owner: req.user.id }).select('_id');
      filter.project = { $in: projects.map((p) => p._id) };
    }

    const tasks = await Task.find(filter)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['todo', 'in-progress', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findOne({ _id: task.project, owner: req.user.id });
    if (!project) {
      return res.status(403).json({ message: 'Not authorized for this task' });
    }

    task.status = status;
    const updatedTask = await task.save();

    return res.status(200).json(updatedTask);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findOne({ _id: task.project, owner: req.user.id });
    if (!project) {
      return res.status(403).json({ message: 'Not authorized for this task' });
    }

    task.assignedTo = userId || null;
    const updatedTask = await task.save();

    return res.status(200).json(updatedTask);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const project = await Project.findOne({ _id: task.project, owner: req.user.id });
    if (!project) {
      return res.status(403).json({ message: 'Not authorized for this task' });
    }

    await Task.deleteOne({ _id: id });
    return res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTaskStatus,
  assignTask,
  deleteTask,
};
