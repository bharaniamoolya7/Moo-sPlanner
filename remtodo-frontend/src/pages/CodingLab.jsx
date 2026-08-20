import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TOPICS = ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'DP', 'Sorting', 'Searching', 'Recursion', 'OOP', 'Other'];
const LANGUAGES = ['Java', 'Python', 'C++', 'JavaScript', 'TypeScript', 'C#', 'Go', 'Rust', 'SQL', 'C', 'Other'];

const LANG_ICONS = {
  Java: '☕',
  Python: '🐍',
  'C++': '⚡',
  JavaScript: '🟨',
  TypeScript: '📘',
  'C#': '🟣',
  Go: '🐹',
  Rust: '🦀',
  SQL: '🗄️',
  C: '⚙️',
  Other: '💻'
};

export default function CodingLab() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [langFilter, setLangFilter] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', difficulty: 'Easy', topic: 'Arrays', language: 'Java', code: '', solved: false, notes: '' });

  useEffect(() => { loadProblems(); }, []);

  const loadProblems = async () => {
    try { const res = await api.get(`/api/coding-problems/user/${user?.id}`); setProblems(res.data || []); } catch {}
    setLoading(false);
  };

  const openNew = () => { setEditingItem(null); setForm({ title: '', description: '', difficulty: 'Easy', topic: 'Arrays', language: 'Java', code: '', solved: false, notes: '' }); setShowModal(true); };
  const openEdit = (p) => { setEditingItem(p); setForm({ title: p.title, description: p.description || '', difficulty: p.difficulty || 'Easy', topic: p.topic || 'Arrays', language: p.language || 'Java', code: p.code || '', solved: p.solved, notes: p.notes || '' }); setShowModal(true); };
  const openView = (p) => { setViewItem(p); };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    showToast('Code copied to clipboard! 📋');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast('Need a title!', 'error'); return; }
    const data = { ...form, userId: user?.id };
    try {
      if (editingItem) { const res = await api.put(`/api/coding-problems/${editingItem.id}`, data); setProblems(p => p.map(x => x.id === editingItem.id ? res.data : x)); }
      else { const res = await api.post('/api/coding-problems', data); setProblems(p => [res.data, ...p]); }
      showToast('Problem saved ♡');
    } catch {
      const local = { ...data, id: editingItem?.id || Date.now() };
      if (editingItem) { setProblems(p => p.map(x => x.id === editingItem.id ? local : x)); }
      else { setProblems(p => [local, ...p]); }
      showToast('Problem saved ♡');
    }
    setShowModal(false);
  };

  const toggleSolved = async (problem) => {
    const updated = { ...problem, solved: !problem.solved };
    setProblems(p => p.map(x => x.id === problem.id ? updated : x));
    try { await api.put(`/api/coding-problems/${problem.id}`, updated); } catch {}
    showToast(updated.solved ? 'Problem solved! 🎉' : 'Marked unsolved');
  };

  const deleteProblem = async (id) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      setProblems(p => p.filter(x => x.id !== id));
      try { await api.delete(`/api/coding-problems/${id}`); } catch {}
      showToast('Problem deleted');
    }
  };

  const filtered = problems.filter(p => {
    if (filter === 'solved' && !p.solved) return false;
    if (filter === 'unsolved' && p.solved) return false;
    if (['Easy', 'Medium', 'Hard'].includes(filter) && p.difficulty !== filter) return false;
    if (langFilter !== 'all' && p.language !== langFilter) return false;
    return true;
  });

  const solvedCount = problems.filter(p => p.solved).length;

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1 className="page-title">◇ Coding Lab</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Problem</button>
      </div>

      <div className="tasks-stats">
        <div className="task-stat"><span className="task-stat-num">{solvedCount}</span><span className="task-stat-label">Solved</span></div>
        <div className="task-stat"><span className="task-stat-num">{problems.length - solvedCount}</span><span className="task-stat-label">Unsolved</span></div>
        <div className="task-stat"><span className="task-stat-num">{problems.length}</span><span className="task-stat-label">Total</span></div>
      </div>

      <div className="tasks-toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
        <div className="tasks-filters" style={{ flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-retro)', alignSelf: 'center', color: 'var(--brown-muted)', marginRight: 4 }}>Status:</span>
          {['all', 'solved', 'unsolved', 'Easy', 'Medium', 'Hard'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'Easy' ? '🟢 Easy' : f === 'Medium' ? '🟡 Medium' : f === 'Hard' ? '🔴 Hard' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="tasks-filters" style={{ flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-retro)', alignSelf: 'center', color: 'var(--brown-muted)', marginRight: 4 }}>Language:</span>
          <button className={`filter-btn ${langFilter === 'all' ? 'active' : ''}`} onClick={() => setLangFilter('all')}>All Languages</button>
          {LANGUAGES.slice(0, 6).map(lang => (
            <button key={lang} className={`filter-btn ${langFilter === lang ? 'active' : ''}`} onClick={() => setLangFilter(lang)}>
              {LANG_ICONS[lang] || '💻'} {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="tasks-list">
        {loading ? <div className="loading-spinner"></div> : filtered.length > 0 ? filtered.map(p => (
          <div key={p.id} className={`task-card ${p.solved ? 'completed' : ''}`}>
            <div className="task-card-content" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => toggleSolved(p)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>
                {p.solved ? '✅' : '⬜'}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span
                    className={`task-card-title ${p.solved ? 'task-text-done' : ''}`}
                    onClick={() => openView(p)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view code"
                  >
                    {p.title}
                  </span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => openView(p)}
                    style={{ padding: '2px 8px', fontSize: 11, fontFamily: 'var(--font-retro)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    title="View Solution Code"
                  >
                    👁 View Code
                  </button>
                </div>
                {p.description && <p className="task-card-desc">{p.description}</p>}
                <div className="task-card-meta" style={{ marginTop: 6 }}>
                  <span className={`badge ${p.difficulty === 'Hard' ? 'badge-red' : p.difficulty === 'Medium' ? 'badge-yellow' : 'badge-green'}`}>{p.difficulty}</span>
                  <span className="badge badge-blue">{p.topic}</span>
                  <span className="badge badge-pink" style={{ fontWeight: 'bold' }}>{LANG_ICONS[p.language] || '💻'} {p.language || 'Java'}</span>
                </div>
              </div>
            </div>
            <div className="task-card-actions">
              <button className="task-action-btn" title="View Code" onClick={() => openView(p)}>👁</button>
              <button className="task-action-btn" title="Edit Problem" onClick={() => openEdit(p)}>✎</button>
              <button className="task-action-btn delete" title="Delete" onClick={() => deleteProblem(p.id)}>✕</button>
            </div>
          </div>
        )) : <div className="empty-state"><div className="empty-state-icon">💻</div><div className="empty-state-text">No coding problems found!</div><div className="empty-state-sub">Start tracking your practice ♡</div></div>}
      </div>

      {/* View Code Modal */}
      {viewItem && (
        <div className="modal-overlay" onClick={() => setViewItem(null)}>
          <div className="modal-content" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="pixel-card-header" style={{ justifyContent: 'space-between' }}>
              <span>{LANG_ICONS[viewItem.language] || '💻'} {viewItem.title}</span>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14 }} onClick={() => setViewItem(null)}>✕</button>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
                <span className={`badge ${viewItem.difficulty === 'Hard' ? 'badge-red' : viewItem.difficulty === 'Medium' ? 'badge-yellow' : 'badge-green'}`}>{viewItem.difficulty}</span>
                <span className="badge badge-blue">{viewItem.topic}</span>
                <span className="badge badge-pink" style={{ fontWeight: 'bold' }}>{LANG_ICONS[viewItem.language] || '💻'} {viewItem.language || 'Java'}</span>
                <span className={`badge ${viewItem.solved ? 'badge-green' : 'badge-pink'}`}>
                  {viewItem.solved ? '✅ Solved' : '⬜ Unsolved'}
                </span>
              </div>

              {viewItem.description && (
                <div className="input-group" style={{ marginBottom: 16 }}>
                  <label className="input-label">📋 Problem Description / Prompt</label>
                  <div style={{ background: 'var(--bg-cream-light)', padding: 12, border: '2px solid var(--border-dark)', fontSize: 14, color: 'var(--brown-text)', whiteSpace: 'pre-wrap' }}>
                    {viewItem.description}
                  </div>
                </div>
              )}

              <div className="input-group" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>💻 Solution Code ({viewItem.language || 'Java'})</label>
                  {viewItem.code && (
                    <button className="btn btn-outline btn-sm" onClick={() => handleCopyCode(viewItem.code)} style={{ padding: '3px 8px', fontSize: 10 }}>
                      📋 Copy Code
                    </button>
                  )}
                </div>
                {viewItem.code ? (
                  <pre style={{
                    background: '#282C34',
                    color: '#ABB2BF',
                    padding: 16,
                    border: '2px solid var(--border-dark)',
                    borderRadius: 4,
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: 13,
                    lineHeight: 1.5,
                    overflowX: 'auto',
                    maxHeight: 350,
                    margin: 0
                  }}>
                    <code>{viewItem.code}</code>
                  </pre>
                ) : (
                  <div style={{ background: 'var(--bg-cream-light)', padding: 16, border: '2px dashed var(--border-dark)', textAlign: 'center', color: 'var(--brown-muted)', fontStyle: 'italic' }}>
                    No solution code added yet. Click "Edit Problem" to add your solution!
                  </div>
                )}
              </div>

              {viewItem.notes && (
                <div className="input-group" style={{ marginBottom: 16 }}>
                  <label className="input-label">💡 Notes & Insights</label>
                  <div style={{ background: 'var(--yellow-soft)', padding: 12, border: '2px solid var(--border-dark)', fontSize: 13, color: 'var(--brown-text)' }}>
                    {viewItem.notes}
                  </div>
                </div>
              )}

              <div className="form-actions" style={{ justifyContent: 'space-between', marginTop: 20 }}>
                <button
                  type="button"
                  className="btn btn-pink btn-sm"
                  onClick={() => {
                    const item = viewItem;
                    setViewItem(null);
                    openEdit(item);
                  }}
                >
                  ✎ Edit Problem
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setViewItem(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <div className="pixel-card-header" style={{ justifyContent: 'space-between' }}>
              <span>{editingItem ? '✎ Edit Problem' : '+ New Problem'}</span>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14 }} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave} style={{ padding: 20 }}>
              <div className="input-group">
                <label className="input-label">Problem Title</label>
                <input type="text" className="input-field" placeholder='e.g. "Two Sum" or "Valid Palindrome"' value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} autoFocus />
              </div>

              <div className="input-group">
                <label className="input-label">Description / Prompt</label>
                <textarea className="input-field" placeholder="Problem details, input/output examples..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
              </div>

              <div className="form-row">
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">💻 Programming Language</label>
                  <select className="input-field" value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))}>
                    {LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>{LANG_ICONS[lang] || '💻'} {lang}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Difficulty</label>
                  <select className="input-field" value={form.difficulty} onChange={e => setForm(p => ({ ...p, difficulty: e.target.value }))}>
                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Topic / Tag</label>
                  <select className="input-field" value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}>
                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Your Code Solution ({form.language})</label>
                <textarea className="input-field" placeholder={`// Write or paste your ${form.language} code here...`} value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} rows={6} style={{ fontFamily: 'monospace', fontSize: 13 }} />
              </div>

              <div className="input-group">
                <label className="input-label">Notes & Insights</label>
                <input type="text" className="input-field" placeholder="Approach, O(n) time complexity, key tricks..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>

              <label className="pixel-checkbox" style={{ marginBottom: 16 }}>
                <input type="checkbox" checked={form.solved} onChange={e => setForm(p => ({ ...p, solved: e.target.checked }))} />
                <span>Solved ✓</span>
              </label>

              <div className="form-actions" style={{ justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Problem ♡</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
