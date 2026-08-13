const STORAGE_KEY = 'focus-board-todos';

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const prioritySelect = document.getElementById('priority-select');
const dueDateInput = document.getElementById('due-date');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const searchInput = document.getElementById('search-input');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalCountEl = document.getElementById('total-count');
const activeCountEl = document.getElementById('active-count');
const completedCountEl = document.getElementById('completed-count');
const dateLabel = document.getElementById('date-label');

let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentFilter = 'all';
let searchTerm = '';

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatShortDate(value) {
  if (!value) return '';

  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function updateDateLabel() {
  const today = new Date();
  dateLabel.textContent = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function renderStats() {
  const total = todos.length;
  const active = todos.filter((todo) => !todo.completed).length;
  const completed = todos.filter((todo) => todo.completed).length;

  totalCountEl.textContent = total;
  activeCountEl.textContent = active;
  completedCountEl.textContent = completed;
}

function getVisibleTodos() {
  return todos.filter((todo) => {
    const matchesFilter =
      currentFilter === 'all' ||
      (currentFilter === 'active' && !todo.completed) ||
      (currentFilter === 'completed' && todo.completed);

    const matchesSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });
}

function renderTodos() {
  const visibleTodos = getVisibleTodos();
  todoList.innerHTML = '';

  if (visibleTodos.length === 0) {
    emptyState.classList.add('visible');

    if (searchTerm) {
      emptyState.textContent = 'No tasks match your search.';
    } else if (currentFilter === 'active') {
      emptyState.textContent = 'You have no active tasks. Nice work!';
    } else if (currentFilter === 'completed') {
      emptyState.textContent = 'No completed tasks yet.';
    } else {
      emptyState.textContent = 'No tasks yet. Add one above.';
    }

    renderStats();
    return;
  }

  emptyState.classList.remove('visible');

  visibleTodos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = `todo-item ${todo.priority} ${todo.completed ? 'completed' : ''}`;

    item.innerHTML = `
      <label class="todo-main">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}" />
        <span class="task-copy">
          <span class="todo-text">${escapeHtml(todo.text)}</span>
          <span class="meta">
            <span class="priority-badge ${todo.priority}">${todo.priority}</span>
            ${todo.dueDate ? `<span class="due-date">Due ${formatShortDate(todo.dueDate)}</span>` : ''}
          </span>
        </span>
      </label>
      <button type="button" class="delete-btn" data-id="${todo.id}">Remove</button>
    `;

    todoList.appendChild(item);
  });

  renderStats();
}

function addTodo(text, priority, dueDate) {
  const trimmed = text.trim();
  if (!trimmed) {
    todoInput.focus();
    return;
  }

  todos.unshift({
    id: Date.now(),
    text: trimmed,
    completed: false,
    priority,
    dueDate,
  });

  saveTodos();
  renderTodos();
  todoForm.reset();
  prioritySelect.value = 'medium';
  dueDateInput.value = '';
  todoInput.focus();
}

function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );

  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

function clearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  renderTodos();
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTodo(todoInput.value, prioritySelect.value, dueDateInput.value);
});

todoList.addEventListener('click', (event) => {
  const target = event.target;

  if (target.matches('.delete-btn')) {
    deleteTodo(Number(target.dataset.id));
  }
});

todoList.addEventListener('change', (event) => {
  const target = event.target;

  if (target.matches('input[type="checkbox"]')) {
    toggleTodo(Number(target.dataset.id));
  }
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    renderTodos();
  });
});

searchInput.addEventListener('input', (event) => {
  searchTerm = event.target.value.trim();
  renderTodos();
});

clearCompletedBtn.addEventListener('click', () => {
  clearCompleted();
});

updateDateLabel();
renderTodos();
