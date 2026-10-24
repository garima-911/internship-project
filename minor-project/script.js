// State Management
let tasks = JSON.parse(localStorage.getItem('myTasks')) || [];
let currentFilter = 'all';

// DOM Elements
const taskForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const taskList = document.getElementById('task-list');
const currentDateEl = document.getElementById('current-date');
const totalCountEl = document.getElementById('total-count');
const completedCountEl = document.getElementById('completed-count');
const filterButtons = document.querySelectorAll('.filter-btn');
const emptyState = document.getElementById('empty-state');

// Display Current Date
function setHeaderDate() {
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const today = new Date();
  currentDateEl.textContent = today.toLocaleDateString('en-US', options);
}

// Save to LocalStorage
function saveTasks() {
  localStorage.setItem('myTasks', JSON.stringify(tasks));
}

// Render Tasks
function renderTasks() {
  taskList.innerHTML = '';

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true; // 'all'
  });

  // Toggle empty state message
  if (filteredTasks.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }

  // Create HTML for each task
  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;

    li.innerHTML = `
      <div class="task-content">
        <input 
          type="checkbox" 
          class="task-checkbox" 
          ${task.completed ? 'checked' : ''} 
          onchange="toggleTask(${task.id})"
        />
        <span class="task-text">${escapeHTML(task.text)}</span>
        <span class="badge ${task.priority}">${task.priority}</span>
      </div>
      <button class="delete-btn" onclick="deleteTask(${task.id})">&times;</button>
    `;

    taskList.appendChild(li);
  });

  updateStats();
}

// Add New Task
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now(),
    text: text,
    priority: prioritySelect.value,
    completed: false
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = '';
  prioritySelect.value = 'medium';
});

// Toggle Task Completion
function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });

  saveTasks();
  renderTasks();
}

// Delete Task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// Update Counters
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;

  totalCountEl.textContent = total;
  completedCountEl.textContent = completed;
}

// Handle Filter Switch
filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

// Helper: Escape HTML to prevent XSS
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// Initial Run
setHeaderDate();
renderTasks();