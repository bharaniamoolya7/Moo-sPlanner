import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { storageService } from '../services/storageService';

const STATUS_OPTIONS = ['Planning', 'In Progress', 'Completed', 'On Hold'];

export default function Projects() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', technologies: '', deadline: '', status: 'Planning', progress: 0, notes: '' });

  useEffect(() => { loadProjects(); }, [user?.id]);

  const loadProjects = async () => {
    setLoading(true);
    const data = await storageService.getItems(user?.id, 'projects', `/api/projects/user/${user?.id}`);
    setProjects(data);
    setLoading(false);
  };

  const openNew = () => { setEditingItem(null); setForm({ name: '', description: '', technologies: '', deadline: '', status: 'Planning', progress: 0, notes: '' }); setShowModal(true); };
  const openEdit = (p) => {
    setEditingItem(p);
    setForm({
      name: p.name || p.title || '',
      description: p.description || '',
      technologies: Array.isArray(p.technologies) ? p.technologies.join(', ') : (p.technologies || ''),
      deadline: p.deadline || '',
      status: p.status || 'Planning',
      progress: p.progress || 0,
      notes: p.notes || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { showToast('Need a name!', 'error'); return; }
    
    const techArray = typeof form.technologies === 'string' ? form.technologies.split(',').map(t => t.trim()).filter(Boolean) : (form.technologies || []);
    const data = { ...form, title: form.name, technologies: techArray, userId: user?.id };
    
    const saved = await storageService.saveItem(user?.id, 'projects', data, '/api/projects', editingItem?.id);
    if (editingItem) { setProjects(p => p.map(x => String(x.id) === String(editingItem.id) ? saved : x)); }
    else { setProjects(p => [saved, ...p]); }
    
    showToast('Project saved ♡');
    setShowModal(false);
  };

  const deleteProject = async (id) => {
    await storageService.deleteItem(user?.id, 'projects', id, '/api/projects');
    setProjects(p => p.filter(x => String(x.id) !== String(id)));
    showToast('Project deleted');
  };

  const statusColor = { 'Planning': 'badge-blue', 'In Progress': 'badge-yellow', 'Completed': 'badge-green', 'On Hold': 'badge-red' };

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1 className="page-title">📁 Projects</h1>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ New Project</button>
      </div>

      <div className="notes-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {loading ? <div className="loading-spinner" style={{ gridColumn: '1 / -1' }}></div> : projects.length > 0 ? projects.map(project => (
          <div key={project.id} className="pixel-card">
            <div className="pixel-card-header" style={{ justifyContent: 'space-between' }}>
              <span>📁 {project.name || project.title}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="task-action-btn" style={{ width: 18, height: 18, fontSize: 10, border: 'none', background: 'transparent', color: 'var(--brown-text)' }} onClick={() => openEdit(project)}>✎</button>
                <button className="task-action-btn" style={{ width: 18, height: 18, fontSize: 10, border: 'none', background: 'transparent', color: 'var(--brown-text)' }} onClick={() => deleteProject(project.id)}>✕</button>
              </div>
            </div>
            <div className="pixel-card-body">
              {project.description && <p style={{ fontSize: 13, color: 'var(--brown-light)', marginBottom: 10 }}>{project.description}</p>}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <span className={`badge ${statusColor[project.status] || 'badge-pink'}`}>{project.status}</span>
                {(Array.isArray(project.technologies) ? project.technologies : []).map(tech => <span key={tech} className="badge badge-pink">{tech}</span>)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                <span>Progress</span>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 9 }}>{project.progress || 0}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${project.progress || 0}%` }}></div>
              </div>
              {project.deadline && <p style={{ fontSize: 11, color: 'var(--brown-muted)', marginTop: 8 }}>📅 Deadline: {project.deadline}</p>}
              {project.notes && <p style={{ fontSize: 12, color: 'var(--brown-light)', marginTop: 6, fontStyle: 'italic' }}>📝 {project.notes}</p>}
            </div>
          </div>
        )) : <div className="empty-state" style={{ gridColumn: '1 / -1' }}><div className="empty-state-icon">🗂</div><div className="empty-state-text">No projects yet!</div><div className="empty-state-sub">Start tracking your projects ♡</div></div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="pixel-card-header">{editingItem ? '✎ Edit Project' : '+ New Project'}</div>
            <form onSubmit={handleSave} style={{ padding: 20 }}>
              <div className="input-group"><label className="input-label">Project Name</label><input type="text" className="input-field" placeholder="e.g. My Portfolio Website" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} autoFocus /></div>
              <div className="input-group"><label className="input-label">Description</label><textarea className="input-field" placeholder="What's this project about?" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
              <div className="input-group"><label className="input-label">Technologies (comma separated)</label><input type="text" className="input-field" placeholder="React, Java, MySQL..." value={form.technologies} onChange={e => setForm(p => ({ ...p, technologies: e.target.value }))} /></div>
              <div className="form-row">
                <div className="input-group" style={{ flex: 1 }}><label className="input-label">Status</label><select className="input-field" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div className="input-group" style={{ flex: 1 }}><label className="input-label">Progress (%)</label><input type="number" min="0" max="100" className="input-field" value={form.progress} onChange={e => setForm(p => ({ ...p, progress: parseInt(e.target.value) || 0 }))} /></div>
              </div>
              <div className="input-group"><label className="input-label">Deadline</label><input type="date" className="input-field" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} /></div>
              <div className="input-group"><label className="input-label">Notes</label><textarea className="input-field" placeholder="Project notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} /></div>
              <div className="form-actions"><button type="button" className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary btn-sm">Save ♡</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
