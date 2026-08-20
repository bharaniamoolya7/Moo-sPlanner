import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      showToast('Welcome back! ♡');
      navigate('/dashboard');
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="retro-window login-window">
        <div className="retro-window-titlebar">
          <span>moo'splanner Login</span>
          <div className="retro-window-buttons">
            <div className="retro-window-btn red"></div>
            <div className="retro-window-btn blue"></div>
            <div className="retro-window-btn white"></div>
          </div>
        </div>

        <div className="login-content">
          <div className="login-icon-area">
            <div className="welcome-bell-circle" style={{ width: 64, height: 64 }}>
              <span style={{ fontSize: 28 }}>🔔</span>
            </div>
          </div>

          <h2 className="signup-heading">Welcome back!</h2>
          <p className="signup-subheading">Open your cozy diary ♡</p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">
                <span>✉</span> Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="hello@moosplanner.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            <div className="input-group">
              <label className="input-label">
                <span>🔑</span> Password
              </label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary signup-next-btn" disabled={loading}>
              {loading ? 'Opening...' : 'Log In →'}
            </button>
          </form>

          <p className="signup-login-text" style={{ marginTop: 20 }}>
            New here? <Link to="/signup" className="welcome-login-link">Create your diary</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
