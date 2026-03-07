// routes/tasks.js
const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper function to check if a task recurs on a given date
function taskRecursOnDate(task, date) {
  const taskDate = new Date(task.date);
  taskDate.setUTCHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setUTCHours(0, 0, 0, 0);

  // Always include the exact original date (even if task is done)
  if (checkDate.getTime() === taskDate.getTime()) return true;

  // If date is before task's original date, it doesn't recur (except exact match already handled)
  if (checkDate < taskDate) return false;

  // If not a daily reminder, only original date matches (already handled)
  if (!task.dailyReminder) return false;

  // Daily reminder logic
  if (task.reminderType === 'everyday') {
    return true; // every day from task date onward
  } else if (task.reminderType === 'specific') {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = weekdays[checkDate.getUTCDay()];
    return task.specificDays.includes(dayOfWeek);
  }
  return false;
}

// Get tasks for a specific month/year (for calendar)
router.get('/month', authMiddleware, async (req, res) => {
  try {
    const { year, month } = req.query; // month is 0-based (Jan = 0)
    if (!year || month === undefined) {
      return res.status(400).json({ error: 'Year and month required' });
    }

    // Fetch all tasks for the user
    const allTasks = await Task.find({ userId: req.session.userId });

    // Generate date range for the month
    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)); // last day of month

    const tasksForMonth = [];

    // For each task, check if it appears in the month
    allTasks.forEach(task => {
      // For non-recurring tasks, just check if date is within month
      if (!task.dailyReminder) {
        const taskDate = new Date(task.date);
        taskDate.setUTCHours(0, 0, 0, 0);
        if (taskDate >= startDate && taskDate <= endDate) {
          tasksForMonth.push(task);
        }
        return;
      }

      // For recurring tasks, we need to check each day of the month (simplified)
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        if (taskRecursOnDate(task, currentDate)) {
          tasksForMonth.push(task);
          break; // task already included, no need to check further days
        }
        // Move to next day
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
    });

    res.json(tasksForMonth);
  } catch (err) {
    console.error('Error in /month:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all tasks (for task list page) with sorting
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { sort = 'desc' } = req.query; // 'asc' or 'desc' by createdAt
    const sortOrder = sort === 'asc' ? 1 : -1;
    const tasks = await Task.find({ userId: req.session.userId })
      .sort({ createdAt: sortOrder });
    res.json(tasks);
  } catch (err) {
    console.error('Error in GET /:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tasks for a specific date
router.get('/date/:date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;
    const checkDate = new Date(date);
    checkDate.setUTCHours(0, 0, 0, 0);

    // Fetch all tasks for the user
    const allTasks = await Task.find({ userId: req.session.userId });

    // Filter tasks that recur on this date
    const tasksForDate = allTasks.filter(task => taskRecursOnDate(task, checkDate));

    res.json(tasksForDate);
  } catch (err) {
    console.error('Error in /date/:date:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a single task by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.session.userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    console.error('Error in GET /:id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a task
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { taskName, taskDetails, date, time, dailyReminder, reminderType, specificDays, status } = req.body;
    if (!taskName || !date) {
      return res.status(400).json({ error: 'Task name and date required' });
    }
    const task = new Task({
      userId: req.session.userId,
      taskName,
      taskDetails,
      date: new Date(date),
      time: time || '',
      dailyReminder: dailyReminder || false,
      reminderType: reminderType || '',
      specificDays: specificDays || [],
      status: status || 'In Progress'
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error('Error in POST /:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a task
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent userId and time from being changed
    delete updates.userId;
    delete updates.time;

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.session.userId },
      updates,
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    console.error('Error in PUT /:id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId: req.session.userId });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('Error in DELETE /:id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;