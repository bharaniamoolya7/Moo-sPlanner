import { Link } from 'react-router-dom';
import './Welcome.css';

export default function Welcome() {
  return (
    <div className="welcome-page">
      {/* Background decorations - isometric room corners */}
      <div className="welcome-bg-decor top-left">
        <div className="iso-room-mini"></div>
      </div>
      <div className="welcome-bg-decor top-right">
        <div className="iso-room-mini"></div>
      </div>
      <div className="welcome-bg-decor bottom-left">
        <div className="iso-room-mini"></div>
      </div>
      <div className="welcome-bg-decor bottom-right">
        <div className="iso-room-mini"></div>
      </div>

      {/* Floating decorations */}
      <span className="welcome-star s1">✦</span>
      <span className="welcome-star s2">✧</span>
      <span className="welcome-star s3">✦</span>
      <span className="welcome-star s4">♡</span>

      {/* Main card */}
      <div className="welcome-card">
        <div className="welcome-card-inner">
          {/* Bell icon with heart */}
          <div className="welcome-icon-wrapper">
            <div className="welcome-bell-circle">
              <span className="welcome-bell">🔔</span>
            </div>
            <span className="welcome-heart-badge">💜</span>
          </div>

          {/* Brand */}
          <h1 className="welcome-title">moo'splanner</h1>
          <p className="welcome-tagline">Your little space to remember everything.</p>

          {/* CTA */}
          <Link to="/signup" className="btn btn-primary btn-lg welcome-start-btn">
            Start →
          </Link>

          {/* Login link */}
          <p className="welcome-login-text">
            Already have a diary? <Link to="/login" className="welcome-login-link">Log in here</Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="welcome-footer">
        <span className="welcome-footer-brand">☾ moo'splanner</span>
        <div className="welcome-footer-links">
          <a href="#about">About</a>
          <a href="#github">GitHub</a>
          <a href="#support">Support</a>
        </div>
      </footer>
    </div>
  );
}
