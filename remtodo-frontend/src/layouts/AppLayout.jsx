import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PixelAvatar from '../components/PixelAvatar';
import './AppLayout.css';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/tasks', label: 'Tasks', icon: '✓' },
  { path: '/notes', label: 'Notes', icon: '📝' },
  { path: '/reminders', label: 'Reminders', icon: '🔔' },
  { path: '/learning', label: 'Learning Hub', icon: '📚' },
  { path: '/coding', label: 'Coding Lab', icon: '◇' },
  { path: '/goals', label: 'Goals', icon: '⭐' },
  { path: '/projects', label: 'Projects', icon: '📁' },
  { path: '/progress', label: 'Progress', icon: '📊' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
];

export default function AppLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const avatarConfig = user?.avatarConfig || {};

  return (
    <div className="app-layout">
      {/* Mobile header */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
        <span className="mobile-brand">moo'splanner</span>
        <div className="mobile-avatar" onClick={() => navigate('/profile')}>
          <PixelAvatar config={avatarConfig} size={32} />
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Profile section */}
        <div className="sidebar-profile" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
          <div className="sidebar-avatar">
            <PixelAvatar config={avatarConfig} size={56} />
          </div>
          <div className="sidebar-brand">moo'splanner</div>
          <div className="sidebar-username">
            {user?.displayName || 'User'}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* New Entry button */}
        <div className="sidebar-bottom">
          <button className="btn btn-pink sidebar-new-btn" onClick={() => { navigate('/tasks'); setMobileMenuOpen(false); }}>
            + New Entry
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
