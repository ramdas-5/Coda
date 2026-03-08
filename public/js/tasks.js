// public/js/tasks.js (full file after fix)
document.addEventListener('DOMContentLoaded', () => {
  const taskListContainer = document.getElementById('taskListContainer');
  const sortOrderSelect = document.getElementById('sortOrder');
  const modal = document.getElementById('taskModal');
  const closeModal = document.querySelector('.close');
  const cancelModalBtn = document.querySelector('.cancel');
  const editTaskForm = document.getElementById('editTaskForm');
  const deleteTaskBtn = document.getElementById('deleteTaskBtn');

  let currentEditTaskId = null;

  loadTasks('desc');

  sortOrderSelect.addEventListener('change', () => {
    loadTasks(sortOrderSelect.value);
  });

  async function loadTasks(sort) {
    try {
      const res = await fetch(`/api/tasks?sort=${sort}`);
      if (res.ok) {
        const tasks = await res.json();
        displayTasks(tasks);
      } else {
        taskListContainer.innerHTML = '<p>Error loading tasks</p>';
      }
    } catch (err) {
      taskListContainer.innerHTML = '<p>Network error</p>';
    }
  }

  function displayTasks(tasks) {
    if (tasks.length === 0) {
      taskListContainer.innerHTML = '<p>No tasks found</p>';
      return;
    }
    let html = '';
    tasks.forEach(task => {
      const taskDate = new Date(task.date).toLocaleDateString();
      html += `
        <div class="task-list-item ${task.status === 'Done' ? 'done' : ''}" data-task-id="${task._id}">
          <div class="task-info">
            <h3>${task.taskName}</h3>
            <p class="task-meta">${taskDate} ${task.time ? 'at ' + task.time : ''} - ${task.status}</p>
          </div>
        </div>
      `;
    });
    taskListContainer.innerHTML = html;

    // Add click event to each item to open modal
    document.querySelectorAll('.task-list-item').forEach(item => {
      item.addEventListener('click', () => {
        const taskId = item.dataset.taskId;
        openEditModal(taskId);
      });
    });
  }

  async function openEditModal(taskId) {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      if (!res.ok) throw new Error();
      const task = await res.json();
      currentEditTaskId = task._id;
      document.getElementById('editTaskId').value = task._id;
      document.getElementById('editTaskName').value = task.taskName;
      document.getElementById('editTaskDetails').value = task.taskDetails || '';
      document.getElementById('editTaskDate').value = task.date.split('T')[0];
      // Time field removed
      document.getElementById('editDailyReminder').checked = task.dailyReminder;
      document.getElementById('editReminderOptions').style.display = task.dailyReminder ? 'block' : 'none';
      document.getElementById('editTaskStatus').value = task.status;

      if (task.dailyReminder) {
        const reminderType = task.reminderType || 'everyday';
        document.querySelector(`input[name="editReminderType"][value="${reminderType}"]`).checked = true;
        document.getElementById('editSpecificDays').style.display = reminderType === 'specific' ? 'block' : 'none';
        const specificCheckboxes = document.querySelectorAll('#editSpecificDays input[type="checkbox"]');
        specificCheckboxes.forEach(cb => {
          cb.checked = task.specificDays.includes(cb.value);
        });
      } else {
        document.querySelector('input[name="editReminderType"][value="everyday"]').checked = true;
        document.getElementById('editSpecificDays').style.display = 'none';
        document.querySelectorAll('#editSpecificDays input[type="checkbox"]').forEach(cb => cb.checked = false);
      }

      modal.style.display = 'block';
    } catch (err) {
      alert('Error loading task');
    }
  }

  // Handle reminder toggle in modal
  document.getElementById('editDailyReminder').addEventListener('change', (e) => {
    document.getElementById('editReminderOptions').style.display = e.target.checked ? 'block' : 'none';
  });

  document.getElementsByName('editReminderType').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.getElementById('editSpecificDays').style.display = e.target.value === 'specific' ? 'block' : 'none';
    });
  });

  editTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentEditTaskId) return;

    const taskData = {
      taskName: document.getElementById('editTaskName').value,
      taskDetails: document.getElementById('editTaskDetails').value,
      date: document.getElementById('editTaskDate').value,
      dailyReminder: document.getElementById('editDailyReminder').checked,
      status: document.getElementById('editTaskStatus').value
    };

    if (taskData.dailyReminder) {
      const reminderType = document.querySelector('input[name="editReminderType"]:checked').value;
      taskData.reminderType = reminderType;
      if (reminderType === 'specific') {
        const checkboxes = document.querySelectorAll('#editSpecificDays input[type="checkbox"]:checked');
        taskData.specificDays = Array.from(checkboxes).map(cb => cb.value);
      } else {
        taskData.specificDays = [];
      }
    } else {
      taskData.reminderType = '';
      taskData.specificDays = [];
    }

    try {
      const res = await fetch(`/api/tasks/${currentEditTaskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        modal.style.display = 'none';
        loadTasks(sortOrderSelect.value);
      } else {
        alert('Error updating task');
      }
    } catch (err) {
      alert('Network error');
    }
  });

  deleteTaskBtn.addEventListener('click', async () => {
    if (!currentEditTaskId) return;
    if (!confirm('Delete task?')) return;
    try {
      const res = await fetch(`/api/tasks/${currentEditTaskId}`, { method: 'DELETE' });
      if (res.ok) {
        modal.style.display = 'none';
        loadTasks(sortOrderSelect.value);
      } else {
        alert('Error deleting task');
      }
    } catch (err) {
      alert('Network error');
    }
  });

  // Close modal
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  cancelModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});