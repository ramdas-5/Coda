// public/js/calendar.js (full file after fix)
document.addEventListener('DOMContentLoaded', () => {
  const monthYearDisplay = document.getElementById('monthYearDisplay');
  const calendarGrid = document.getElementById('calendarGrid');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const taskPanel = document.getElementById('taskPanel');
  const selectedDateInput = document.getElementById('selectedDate');
  const selectedDateDisplay = document.getElementById('selectedDateDisplay');
  const taskForm = document.getElementById('taskForm');
  const taskIdInput = document.getElementById('taskId');
  const taskNameInput = document.getElementById('taskName');
  const taskDetailsInput = document.getElementById('taskDetails');
  const dailyReminderCheck = document.getElementById('dailyReminder');
  const reminderOptions = document.getElementById('reminderOptions');
  const reminderTypeRadios = document.getElementsByName('reminderType');
  const specificDaysDiv = document.getElementById('specificDays');
  const taskStatusSelect = document.getElementById('taskStatus');
  const cancelTaskBtn = document.getElementById('cancelTask');
  const tasksForDateDiv = document.getElementById('tasksForDate');

  let currentDate = new Date();
  let currentYear = currentDate.getFullYear();
  let currentMonth = currentDate.getMonth(); // 0-11
  let tasks = []; // tasks for current month

  // Initialize calendar
  renderCalendar();

  // Event listeners
  prevMonthBtn.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });

  nextMonthBtn.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });

  dailyReminderCheck.addEventListener('change', () => {
    reminderOptions.style.display = dailyReminderCheck.checked ? 'block' : 'none';
  });

  reminderTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      specificDaysDiv.style.display = e.target.value === 'specific' ? 'block' : 'none';
    });
  });

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const date = selectedDateInput.value;
    if (!date) return;

    const taskData = {
      taskName: taskNameInput.value,
      taskDetails: taskDetailsInput.value,
      date: date,
      dailyReminder: dailyReminderCheck.checked,
      status: taskStatusSelect.value
    };

    // If creating a new task, set time to current time
    const taskId = taskIdInput.value;
    if (!taskId) {
      // Get current time in HH:MM AM/PM format (or 24h)
      const now = new Date();
      taskData.time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // For edits, do NOT include time, so existing time remains

    if (dailyReminderCheck.checked) {
      const reminderType = document.querySelector('input[name="reminderType"]:checked').value;
      taskData.reminderType = reminderType;
      if (reminderType === 'specific') {
        const checkboxes = specificDaysDiv.querySelectorAll('input[type="checkbox"]:checked');
        taskData.specificDays = Array.from(checkboxes).map(cb => cb.value);
      } else {
        taskData.specificDays = [];
      }
    } else {
      taskData.reminderType = '';
      taskData.specificDays = [];
    }

    let url = '/api/tasks';
    let method = 'POST';
    if (taskId) {
      url = `/api/tasks/${taskId}`;
      method = 'PUT';
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        resetTaskForm();
        await renderCalendar(); // refresh tasks
        await loadTasksForDate(date); // reload right panel
      } else {
        alert('Error saving task');
      }
    } catch (err) {
      alert('Network error');
    }
  });

  cancelTaskBtn.addEventListener('click', () => {
    taskPanel.style.display = 'none';
    resetTaskForm();
  });

  async function renderCalendar() {
    // Fix: use currentYear and currentMonth to display month and year
    monthYearDisplay.textContent = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' }) + ' ' + currentYear;
    await fetchTasksForMonth();
    buildCalendar();
  }

  async function fetchTasksForMonth() {
    try {
      const res = await fetch(`/api/tasks/month?year=${currentYear}&month=${currentMonth}`);
      if (res.ok) {
        tasks = await res.json();
      } else {
        tasks = [];
      }
    } catch (err) {
      tasks = [];
    }
  }

  function buildCalendar() {
    const firstDayOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1));
    const startingDayOfWeek = firstDayOfMonth.getUTCDay(); // 0 = Sunday
    const daysInMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();

    // Clear grid and add weekday headers
    calendarGrid.innerHTML = '';
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
      const header = document.createElement('div');
      header.className = 'weekday';
      header.textContent = day;
      calendarGrid.appendChild(header);
    });

    // Add empty cells for days before month start
    for (let i = 0; i < startingDayOfWeek; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day empty';
      calendarGrid.appendChild(emptyCell);
    }

    // Add days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      cell.dataset.date = dateStr;

      // Day number
      const dayNumber = document.createElement('div');
      dayNumber.className = 'day-number';
      dayNumber.textContent = d;
      cell.appendChild(dayNumber);

      // Check for tasks on this day
      const tasksForDay = tasks.filter(task => {
        const taskDate = new Date(task.date).toISOString().split('T')[0];
        return taskDate === dateStr;
      });

      if (tasksForDay.length > 0) {
        cell.classList.add('highlighted');
        // Show first task name on hover
        cell.title = tasksForDay.map(t => t.taskName).join(' • ');

        // Add mini indicators (for visual)
        tasksForDay.forEach(task => {
          const indicator = document.createElement('div');
          indicator.className = `task-indicator ${task.status === 'Done' ? 'done' : ''}`;
          indicator.textContent = task.taskName.substring(0, 10) + (task.taskName.length > 10 ? '…' : '');
          cell.appendChild(indicator);
        });
      }

      // Hover popup
      cell.addEventListener('mouseenter', (e) => {
        // Show "Add Task" tooltip only if no tasks? Requirement: hover on a date → show popup "Add Task"
        // We'll use a simple title for now
        if (!cell.title) {
          cell.title = 'Add Task';
        }
      });

      cell.addEventListener('click', () => {
        openTaskPanel(dateStr);
      });

      calendarGrid.appendChild(cell);
    }
  }

  async function openTaskPanel(dateStr) {
    taskPanel.style.display = 'grid';
    selectedDateInput.value = dateStr;
    selectedDateDisplay.textContent = dateStr;
    resetTaskForm();
    await loadTasksForDate(dateStr);
  }

  async function loadTasksForDate(dateStr) {
    try {
      const res = await fetch(`/api/tasks/date/${dateStr}`);
      if (res.ok) {
        const tasks = await res.json();
        displayTasksForDate(tasks);
      } else {
        tasksForDateDiv.innerHTML = '<p>No task yet</p>';
      }
    } catch (err) {
      tasksForDateDiv.innerHTML = '<p>Error loading tasks</p>';
    }
  }

  function displayTasksForDate(tasks) {
    if (tasks.length === 0) {
      tasksForDateDiv.innerHTML = '<p>No task yet</p>';
      return;
    }
    let html = '';
    tasks.forEach(task => {
      html += `
        <div class="task-item ${task.status === 'Done' ? 'done' : ''}" data-task-id="${task._id}">
          <h4>${task.taskName}</h4>
          <p>${task.taskDetails || ''}</p>
          <p><small>${task.time || ''} - ${task.status}</small></p>
          <div class="task-actions">
            <button class="edit-task">Edit</button>
            <button class="delete-task">Delete</button>
          </div>
        </div>
      `;
    });
    tasksForDateDiv.innerHTML = html;

    // Attach event listeners to edit/delete buttons
    tasksForDateDiv.querySelectorAll('.edit-task').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const taskDiv = btn.closest('.task-item');
        const taskId = taskDiv.dataset.taskId;
        editTask(taskId);
      });
    });

    tasksForDateDiv.querySelectorAll('.delete-task').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const taskDiv = btn.closest('.task-item');
        const taskId = taskDiv.dataset.taskId;
        if (confirm('Delete task?')) {
          await deleteTask(taskId);
        }
      });
    });
  }

  async function editTask(taskId) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error();
      const task = await res.json();
      // Populate form
      taskIdInput.value = task._id;
      taskNameInput.value = task.taskName;
      taskDetailsInput.value = task.taskDetails || '';
      dailyReminderCheck.checked = task.dailyReminder;
      reminderOptions.style.display = task.dailyReminder ? 'block' : 'none';
      taskStatusSelect.value = task.status;

      if (task.dailyReminder) {
        const reminderType = task.reminderType || 'everyday';
        document.querySelector(`input[name="reminderType"][value="${reminderType}"]`).checked = true;
        specificDaysDiv.style.display = reminderType === 'specific' ? 'block' : 'none';
        // set specific days checkboxes
        const specificCheckboxes = specificDaysDiv.querySelectorAll('input[type="checkbox"]');
        specificCheckboxes.forEach(cb => {
          cb.checked = task.specificDays.includes(cb.value);
        });
      } else {
        // reset reminder options
        document.querySelector('input[name="reminderType"][value="everyday"]').checked = true;
        specificDaysDiv.style.display = 'none';
        const specificCheckboxes = specificDaysDiv.querySelectorAll('input[type="checkbox"]');
        specificCheckboxes.forEach(cb => cb.checked = false);
      }
    } catch (err) {
      alert('Error loading task');
    }
  }

  async function deleteTask(taskId) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        const date = selectedDateInput.value;
        await renderCalendar();
        await loadTasksForDate(date);
      } else {
        alert('Error deleting task');
      }
    } catch (err) {
      alert('Network error');
    }
  }

  function resetTaskForm() {
    taskIdInput.value = '';
    taskForm.reset();
    reminderOptions.style.display = 'none';
    specificDaysDiv.style.display = 'none';
    document.querySelector('input[name="reminderType"][value="everyday"]').checked = true;
  }
});