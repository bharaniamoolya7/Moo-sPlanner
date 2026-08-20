import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import './LearningHub.css';

const STATUS_OPTIONS = ['Not Started', 'Learning', 'Completed'];
const STATUS_COLORS = { 'Not Started': 'badge-red', 'Learning': 'badge-yellow', 'Completed': 'badge-green' };

// Utility to extract YouTube video ID from various link formats
const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.trim().match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Initial seed subjects (empty by default so user can add custom subjects)
const DEFAULT_SEED_SUBJECTS = [];

// Popular free YouTube study videos catalog for quick selection
const POPULAR_STUDY_VIDEOS = [
  { title: 'Data Structures & Algorithms Course for Beginners', channel: 'freeCodeCamp', youtubeUrl: 'https://www.youtube.com/watch?v=8hly31xKLI0', tags: ['dsa', 'arrays', 'strings', 'algorithms'] },
  { title: 'React JS Full Course for Beginners', channel: 'freeCodeCamp', youtubeUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8', tags: ['react', 'web', 'javascript'] },
  { title: 'HTML, CSS & JavaScript Web Development Crash Course', channel: 'SuperSimpleDev', youtubeUrl: 'https://www.youtube.com/watch?v=G3e-cpL7ofc', tags: ['web', 'html', 'css', 'javascript'] },
  { title: 'Python for Beginners - Full Course', channel: 'Programming with Mosh', youtubeUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc', tags: ['python', 'basics'] },
  { title: 'SQL & Database Management Systems Course', channel: 'freeCodeCamp', youtubeUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY', tags: ['sql', 'dbms', 'database'] },
  { title: 'C++ Full Course for Beginners', channel: 'Bro Code', youtubeUrl: 'https://www.youtube.com/watch?v=-TkoO8Z07hI', tags: ['c++', 'cpp', 'programming'] }
];

export default function LearningHub() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '' });
  
  // Topic form state including YouTube URL
  const [topicForm, setTopicForm] = useState({ id: null, name: '', status: 'Not Started', youtubeUrl: '' });
  
  // YouTube video search query inside topic modal
  const [ytSearchQuery, setYtSearchQuery] = useState('');
  const [showYtPicker, setShowYtPicker] = useState(false);

  // Active YouTube video player modal state
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  // Focus timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerSubject, setTimerSubject] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(25);
  const timerRef = useRef(null);

  useEffect(() => { loadSubjects(); }, [user?.id]);

  useEffect(() => {
    if (timerActive && (timerMinutes > 0 || timerSeconds > 0)) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev === 0) {
            setTimerMinutes(m => {
              if (m === 0) { clearInterval(timerRef.current); setTimerActive(false); handleTimerComplete(); return 0; }
              return m - 1;
            });
            return 59;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const handleTimerComplete = async () => {
    showToast(`Focus session complete! ⭐ (${selectedDuration} min)`);
    try {
      await api.post('/api/study-sessions', { userId: user?.id, subjectName: timerSubject, duration: selectedDuration, date: new Date().toISOString().split('T')[0] });
    } catch {}
  };

  const startTimer = () => {
    if (!timerSubject) { showToast('Pick a subject first!', 'error'); return; }
    setTimerMinutes(selectedDuration);
    setTimerSeconds(0);
    setTimerActive(true);
  };

  const stopTimer = () => { clearInterval(timerRef.current); setTimerActive(false); setTimerMinutes(selectedDuration); setTimerSeconds(0); };

  const getStorageKey = () => `moosplanner_subjects_${user?.id || 'guest'}`;

  const loadSubjects = async () => {
    const storageKey = getStorageKey();
    let localData = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        localData = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse subjects from storage:', e);
    }

    try {
      const res = await api.get(`/api/subjects/user/${user?.id}`);
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const parsedSubjects = res.data
          .filter(s => s.id !== 1001 && s.id !== 1002 && s.id !== 1003)
          .map(s => ({
            ...s,
            topics: typeof s.topics === 'string' ? JSON.parse(s.topics || '[]') : (s.topics || [])
          }));
        setSubjects(parsedSubjects);
        localStorage.setItem(storageKey, JSON.stringify(parsedSubjects));
        if (parsedSubjects.length > 0 && !selectedSubject) {
          setSelectedSubject(parsedSubjects[0]);
        }
        setLoading(false);
        return;
      }
    } catch {}

    if (localData && localData.length > 0) {
      const cleaned = localData.filter(s => s.id !== 1001 && s.id !== 1002 && s.id !== 1003);
      setSubjects(cleaned);
      if (cleaned.length > 0 && !selectedSubject) setSelectedSubject(cleaned[0]);
      localStorage.setItem(storageKey, JSON.stringify(cleaned));
    } else {
      setSubjects([]);
      setSelectedSubject(null);
      localStorage.setItem(storageKey, JSON.stringify([]));
    }
    setLoading(false);
  };

  const saveSubjectsState = (updatedSubjects) => {
    setSubjects(updatedSubjects);
    localStorage.setItem(getStorageKey(), JSON.stringify(updatedSubjects));
  };

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return;
    const newSubject = { ...subjectForm, userId: user?.id, topics: [] };
    
    let savedSubject = { ...newSubject, id: Date.now() };
    try { 
      const res = await api.post('/api/subjects', newSubject);
      if (res.data) {
        savedSubject = { ...res.data, topics: [] };
      }
    } catch {}

    const updated = [...subjects, savedSubject];
    saveSubjectsState(updated);
    setSelectedSubject(savedSubject);
    showToast('Subject added ♡');
    setShowSubjectModal(false);
    setSubjectForm({ name: '', description: '' });
  };

  const openAddTopicModal = () => {
    setTopicForm({ id: null, name: '', status: 'Not Started', youtubeUrl: '' });
    setYtSearchQuery('');
    setShowYtPicker(false);
    setShowTopicModal(true);
  };

  const openEditTopicModal = (topic) => {
    setTopicForm({
      id: topic.id,
      name: topic.name,
      status: topic.status || 'Not Started',
      youtubeUrl: topic.youtubeUrl || ''
    });
    setYtSearchQuery(topic.name || '');
    setShowYtPicker(false);
    setShowTopicModal(true);
  };

  const selectSuggestedVideo = (video) => {
    setTopicForm(prev => ({
      ...prev,
      name: prev.name.trim() ? prev.name : video.title,
      youtubeUrl: video.youtubeUrl
    }));
    showToast('YouTube video attached! 🎬');
  };

  const openDirectYouTubeSearch = () => {
    const query = ytSearchQuery.trim() || topicForm.name.trim() || selectedSubject?.name || 'programming tutorial';
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
  };

  const saveTopic = async (e) => {
    e.preventDefault();
    if (!topicForm.name.trim() || !selectedSubject) return;

    let updatedTopics;
    if (topicForm.id) {
      updatedTopics = (selectedSubject.topics || []).map(t =>
        t.id === topicForm.id ? { ...t, name: topicForm.name, status: topicForm.status, youtubeUrl: topicForm.youtubeUrl } : t
      );
    } else {
      const newTopic = {
        id: Date.now(),
        name: topicForm.name,
        status: topicForm.status,
        youtubeUrl: topicForm.youtubeUrl
      };
      updatedTopics = [...(selectedSubject.topics || []), newTopic];
    }

    const updatedSubject = { ...selectedSubject, topics: updatedTopics };
    const updatedSubjectsList = subjects.map(s => s.id === selectedSubject.id ? updatedSubject : s);

    saveSubjectsState(updatedSubjectsList);
    setSelectedSubject(updatedSubject);

    try {
      await api.put(`/api/subjects/${selectedSubject.id}`, {
        ...updatedSubject,
        topics: JSON.stringify(updatedTopics)
      });
    } catch {}

    showToast(topicForm.id ? 'Topic updated ♡' : 'Topic added ♡');
    setTopicForm({ id: null, name: '', status: 'Not Started', youtubeUrl: '' });
    setShowTopicModal(false);
  };

  const updateTopicStatus = async (subjectId, topicId, newStatus) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const updatedTopics = (subject.topics || []).map(t => t.id === topicId ? { ...t, status: newStatus } : t);
    const updatedSubject = { ...subject, topics: updatedTopics };
    const updatedList = subjects.map(s => s.id === subjectId ? updatedSubject : s);

    saveSubjectsState(updatedList);
    if (selectedSubject?.id === subjectId) setSelectedSubject(updatedSubject);

    try {
      await api.put(`/api/subjects/${subjectId}`, {
        ...updatedSubject,
        topics: JSON.stringify(updatedTopics)
      });
    } catch {}
    showToast('Updated status ♡');
  };

  const deleteTopic = async (subjectId, topicId) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const updatedTopics = (subject.topics || []).filter(t => t.id !== topicId);
    const updatedSubject = { ...subject, topics: updatedTopics };
    const updatedList = subjects.map(s => s.id === subjectId ? updatedSubject : s);

    saveSubjectsState(updatedList);
    if (selectedSubject?.id === subjectId) setSelectedSubject(updatedSubject);

    try {
      await api.put(`/api/subjects/${subjectId}`, {
        ...updatedSubject,
        topics: JSON.stringify(updatedTopics)
      });
    } catch {}
    showToast('Topic deleted');
  };

  const deleteSubject = async (id) => {
    const updated = subjects.filter(s => s.id !== id);
    saveSubjectsState(updated);
    if (selectedSubject?.id === id) {
      setSelectedSubject(updated.length > 0 ? updated[0] : null);
    }
    try { await api.delete(`/api/subjects/${id}`); } catch {}
    showToast('Subject deleted');
  };

  const getProgress = (subject) => {
    const topics = subject.topics || [];
    if (topics.length === 0) return 0;
    return Math.round((topics.filter(t => t.status === 'Completed').length / topics.length) * 100);
  };

  const playVideo = (topicName, youtubeUrl) => {
    const ytId = getYouTubeId(youtubeUrl);
    if (ytId) {
      setActiveVideoModal({
        title: topicName,
        youtubeId: ytId,
        youtubeUrl: youtubeUrl
      });
    } else if (youtubeUrl) {
      window.open(youtubeUrl, '_blank');
    }
  };

  const activeSubjectVideos = (selectedSubject?.topics || [])
    .filter(t => t.youtubeUrl && getYouTubeId(t.youtubeUrl))
    .map(t => ({
      ...t,
      youtubeId: getYouTubeId(t.youtubeUrl),
      subjectName: selectedSubject.name
    }));

  // Filter study videos matching query or subject name
  const filteredSuggestedVideos = POPULAR_STUDY_VIDEOS.filter(v => {
    const q = (ytSearchQuery || topicForm.name || selectedSubject?.name || '').toLowerCase();
    if (!q) return true;
    return v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q) || v.tags.some(t => t.includes(q));
  });

  return (
    <div className="learning-page">
      <div className="page-header">
        <h1 className="page-title">📚 Learning Hub</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowSubjectModal(true)}>+ Add Subject</button>
      </div>

      {/* Focus Timer */}
      <div className="pixel-card" style={{ marginBottom: 20 }}>
        <div className="pixel-card-header">⏱ FOCUS TIMER</div>
        <div className="pixel-card-body timer-section">
          <div className="timer-display">
            <span className="timer-digits">{String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}</span>
          </div>
          <div className="timer-controls">
            <select className="input-field" style={{ maxWidth: 160 }} value={timerSubject} onChange={e => setTimerSubject(e.target.value)} disabled={timerActive}>
              <option value="">Select subject...</option>
              {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
            <div className="timer-durations">
              {[25, 45, 60].map(d => (
                <button key={d} className={`filter-btn ${selectedDuration === d ? 'active' : ''}`} onClick={() => { setSelectedDuration(d); if (!timerActive) { setTimerMinutes(d); setTimerSeconds(0); } }} disabled={timerActive}>{d}m</button>
              ))}
            </div>
            {timerActive ? <button className="btn btn-outline btn-sm" onClick={stopTimer}>Stop</button> : <button className="btn btn-primary btn-sm" onClick={startTimer}>Start Focus ♡</button>}
          </div>
        </div>
      </div>

      {/* Subjects grid */}
      <div className="subjects-grid">
        {loading ? <div className="loading-spinner" style={{ gridColumn: '1 / -1' }}></div> : subjects.length > 0 ? subjects.map(subject => (
          <div key={subject.id} className={`pixel-card subject-card ${selectedSubject?.id === subject.id ? 'active' : ''}`} onClick={() => setSelectedSubject(subject)}>
            <div className="pixel-card-header" style={{ justifyContent: 'space-between' }}>
              <span>📖 {subject.name}</span>
              <button className="task-action-btn delete" style={{ width: 20, height: 20, fontSize: 10, border: 'none', background: 'transparent' }} onClick={(e) => { e.stopPropagation(); deleteSubject(subject.id); }}>✕</button>
            </div>
            <div className="pixel-card-body">
              {subject.description && <p style={{ fontSize: 13, color: 'var(--brown-light)', marginBottom: 8 }}>{subject.description}</p>}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span>{(subject.topics || []).length} topics</span>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: 9 }}>{getProgress(subject)}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill green" style={{ width: `${getProgress(subject)}%` }}></div>
              </div>
            </div>
          </div>
        )) : <div className="empty-state" style={{ gridColumn: '1 / -1' }}><div className="empty-state-icon">📚</div><div className="empty-state-text">No subjects yet!</div><div className="empty-state-sub">Add subjects like Java, DSA, DBMS ♡</div></div>}
      </div>

      {/* Selected subject topics & YouTube study resources */}
      {selectedSubject && (
        <>
          <div className="pixel-card" style={{ marginTop: 24 }}>
            <div className="pixel-card-header" style={{ justifyContent: 'space-between' }}>
              <span>📖 {selectedSubject.name} — Study Topics</span>
              <button className="btn btn-pink btn-sm" style={{ padding: '4px 12px', fontSize: 10, border: 'none' }} onClick={openAddTopicModal}>+ Add Topic & Video</button>
            </div>
            <div className="pixel-card-body">
              {(selectedSubject.topics || []).length > 0 ? (
                <div className="topics-list">
                  {(selectedSubject.topics || []).map(topic => {
                    const ytId = getYouTubeId(topic.youtubeUrl);
                    return (
                      <div key={topic.id} className="topic-row">
                        <div className="topic-info">
                          <span className="topic-name">{topic.name}</span>
                          {topic.youtubeUrl && (
                            <button
                              type="button"
                              className="btn-youtube"
                              title="Play YouTube study video"
                              onClick={() => playVideo(topic.name, topic.youtubeUrl)}
                            >
                              ▶ Watch Video
                            </button>
                          )}
                        </div>

                        <div className="topic-actions">
                          <select className="topic-status-select" value={topic.status} onChange={e => updateTopicStatus(selectedSubject.id, topic.id, e.target.value)}>
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <span className={`badge ${STATUS_COLORS[topic.status]}`}>{topic.status}</span>
                          <button className="btn btn-outline btn-sm" style={{ padding: '2px 6px', fontSize: 10 }} onClick={() => openEditTopicModal(topic)}>✎</button>
                          <button className="task-action-btn delete" style={{ width: 22, height: 22, fontSize: 10 }} onClick={() => deleteTopic(selectedSubject.id, topic.id)}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <p className="dash-empty">No topics added yet. Click "+ Add Topic & Video" to add topics with YouTube study links.</p>}
            </div>
          </div>

          {/* YouTube Video Resources Cards Grid */}
          <div className="pixel-card" style={{ marginTop: 20 }}>
            <div className="pixel-card-header" style={{ justifyContent: 'space-between' }}>
              <span>📺 {selectedSubject.name} — YouTube Video Library</span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-pixel)' }}>{activeSubjectVideos.length} Videos Available</span>
            </div>
            <div className="pixel-card-body">
              {activeSubjectVideos.length > 0 ? (
                <div className="video-cards-grid">
                  {activeSubjectVideos.map(video => (
                    <div key={video.id} className="video-card">
                      <div className="video-thumbnail-wrapper" onClick={() => playVideo(video.name, video.youtubeUrl)}>
                        <img
                          src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                          alt={video.name}
                          className="video-thumbnail"
                        />
                        <div className="play-overlay">▶</div>
                      </div>
                      <div className="video-card-body">
                        <div className="video-title">{video.name}</div>
                        <span className="video-topic-tag">📌 {selectedSubject.name}</span>
                        <div className="video-card-footer">
                          <button
                            type="button"
                            className="btn-youtube"
                            onClick={() => playVideo(video.name, video.youtubeUrl)}
                          >
                            ▶ Watch in Hub
                          </button>
                          <a
                            href={video.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-youtube-outline"
                            onClick={e => e.stopPropagation()}
                          >
                            ↗ YouTube
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <div className="empty-state-icon">📺</div>
                  <div className="empty-state-text">No YouTube study links added yet for this subject!</div>
                  <div className="empty-state-sub">Click "+ Add Topic & Video" above to attach YouTube tutorial URLs ♡</div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="modal-overlay" onClick={() => setShowSubjectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="pixel-card-header">+ Add Subject</div>
            <form onSubmit={handleSaveSubject} style={{ padding: 20 }}>
              <div className="input-group">
                <label className="input-label">Subject Name</label>
                <input type="text" className="input-field" placeholder="e.g. Java, DSA, DBMS" value={subjectForm.name} onChange={e => setSubjectForm(p => ({ ...p, name: e.target.value }))} autoFocus required />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <input type="text" className="input-field" placeholder="Optional description" value={subjectForm.description} onChange={e => setSubjectForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Add ♡</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Topic Modal (With YouTube Search & 1-Click Select) */}
      {showTopicModal && (
        <div className="modal-overlay" onClick={() => setShowTopicModal(false)}>
          <div className="modal-content" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="pixel-card-header" style={{ justifyContent: 'space-between' }}>
              <span>{topicForm.id ? '✎ Edit Topic' : `+ Add Topic to ${selectedSubject?.name}`}</span>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14 }} onClick={() => setShowTopicModal(false)}>✕</button>
            </div>

            <form onSubmit={saveTopic} style={{ padding: 20 }}>
              <div className="input-group">
                <label className="input-label">Topic Title</label>
                <input type="text" className="input-field" placeholder="e.g. Arrays, OOP Concepts, Loops" value={topicForm.name} onChange={e => setTopicForm(p => ({ ...p, name: e.target.value }))} autoFocus required />
              </div>

              {/* YouTube Searcher Section */}
              <div className="input-group" style={{ background: '#fff0f3', border: '1.5px solid #ffb3c1', padding: 14, borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="input-label" style={{ color: '#cc0000', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                    🔴 YouTube Study Video Link
                  </label>
                  <button
                    type="button"
                    className="btn-youtube-outline"
                    onClick={() => setShowYtPicker(!showYtPicker)}
                  >
                    {showYtPicker ? '✕ Close Video Picker' : '🔍 Find / Search YouTube Video'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Paste YouTube URL or select below..."
                    value={topicForm.youtubeUrl}
                    onChange={e => setTopicForm(p => ({ ...p, youtubeUrl: e.target.value }))}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-youtube"
                    onClick={openDirectYouTubeSearch}
                    title="Search query directly on YouTube in new tab"
                  >
                    🔍 Search YT
                  </button>
                </div>

                {/* Validated YouTube Thumbnail Preview */}
                {getYouTubeId(topicForm.youtubeUrl) ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, padding: 8, background: '#fff', border: '1px solid #ffccd5', borderRadius: 4 }}>
                    <img
                      src={`https://img.youtube.com/vi/${getYouTubeId(topicForm.youtubeUrl)}/hqdefault.jpg`}
                      alt="Thumbnail preview"
                      style={{ width: 80, height: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid #ccc' }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 11, fontWeight: 'bold', color: '#2b2b2b' }}>✅ Valid YouTube Video Linked!</span>
                      <p style={{ fontSize: 10, color: '#666', margin: 0 }}>Video ID: {getYouTubeId(topicForm.youtubeUrl)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="youtube-input-hint">Search YouTube or select a video below with 1-click!</div>
                )}

                {/* Direct Search & Suggested Video Picker Panel */}
                {showYtPicker && (
                  <div className="yt-picker-panel" style={{ marginTop: 12, borderTop: '1px dashed #ffb3c1', paddingTop: 10 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Search video name (e.g. Java, React, DSA)..."
                        value={ytSearchQuery}
                        onChange={e => setYtSearchQuery(e.target.value)}
                        style={{ fontSize: 12, padding: '6px 10px' }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: 10, padding: '4px 8px' }}
                        onClick={openDirectYouTubeSearch}
                      >
                        ↗ Open YT Results
                      </button>
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 'bold', color: '#888', marginBottom: 6 }}>
                      Popular Study Videos (Click to Attach):
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
                      {filteredSuggestedVideos.length > 0 ? filteredSuggestedVideos.map((video, idx) => {
                        const vidId = getYouTubeId(video.youtubeUrl);
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 10,
                              padding: 6,
                              background: '#fff',
                              border: '1px solid #e0e0e0',
                              borderRadius: 4,
                              cursor: 'pointer'
                            }}
                            onClick={() => selectSuggestedVideo(video)}
                          >
                            <img
                              src={`https://img.youtube.com/vi/${vidId}/hqdefault.jpg`}
                              alt={video.title}
                              style={{ width: 54, height: 36, objectFit: 'cover', borderRadius: 3 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 11, fontWeight: '600', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.title}</div>
                              <div style={{ fontSize: 9, color: '#888' }}>{video.channel}</div>
                            </div>
                            <button
                              type="button"
                              className="btn-youtube"
                              style={{ fontSize: 9, padding: '2px 6px' }}
                              onClick={(e) => { e.stopPropagation(); selectSuggestedVideo(video); }}
                            >
                              ➕ Select
                            </button>
                          </div>
                        );
                      }) : <div style={{ fontSize: 11, color: '#888', textAlign: 'center', padding: 8 }}>No suggested videos found for "{ytSearchQuery}". Click "↗ Open YT Results" to search live on YouTube!</div>}
                    </div>
                  </div>
                )}
              </div>

              <div className="input-group">
                <label className="input-label">Status</label>
                <select className="input-field" value={topicForm.status} onChange={e => setTopicForm(p => ({ ...p, status: e.target.value }))}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="form-actions" style={{ justifyContent: 'flex-end', gap: 8 }}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowTopicModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">{topicForm.id ? 'Save Changes ♡' : 'Add Topic ♡'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embedded YouTube Video Modal Player */}
      {activeVideoModal && (
        <div className="video-modal-overlay" onClick={() => setActiveVideoModal(null)}>
          <div className="video-modal-container" onClick={e => e.stopPropagation()}>
            <div className="video-modal-header">
              <span>▶ NOW PLAYING: {activeVideoModal.title}</span>
              <button
                className="task-action-btn delete"
                style={{ width: 24, height: 24, fontSize: 12, border: 'none', background: 'transparent' }}
                onClick={() => setActiveVideoModal(null)}
              >
                ✕
              </button>
            </div>
            <div className="video-iframe-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoModal.youtubeId}?autoplay=1`}
                title={activeVideoModal.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-cream-light)' }}>
              <span style={{ fontSize: 12, color: 'var(--brown-dark)' }}>Enjoy studying! Keep your focus timer running while watching ⏱</span>
              <a
                href={activeVideoModal.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-youtube"
              >
                Open on YouTube ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
