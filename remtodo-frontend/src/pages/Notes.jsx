import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { storageService } from '../services/storageService';
import './Notes.css';

const NOTE_CATEGORIES = ['All', 'College', 'Coding', 'Ideas', 'Personal', 'Projects', 'Important', 'Random'];

export default function Notes() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', category: 'Personal', pinned: false, tags: '' });

  useEffect(() => { loadNotes(); }, [user?.id]);

  const loadNotes = async () => {
    setLoading(true);
    const data = await storageService.getItems(user?.id, 'notes', `/api/notes/user/${user?.id}`);
    setNotes(data);
    setLoading(false);
  };

  const openNew = () => {
    setEditingNote(null);
    setForm({ title: '', content: '', category: 'Personal', pinned: false, tags: '' });
    setShowModal(true);
  };

  const openEdit = (note) => {
    setEditingNote(note);
    setForm({
      title: note.title || '',
      content: note.content || '',
      category: note.category || 'Personal',
      pinned: !!note.pinned,
      tags: Array.isArray(note.tags) ? note.tags.join(', ') : (note.tags || '')
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { showToast('Note needs a title!', 'error'); return; }
    
    const tagArray = typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : (form.tags || []);
    const noteData = { ...form, tags: tagArray, userId: user?.id };
    
    const saved = await storageService.saveItem(user?.id, 'notes', noteData, '/api/notes', editingNote?.id);
    
    if (editingNote) {
      setNotes(prev => prev.map(n => String(n.id) === String(editingNote.id) ? saved : n));
      showToast('Note saved ♡');
    } else {
      setNotes(prev => [saved, ...prev]);
      showToast('Note created ♡');
    }
    setShowModal(false);
  };

  const deleteNote = async (id) => {
    await storageService.deleteItem(user?.id, 'notes', id, '/api/notes');
    setNotes(prev => prev.filter(n => String(n.id) !== String(id)));
    showToast('Note deleted');
  };

  const togglePin = async (note) => {
    const updated = { ...note, pinned: !note.pinned };
    const saved = await storageService.saveItem(user?.id, 'notes', updated, '/api/notes', note.id);
    setNotes(prev => prev.map(n => String(n.id) === String(note.id) ? saved : n));
    showToast(updated.pinned ? 'Note pinned 📌' : 'Note unpinned');
  };

  const filtered = notes
    .filter(n => {
      if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !(n.content || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (activeCategory !== 'All' && n.category !== activeCategory) return false;
      return true;
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const COLORS = ['#FFD4DC', '#FFF0F3', '#F5E6A4', '#A4C8E1', '#B8D8BA', '#E8A0A0', '#FFE4CC', '#E0D4F5'];

  return (
    <div className="notes-page">
      <div className="page-header">
        <h1 className="page-title">📝 Notes</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Note</button>
      </div>

      <div className="tasks-toolbar">
        <div className="tasks-filters">
          {NOTE_CATEGORIES.map(c => (
            <button key={c} className={`filter-btn ${activeCategory === c ? 'active' : ''}`} onClick={() => setActiveCategory(c)}>{c}</button>
          ))}
        </div>
        <input type="text" className="input-field tasks-search" placeholder="Search notes..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      <div className="notes-grid">
        {loading ? (
          <div className="loading-spinner" style={{ gridColumn: '1 / -1' }}></div>
        ) : filtered.length > 0 ? (
          filtered.map((note, i) => (
            <div
              key={note.id}
              className={`note-card ${note.pinned ? 'pinned' : ''}`}
              style={{ borderTopColor: COLORS[i % COLORS.length] }}
            >
              <div className="note-card-top">
                <button className="note-pin-btn" onClick={() => togglePin(note)} title={note.pinned ? 'Unpin' : 'Pin'}>
                  {note.pinned ? '📌' : '📍'}
                </button>
                <div className="task-card-actions">
                  <button className="task-action-btn" onClick={() => openEdit(note)}>✎</button>
                  <button className="task-action-btn delete" onClick={() => deleteNote(note.id)}>✕</button>
                </div>
              </div>
              <h3 className="note-card-title">{note.title}</h3>
              <p className="note-card-content">{note.content || 'No content'}</p>
              <div className="note-card-footer">
                <span className="badge badge-pink">{note.category}</span>
                {(Array.isArray(note.tags) ? note.tags : []).map(tag => <span key={tag} className="note-tag">#{tag}</span>)}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state-icon">📒</div>
            <div className="empty-state-text">No notes yet!</div>
            <div className="empty-state-sub">Your digital notebook is waiting ♡</div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="pixel-card-header">{editingNote ? '✎ Edit Note' : '+ New Note'}</div>
            <form onSubmit={handleSave} style={{ padding: 20 }}>
              <div className="input-group">
                <label className="input-label">Title</label>
                <input type="text" className="input-field" placeholder="Note title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} autoFocus />
              </div>
              <div className="input-group">
                <label className="input-label">Content</label>
                <textarea className="input-field" placeholder="Write your thoughts..." value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={6} />
              </div>
              <div className="form-row">
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {NOTE_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ flex: 1 }}>
                  <label className="input-label">Tags (comma separated)</label>
                  <input type="text" className="input-field" placeholder="java, exam, idea" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
                </div>
              </div>
              <label className="pixel-checkbox" style={{ marginBottom: 16 }}>
                <input type="checkbox" checked={form.pinned} onChange={e => setForm(p => ({ ...p, pinned: e.target.checked }))} />
                <span>Pin this note</span>
              </label>
              <div className="form-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Note ♡</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
