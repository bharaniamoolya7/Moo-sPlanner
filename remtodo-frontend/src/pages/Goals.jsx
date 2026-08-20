import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { storageService } from '../services/storageService';

export default function Goals() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', target: 100, current: 0, unit: 'tasks', deadline: '', completed: false });

  useEffect(() => { loadGoals(); }, [user?.id]);

  const loadGoals = async () => {
    setLoading(true);
    const data = await storageService.getItems(user?.id, 'goals', `/api/goals/user/${user?.id}`);
    setGoals(data);
    setLoading(false);
  };

  const openNew = () => { setEditingItem(null); setForm({ title: '', description: '', target: 100, current: 0, unit: 'tasks', deadline: '', completed: false }); setShowModal(true); };
  const openEdit = (g) => { setEditingItem(g); setForm({ title: g.title || '', description: g.description || '', target: g.target || 100, current: g.current || 0, unit: g.unit || 'tasks', deadline: g.deadline || '', completed: !!g.completed }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast('Need a title!', 'error'); return; }
    const data = { ...form, userId: user?.id, completed: form.current >= form.target };
    
    const saved = await storageService.saveItem(user?.id, 'goals', data, '/api/goals', editingItem?.id);
    if (editingItem) { setGoals(p => p.map(g => String(g.id) === String(editingItem.id) ? saved : g)); }
    else { setGoals(p => [saved, ...p]); }
    
    showToast('Goal saved ♡');
    setShowModal(false);
  };

  const updateProgress = async (goal, increment) => {
    const newCurrent = Math.max(0, Math.min((goal.current || 0) + increment, goal.target));
    const updated = { ...goal, current: newCurrent, completed: newCurrent >= goal.target };
    const saved = await storageService.saveItem(user?.id, 'goals', updated, '/api/goals', goal.id);
    
    setGoals(p => p.map(g => String(g.id) === String(goal.id) ? saved : g));
    if (updated.completed && !goal.completed) showToast('🎉 Goal completed! Amazing!');
  };

  const confirmDelete = async (goal) => {
    await storageService.deleteItem(user?.id, 'goals', goal.id, '/api/goals');
    setGoals(p => p.filter(g => String(g.id) !== String(goal.id)));
    showToast('Goal deleted ♡');
    setDeletingItem(null);
    if (showModal) setShowModal(false);
  };

  const active = goals.filter(g => !g.completed);
  const completed = goals.filter(g => g.completed);

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1 className="page-title">⭐ Goals</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Goal</button>
      </div>

      <div className="notes-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {loading ? <div className="loading-spinner" style={{ gridColumn: '1 / -1' }}></div> : active.length > 0 ? active.map(goal => {
          const pct = goal.target > 0 ? Math.round(((goal.current || 0) / goal.target) * 100) : 0;
          return (
            <div key={goal.id} className="pixel-card">
              <div className="pixel-card-header" style={{ justifyContent: 'space-between' }}>
                <span>⭐ {goal.title}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button className="task-action-btn" title="Edit Goal" style={{ width: 22, height: 22, fontSize: 12, border: 'none', background: 'transparent', color: 'var(--brown-text)', cursor: 'pointer' }} onClick={() => openEdit(goal)}>✎</button>
                  <button className="task-action-btn" title="Delete Goal" style={{ width: 22, height: 22, fontSize: 12, border: 'none', background: 'transparent', color: '#e74c3c', cursor: 'pointer' }} onClick={() => setDeletingItem(goal)}>🗑️</button>
                </div>
              </div>
              <div className="pixel-card-body">
                {goal.description && <p style={{ fontSize: 13, color: 'var(--brown-light)', marginBottom: 10 }}>{goal.description}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span>{goal.current || 0} / {goal.target} {goal.unit}</span>
                  <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 9 }}>{pct}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                  <button className="btn btn-outline btn-sm" style={{ padding: '4px 12px', fontSize: 8 }} onClick={() => updateProgress(goal, -1)}>-1</button>
                  <button className="btn btn-pink btn-sm" style={{ padding: '4px 12px', fontSize: 8 }} onClick={() => updateProgress(goal, 1)}>+1</button>
                  <button className="btn btn-pink btn-sm" style={{ padding: '4px 12px', fontSize: 8 }} onClick={() => updateProgress(goal, 5)}>+5</button>
                </div>
                {goal.deadline && <p style={{ fontSize: 11, color: 'var(--brown-muted)', marginTop: 8, textAlign: 'center' }}>📅 Deadline: {goal.deadline}</p>}
              </div>
            </div>
          );
        }) : <div className="empty-state" style={{ gridColumn: '1 / -1' }}><div className="empty-state-icon">🎯</div><div className="empty-state-text">No goals yet!</div><div className="empty-state-sub">Set goals like &ldquo;Solve 100 problems&rdquo; ♡</div></div>}
      </div>

      {completed.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-retro)', fontSize: 20, marginBottom: 12 }}>🏆 Completed Goals</h3>
          <div className="notes-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {completed.map(g => (
              <div key={g.id} className="pixel-card" style={{ opacity: 0.85 }}>
                <div className="pixel-card-header" style={{ justifyContent: 'space-between' }}>
                  <span>🏆 {g.title}</span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button className="task-action-btn" title="Edit Goal" style={{ width: 22, height: 22, fontSize: 12, border: 'none', background: 'transparent', color: 'var(--brown-text)', cursor: 'pointer' }} onClick={() => openEdit(g)}>✎</button>
                    <button className="task-action-btn" title="Delete Goal" style={{ width: 22, height: 22, fontSize: 12, border: 'none', background: 'transparent', color: '#e74c3c', cursor: 'pointer' }} onClick={() => setDeletingItem(g)}>🗑️</button>
                  </div>
                </div>
                <div className="pixel-card-body">
                  <span className="badge badge-green">Completed! 🎉</span>
                  {g.description && <p style={{ fontSize: 12, color: 'var(--brown-muted)', marginTop: 6 }}>{g.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit / New Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="pixel-card-header" style={{ justifyContent: 'space-between' }}>
              <span>{editingItem ? '✎ Edit Goal' : '+ New Goal'}</span>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14 }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} style={{ padding: 20 }}>
              <div className="input-group"><label className="input-label">Goal Title</label><input type="text" className="input-field" placeholder='e.g. "Solve 100 coding problems"' value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} autoFocus /></div>
              <div className="input-group"><label className="input-label">Description</label><input type="text" className="input-field" placeholder="Details (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
              <div className="form-row">
                <div className="input-group" style={{ flex: 1 }}><label className="input-label">Target</label><input type="number" className="input-field" value={form.target} onChange={e => setForm(p => ({ ...p, target: parseInt(e.target.value) || 0 }))} /></div>
                <div className="input-group" style={{ flex: 1 }}><label className="input-label">Current Progress</label><input type="number" className="input-field" value={form.current} onChange={e => setForm(p => ({ ...p, current: parseInt(e.target.value) || 0 }))} /></div>
                <div className="input-group" style={{ flex: 1 }}><label className="input-label">Unit</label><input type="text" className="input-field" placeholder="tasks, problems..." value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} /></div>
              </div>
              <div className="input-group"><label className="input-label">Deadline</label><input type="date" className="input-field" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} /></div>
              <div className="form-actions" style={{ justifyContent: 'space-between' }}>
                {editingItem ? (
                  <button type="button" className="btn btn-outline btn-sm" style={{ color: '#e74c3c', borderColor: '#e74c3c' }} onClick={() => setDeletingItem(editingItem)}>🗑️ Delete Goal</button>
                ) : <div />}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Save ♡</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingItem && (
        <div className="modal-overlay" onClick={() => setDeletingItem(null)}>
          <div className="modal-content" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="pixel-card-header" style={{ justifyContent: 'space-between', backgroundColor: '#e74c3c', color: '#fff' }}>
              <span>🗑️ Delete Goal?</span>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, color: '#fff' }} onClick={() => setDeletingItem(null)}>✕</button>
            </div>
            <div style={{ padding: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--brown-text)', marginBottom: 8 }}>Are you sure you want to delete this goal?</p>
              <p style={{ fontWeight: 'bold', fontSize: 15, color: '#e74c3c', marginBottom: 20 }}>&ldquo;{deletingItem.title}&rdquo;</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button className="btn btn-outline btn-sm" onClick={() => setDeletingItem(null)}>Cancel</button>
                <button className="btn btn-pink btn-sm" style={{ backgroundColor: '#e74c3c', borderColor: '#c0392b', color: '#fff' }} onClick={() => confirmDelete(deletingItem)}>Yes, Delete 🗑️</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
