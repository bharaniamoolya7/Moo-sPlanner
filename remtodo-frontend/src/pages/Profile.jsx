import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PixelAvatar from '../components/PixelAvatar';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const avatarConfig = user?.avatarConfig || {};

  return (
    <div className="tasks-page" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h1 className="page-title">👤 Profile</h1>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/settings')}>⚙ Settings</button>
      </div>

      <div className="pixel-card">
        <div className="pixel-card-header">✦ MY PROFILE</div>
        <div className="pixel-card-body" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{
            width: 100, height: 100, margin: '0 auto 16px',
            border: '3px solid var(--border-dark)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--pink-soft)', overflow: 'hidden'
          }}>
            <PixelAvatar config={avatarConfig} size={80} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-retro)', fontSize: 28, marginBottom: 4 }}>{user?.displayName || 'User'}</h2>
          <p style={{ fontSize: 13, color: 'var(--brown-muted)', marginBottom: 4 }}>{user?.email}</p>
          <span className="badge badge-pink" style={{ marginBottom: 20, display: 'inline-block' }}>Lvl 1 Newbie</span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 20 }}>
            <div className="task-stat"><span className="task-stat-num">0</span><span className="task-stat-label">Tasks Done</span></div>
            <div className="task-stat"><span className="task-stat-num">0h</span><span className="task-stat-label">Study Time</span></div>
            <div className="task-stat"><span className="task-stat-num">0</span><span className="task-stat-label">Problems</span></div>
            <div className="task-stat"><span className="task-stat-num">0</span><span className="task-stat-label">Goals</span></div>
          </div>

          <button
            className="btn btn-outline"
            style={{ marginTop: 24, color: '#E85D5D', borderColor: '#E85D5D' }}
            onClick={() => { logout(); navigate('/welcome'); }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
