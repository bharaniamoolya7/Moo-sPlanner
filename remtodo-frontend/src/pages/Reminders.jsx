import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { storageService } from '../services/storageService';

export default function Reminders() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', dueTime: '', repeat: 'none', completed: false });

  useEffect(() => {
    loadReminders();
  }, [user?.id]);

  const loadReminders = async () => {
    setLoading(true);
    const data = await storageService.getItems(user?.id, 'reminders', `/api/reminders/user/${user?.id}`);
    setReminders(data);
    setLoading(false);
  };

  const openNew = () => {
    setEditingItem(null);
    setForm({ title: '', description: '', dueDate: '', dueTime: '', repeat: 'none', completed: false });
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditingItem(r);
    setForm({
      title: r.title || '',
      description: r.description || '',
      dueDate: r.dueDate || '',
      dueTime: r.dueTime || '',
      repeat: r.repeat || r.repeatSchedule || 'none',
      completed: !!r.completed
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast('Add a title!', 'error');
      return;
    }
    
    const payload = { ...form, userId: user?.id };
    const saved = await storageService.saveItem(user?.id, 'reminders', payload, '/api/reminders', editingItem?.id);
    
    if (editingItem) {
      setReminders(p => p.map(r => String(r.id) === String(editingItem.id) ? saved : r));
      showToast('Reminder updated ♡');
    } else {
      setReminders(p => [saved, ...p]);
      showToast('Reminder saved ♡');
    }
    
    setShowModal(false);
  };

  const toggleComplete = async (r) => {
    const updated = { ...r, completed: !r.completed };
    const saved = await storageService.saveItem(user?.id, 'reminders', updated, '/api/reminders', r.id);
    setReminders(p => p.map(x => String(x.id) === String(r.id) ? saved : x));
    showToast(updated.completed ? 'Reminder done! ✓' : 'Reminder reopened');
  };

  const deleteReminder = async (id) => {
    await storageService.deleteItem(user?.id, 'reminders', id, '/api/reminders');
    setReminders(p => p.filter(r => String(r.id) !== String(id)));
    showToast('Reminder deleted');
  };

  const active = reminders.filter(r => !r.completed);
  const done = reminders.filter(r => r.completed);

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1 className="page-title">🔔 Reminders</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Reminder</button>
      </div>

      <div className="tasks-list">
        {loading ? (
          <div className="loading-spinner"></div>
        ) : active.length > 0 ? (
          active.map(r => (
            <div key={r.id} className="task-card">
              <div className="task-card-content" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 24 }}>⏰</span>
                <div style={{ flex: 1 }}>
                  <span className="task-card-title">{r.title}</span>
                  {r.description && <p className="task-card-desc">{r.description}</p>}
                  <div className="task-card-meta">
                    {r.dueDate && <span className="task-card-due">📅 {r.dueDate}</span>}
                    {r.dueTime && <span className="task-card-due">⏰ {r.dueTime}</span>}
                    {(r.repeat && r.repeat !== 'none') && <span className="badge badge-blue">🔄 {r.repeat}</span>}
                  </div>
                </div>
              </div>
              <div className="task-card-actions">
                <button className="task-action-btn" onClick={() => toggleComplete(r)} title="Complete">✓</button>
                <button className="task-action-btn" onClick={() => openEdit(r)}>✎</button>
                <button className="task-action-btn delete" onClick={() => deleteReminder(r.id)}>✕</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <div className="empty-state-text">No reminders</div>
            <div className="empty-state-sub">Add something to remember ♡</div>
          </div>
        )}
      </div>

      {done.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: 20, marginBottom: 12, color: 'var(--brown-muted)' }}>Completed</h3>
          <div className="tasks-list">
            {done.map(r => (
              <div key={r.id} className="task-card completed">
                <div className="task-card-content" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 24 }}>✅</span>
                  <div>
                    <span className="task-card-title task-text-done">{r.title}</span>
                    <div className="task-card-meta">
                      {r.dueDate && <span className="task-card-due">📅 {r.dueDate}</span>}
                    </div>
                  </div>
                </div>
                <div className="task-card-actions">
                  <button className="task-action-btn" onClick={() => toggleComplete(r)} title="Undo">↩</button>
                  <button className="task-action-btn delete" onClick={() => deleteReminder(r.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="pixel-card-header">{editingItem ? '✎ Edit Reminder' : '+ New Reminder'}</div>
            <form onSubmit={handleSave} style={{ padding: 20 }}>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Remind me to..."
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  autoFocus
                />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea
                  className="input-field"
                  placeholder="Details (optional)"
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                />
              </div>
              <div className="form-row">
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.dueDate}
                    onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                  />
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Time</label>
                  <input
                    type="time"
                    className="input-field"
                    value={form.dueTime}
                    onChange={e => setForm(p => ({ ...p, dueTime: e.target.value }))}
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Repeat</label>
                <select
                  className="input-field"
                  value={form.repeat}
                  onChange={e => setForm(p => ({ ...p, repeat: e.target.value }))}
                >
                  <option value="none">Don't repeat</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save ♡</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
