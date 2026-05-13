import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './index.css';

/* const API_URL = 'http://localhost:5000/todos'; */
const API_URL = 'http://YOUR_PUBLIC_IP:5000/todos';

// ── Icons ─────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// ── Todo Item ─────────────────────────────────────────────
function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [editing, setEditing]   = useState(false);
  const [editVal, setEditVal]   = useState(todo.title);
  const inputRef                = useRef(null);

  const startEdit = () => {
    setEditing(true);
    setEditVal(todo.title);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const saveEdit = async () => {
    const trimmed = editVal.trim();
    if (!trimmed) { setEditing(false); setEditVal(todo.title); return; }
    if (trimmed !== todo.title) await onEdit(todo._id, trimmed);
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter')  saveEdit();
    if (e.key === 'Escape') { setEditing(false); setEditVal(todo.title); }
  };

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {/* Checkbox */}
      <button
        className={`check-btn ${todo.completed ? 'checked' : ''}`}
        onClick={() => onToggle(todo._id, todo.completed)}
        title={todo.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {todo.completed && <CheckIcon />}
      </button>

      {/* Title / Edit Input */}
      <div className="item-body">
        {editing ? (
          <input
            ref={inputRef}
            className="edit-input"
            value={editVal}
            onChange={e => setEditVal(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKey}
          />
        ) : (
          <span className={`item-title ${todo.completed ? 'done-text' : ''}`} onDoubleClick={startEdit}>
            {todo.title}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="item-actions">
        {!editing && (
          <button className="action-btn edit-btn" onClick={startEdit} title="Edit">
            <EditIcon />
          </button>
        )}
        <button className="action-btn del-btn" onClick={() => onDelete(todo._id)} title="Delete">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────
export default function App() {
  const [todos,  setTodos]  = useState([]);
  const [input,  setInput]  = useState('');
  const [filter, setFilter] = useState('all');
  const [error,  setError]  = useState('');

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    try {
      const r = await axios.get(API_URL);
      setTodos(r.data);
    } catch (e) {
      setError('Could not load todos. Is the backend running?');
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = input.trim();
    if (!trimmed) return;
    try {
      const r = await axios.post(API_URL, { title: trimmed });
      setTodos(prev => [r.data, ...prev]);
      setInput('');
    } catch (e) {
      setError('Failed to add todo.');
    }
  };

  const toggleTodo = async (id, current) => {
    try {
      const r = await axios.put(`${API_URL}/${id}`, { completed: !current });
      setTodos(prev => prev.map(t => t._id === id ? r.data : t));
    } catch (e) {
      console.error(e);
    }
  };

  const editTodo = async (id, title) => {
    try {
      const r = await axios.put(`${API_URL}/${id}`, { title });
      setTodos(prev => prev.map(t => t._id === id ? r.data : t));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(prev => prev.filter(t => t._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const clearCompleted = async () => {
    const completed = todos.filter(t => t.completed);
    await Promise.all(completed.map(t => axios.delete(`${API_URL}/${t._id}`)));
    setTodos(prev => prev.filter(t => !t.completed));
  };

  // Filter
  const filtered = todos.filter(t => {
    if (filter === 'active')    return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount    = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>✓ My Todos</h1>
        <p className="subtitle">Stay organised, one task at a time</p>
      </header>

      <main className="container">

        {/* Add Form */}
        <form className="add-form" onSubmit={addTodo}>
          <input
            className="add-input"
            type="text"
            placeholder="What needs to be done?"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button className="add-btn" type="submit">Add</button>
        </form>
        {error && <p className="error-msg">⚠ {error}</p>}

        {/* Stats bar */}
        {todos.length > 0 && (
          <div className="stats-bar">
            <span><strong>{activeCount}</strong> remaining</span>
            <div className="filter-group">
              {['all', 'active', 'completed'].map(f => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            {completedCount > 0 && (
              <button className="clear-btn" onClick={clearCompleted}>
                Clear completed ({completedCount})
              </button>
            )}
          </div>
        )}

        {/* Todo List */}
        <div className="todo-list">
          {filtered.length === 0 && todos.length > 0 && (
            <div className="empty">No {filter} todos.</div>
          )}
          {todos.length === 0 && (
            <div className="empty">Nothing here yet — add your first todo above!</div>
          )}
          {filtered.map(todo => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onEdit={editTodo}
            />
          ))}
        </div>

        {/* Hint */}
        {todos.length > 0 && (
          <p className="hint">Double-click a todo to edit it inline.</p>
        )}
      </main>
    </div>
  );
}
