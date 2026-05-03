const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Task must belong to a project'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'inprogress', 'done'],
        message: 'Status must be todo, inprogress, or done',
      },
      default: 'todo',
    },
    dueDate: {
      type: Date,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate && this.dueDate < Date.now() && this.status !== 'done';
});

// Index for efficient querying
taskSchema.index({ project: 1, assignedTo: 1 });
taskSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
