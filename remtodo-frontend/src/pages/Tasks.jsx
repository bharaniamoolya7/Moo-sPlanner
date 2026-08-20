import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { storageService } from '../services/storageService';
import './Tasks.css';

const PRIORITIES = ['Low', 'Medium', 'High'];
const CATEGORIES = ['General', 'College', 'Coding', 'Personal', 'Project', 'Study'];

export default function Tasks() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', priority: 'Medium', category: 'General',
    dueDate: '', dueTime: '', completed: false,
  });

  useEffect(() => {
    loadTasks();
  }, [user?.id]);

  const loadTasks = async () => {
    setLoading(true);
    const data = await storageService.getItems(user?.id, 'tasks', `/api/tasks/user/${user?.id}`);
    setTasks(data);
    setLoading(false);
  };

  const openNewTask = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', priority: 'Medium', category: 'General', dueDate: '', dueTime: '', completed: false });
    setShowModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'Medium',
      category: task.category || 'General',
      dueDate: task.dueDate || '',
      dueTime: task.dueTime || '',
      completed: !!task.completed,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast('Task needs a title!', 'error'); return; }

    const taskData = { ...form, userId: user?.id };
    const saved = await storageService.saveItem(user?.id, 'tasks', taskData, '/api/tasks', editingTask?.id);

    if (editingTask) {
      setTasks(prev => prev.map(t => String(t.id) === String(editingTask.id) ? saved : t));
      showToast('Task updated ♡');
    } else {
      setTasks(prev => [saved, ...prev]);
      showToast('Task created ♡');
    }
    setShowModal(false);
  };

  const toggleTask = async (taskId) => {
    const task = tasks.find(t => String(t.id) === String(taskId));
    if (!task) return;
    const updated = { ...task, completed: !task.completed };
    const saved = await storageService.saveItem(user?.id, 'tasks', updated, '/api/tasks', taskId);
    setTasks(prev => prev.map(t => String(t.id) === String(taskId) ? saved : t));
    showToast(updated.completed ? 'Task completed! ⭐' : 'Task reopened');
  };

  const deleteTask = async (taskId) => {
    await storageService.deleteItem(user?.id, 'tasks', taskId, '/api/tasks');
    setTasks(prev => prev.filter(t => String(t.id) !== String(taskId)));
    showToast('Task deleted');
  };

  // Filtering
  const today = new Date().toISOString().split('T')[0];
  const filtered = tasks.filter(t => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    switch (filter) {
      case 'today': return t.dueDate === today;
      case 'upcoming': return t.dueDate > today && !t.completed;
      case 'completed': return t.completed;
      case 'high': return t.priority === 'High' && !t.completed;
      default: return true;
    }
  });

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1 className="page-title">✓ Tasks</h1>
        <button className="btn btn-primary btn-sm" onClick={openNewTask}>+ New Task</button>
      </div>

      {/* Stats */}
      <div className="tasks-stats">
        <div className="task-stat">
          <span className="task-stat-num">{pendingCount}</span>
          <span className="task-stat-label">Pending</span>
        </div>
        <div className="task-stat">
          <span className="task-stat-num">{completedCount}</span>
          <span className="task-stat-label">Done</span>
        </div>
        <div className="task-stat">
          <span className="task-stat-num">{tasks.length}</span>
          <span className="task-stat-label">Total</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="tasks-toolbar">
        <div className="tasks-filters">
          {['all', 'today', 'upcoming', 'completed', 'high'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'high' ? '🔴 High' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="input-field tasks-search"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Task list */}
      <div className="tasks-list">
        {loading ? (
          <div className="loading-spinner"></div>
        ) : filtered.length > 0 ? (
          filtered.map(task => (
            <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
              <label className="pixel-checkbox">
                <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} />
                <div className="task-card-content">
                  <span className={`task-card-title ${task.completed ? 'task-text-done' : ''}`}>
                    {task.title}
                  </span>
                  {task.description && <p className="task-card-desc">{task.description}</p>}
                  <div className="task-card-meta">
                    {task.priority && <span className={`badge badge-${task.priority === 'High' ? 'red' : task.priority === 'Medium' ? 'yellow' : 'green'}`}>{task.priority}</span>}
                    {task.category && <span className="badge badge-blue">{task.category}</span>}
                    {task.dueDate && <span className="task-card-due">📅 {task.dueDate}</span>}
                  </div>
                </div>
              </label>
              <div className="task-card-actions">
                <button className="task-action-btn" onClick={() => openEditTask(task)} title="Edit">✎</button>
                <button className="task-action-btn delete" onClick={() => deleteTask(task.id)} title="Delete">✕</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <div className="empty-state-text">No tasks here!</div>
            <div className="empty-state-sub">Click "+ New Task" to add one ♡</div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="pixel-card-header">
              {editingTask ? '✎ Edit Task' : '+ New Task'}
            </div>
            <form onSubmit={handleSave} style={{ padding: 20 }}>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input type="text" className="input-field" placeholder="What do you need to do?" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} autoFocus />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" placeholder="Details (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
              </div>
              <div className="form-row">
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Priority</label>
                  <select className="input-field" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Due Date</label>
                  <input type="date" className="input-field" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Due Time</label>
                  <input type="time" className="input-field" value={form.dueTime} onChange={e => setForm(p => ({ ...p, dueTime: e.target.value }))} />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{editingTask ? 'Save Changes ♡' : 'Add Task ♡'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
