// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskName: {
    type: String,
    required: true,
    trim: true
  },
  taskDetails: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    default: ''
  },
  dailyReminder: {
    type: Boolean,
    default: false
  },
  reminderType: {
    type: String,
    enum: ['everyday', 'specific', ''],
    default: ''
  },
  specificDays: [{
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  }],
  status: {
    type: String,
    enum: ['In Progress', 'Done'],
    default: 'In Progress'
  },
  completedDates: {
    type: [String], // store dates in YYYY-MM-DD format
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', taskSchema);