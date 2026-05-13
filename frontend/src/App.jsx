import React, { useState, useEffect } from 'react';
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

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// ── Edit Modal ─────────────────────────────────────────────
function EditModal({ todo, onClose, onSave }) {
  const [title, setTitle]       = useState(todo.title);
  const [desc,  setDesc]        = useState(todo.description || '');
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Title is required.'); return; }
    setSaving(true);
    await onSave(todo._id, { title: title.trim(), description: desc.trim() });
    setSaving(false);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Edit Todo</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mfield">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Todo title..."
              autoFocus
            />
          </div>
          <div className="mfield">
            <label>Description</label>
            <textarea
              rows="4"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Add more details (optional)..."
            />
          </div>
          {error && <p className="field-error">{error}</p>}
          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-indigo" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Todo Card ─────────────────────────────────────────────
function TodoCard({ todo, onToggle, onEdit, onDelete }) {
  return (
    <div className={`todo-card ${todo.completed ? 'is-done' : ''}`}>
      {/* Complete button */}
      <button
        className={`check-btn ${todo.completed ? 'checked' : ''}`}
        onClick={() => onToggle(todo._id, todo.completed)}
        title={todo.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {todo.completed && <CheckIcon />}
      </button>

      {/* Content */}
      <div className="card-content">
        <span className={`card-title ${todo.completed ? 'struck' : ''}`}>
          {todo.title}
        </span>
        {todo.description && (
          <p className={`card-desc ${todo.completed ? 'struck' : ''}`}>
            {todo.description}
          </p>
        )}
        <span className="card-date">
          {new Date(todo.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>

      {/* Actions */}
      <div className="card-actions">
        <button className="action-btn edit-btn" onClick={() => onEdit(todo)} title="Edit">
          <EditIcon />
        </button>
        <button className="action-btn del-btn" onClick={() => onDelete(todo._id)} title="Delete">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────
export default function App() {
  const [todos,     setTodos]     = useState([]);
  const [title,     setTitle]     = useState('');
  const [desc,      setDesc]      = useState('');
  const [filter,    setFilter]    = useState('all');
  const [editTodo,  setEditTodo]  = useState(null);
  const [error,     setError]     = useState('');
  const [adding,    setAdding]    = useState(false);

  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    try {
      const r = await axios.get(API_URL);
      setTodos(r.data);
    } catch {
      setError('Could not connect to the backend.');
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Title is required.'); return; }
    setAdding(true);
    try {
      const r = await axios.post(API_URL, { title: title.trim(), description: desc.trim() });
      setTodos(prev => [r.data, ...prev]);
      setTitle('');
      setDesc('');
    } catch {
      setError('Failed to add todo.');
    } finally {
      setAdding(false);
    }
  };

  const toggleTodo = async (id, current) => {
    try {
      const r = await axios.put(`${API_URL}/${id}`, { completed: !current });
      setTodos(prev => prev.map(t => t._id === id ? r.data : t));
    } catch (e) { console.error(e); }
  };

  const saveEdit = async (id, payload) => {
    try {
      const r = await axios.put(`${API_URL}/${id}`, payload);
      setTodos(prev => prev.map(t => t._id === id ? r.data : t));
      setEditTodo(null);
    } catch (e) { console.error(e); }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(prev => prev.filter(t => t._id !== id));
    } catch (e) { console.error(e); }
  };

  const clearCompleted = async () => {
    const done = todos.filter(t => t.completed);
    await Promise.all(done.map(t => axios.delete(`${API_URL}/${t._id}`)));
    setTodos(prev => prev.filter(t => !t.completed));
  };

  // Stats
  const total     = todos.length;
  const remaining = todos.filter(t => !t.completed).length;
  const doneCount = todos.filter(t =>  t.completed).length;

  // Filtered list
  const list = todos.filter(t => {
    if (filter === 'active')    return !t.completed;
    if (filter === 'completed') return  t.completed;
    return true;
  });

  return (
    <div className="app">

      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">✓</div>
          <div>
            <h1>My Todos</h1>
            <p className="subtitle">Stay organised, one task at a time</p>
          </div>
        </div>
        {total > 0 && (
          <div className="header-stats">
            <span className="stat-chip chip-total">{total} Total</span>
            <span className="stat-chip chip-active">{remaining} Remaining</span>
            <span className="stat-chip chip-done">{doneCount} Done</span>
          </div>
        )}
      </header>

      <main className="container">

        {/* Add Form */}
        <section className="add-card">
          <h2 className="card-label">Add New Todo</h2>
          <form className="add-form" onSubmit={addTodo}>
            <input
              className="field-input"
              type="text"
              placeholder="Title *"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <textarea
              className="field-input"
              rows="2"
              placeholder="Description (optional)..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
            {error && <p className="form-error">⚠ {error}</p>}
            <div className="form-footer">
              <button className="btn-indigo" type="submit" disabled={adding}>
                {adding ? 'Adding...' : '+ Add Todo'}
              </button>
            </div>
          </form>
        </section>

        {/* Toolbar */}
        {total > 0 && (
          <div className="toolbar">
            <div className="filter-tabs">
              {['all', 'active', 'completed'].map(f => (
                <button
                  key={f}
                  className={`tab-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="toolbar-right">
              <span className="count-label">{list.length} shown</span>
              {doneCount > 0 && (
                <button className="clear-btn" onClick={clearCompleted}>
                  Clear completed ({doneCount})
                </button>
              )}
            </div>
          </div>
        )}

        {/* List */}
        <div className="todo-list">
          {list.length === 0 && total > 0 && (
            <div className="empty">No {filter} todos.</div>
          )}
          {total === 0 && (
            <div className="empty">Nothing here yet — add your first todo above!</div>
          )}
          {list.map(todo => (
            <TodoCard
              key={todo._id}
              todo={todo}
              onToggle={toggleTodo}
              onEdit={setEditTodo}
              onDelete={deleteTodo}
            />
          ))}
        </div>
      </main>

      {/* Edit Modal */}
      {editTodo && (
        <EditModal
          todo={editTodo}
          onClose={() => setEditTodo(null)}
          onSave={saveEdit}
        />
      )}
    </div>
  );
}
