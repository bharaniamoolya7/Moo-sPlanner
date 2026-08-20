import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PixelAvatar, { AVATAR_OPTIONS } from '../components/PixelAvatar';
import './Signup.css';

export default function Signup() {
  const [step, setStep] = useState(1); // 1 = account, 2 = avatar
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarConfig, setAvatarConfig] = useState({
    gender: 'girl',
    skinColor: AVATAR_OPTIONS.SKIN_COLORS[0],
    hairColor: AVATAR_OPTIONS.HAIR_COLORS[0],
    hairStyle: 'long',
    outfitColor: AVATAR_OPTIONS.OUTFIT_COLORS[0],
    eyeStyle: 'dot',
    accessory: 'none',
  });

  const { signup, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    if (password.length < 4) {
      showToast('Password must be at least 4 characters', 'error');
      return;
    }
    setStep(2);
  };

  const handleSignup = async () => {
    setLoading(true);
    const result = await signup(displayName, email, password);
    if (result.success) {
      // Save avatar config
      try {
        const { default: api } = await import('../services/api');
        await api.put(`/api/users/${result.user.id}/avatar`, avatarConfig);
        updateUser({ ...result.user, avatarConfig });
      } catch {
        // Avatar save failed but account created - still continue
        updateUser({ ...result.user, avatarConfig });
      }
      showToast("Welcome to moo'splanner! ♡");
      navigate('/dashboard');
    } else {
      showToast(result.error, 'error');
    }
    setLoading(false);
  };

  const updateAvatar = (key, value) => {
    setAvatarConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="signup-page">
      <div className="retro-window signup-window">
        {/* Title bar */}
        <div className="retro-window-titlebar">
          <span>moo'splanner Setup</span>
          <div className="retro-window-buttons">
            <div className="retro-window-btn red"></div>
            <div className="retro-window-btn blue"></div>
            <div className="retro-window-btn white"></div>
          </div>
        </div>

        <div className="signup-content">
          {/* Left side - Avatar Preview */}
          <div className="signup-left">
            <span className="signup-star-decor">✦</span>
            
            <div className="pixel-mirror">
              <div className="pixel-mirror-header">
                <span>✧ PIXEL MIRROR ✧</span>
                <span className="heart-decoration">♡</span>
              </div>
              <div className="pixel-mirror-body">
                <div className="pixel-mirror-name">{displayName || 'You'}</div>
                <div className="pixel-mirror-sub">Customize Your Soul</div>
                <div className="pixel-mirror-avatar">
                  <PixelAvatar config={avatarConfig} size={120} />
                </div>
                {step === 2 && (
                  <div className="pixel-mirror-badges">
                    <span className="badge badge-green" style={{ fontSize: '7px' }}>Cute Adventurer</span>
                    <span className="badge badge-blue" style={{ fontSize: '7px' }}>Loot Goblin</span>
                  </div>
                )}
              </div>
              <div className="pixel-mirror-level">
                <span className="badge badge-red">Lvl 1 Newbie</span>
              </div>
            </div>

            <p className="signup-left-text">
              Create your digital self! This buddy will guide you through your daily tasks.
            </p>
            <span className="signup-star-decor2">⭐</span>
          </div>

          {/* Right side - Form */}
          <div className="signup-right">
            {/* Step indicator */}
            <div className="step-indicator">
              <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>
                <span className="step-icon">□</span>
                <span className="step-label">ACCOUNT</span>
              </div>
              <div className="step-line"></div>
              <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>
                <span className="step-icon">□</span>
                <span className="step-label">AVATAR</span>
              </div>
            </div>

            {step === 1 ? (
              <>
                <h2 className="signup-heading">Welcome to moo'splanner</h2>
                <p className="signup-subheading">Let&apos;s set up your cozy productivity journal.</p>

                <form onSubmit={handleNextStep}>
                  <div className="input-group">
                    <label className="input-label">
                      <span>👤</span> Display Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. PixelHero99"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">
                      <span>✉</span> Email Address
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="hello@moosplanner.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
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

                  <button type="submit" className="btn btn-primary signup-next-btn">
                    Next Step →
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="signup-heading">Design Your Avatar</h2>
                <p className="signup-subheading">Make it uniquely you! ♡</p>

                <div className="avatar-customizer">
                  <div className="avatar-option-group">
                    <label className="input-label">Avatar Style (Gender)</label>
                    <div className="style-picker-row">
                      {AVATAR_OPTIONS.GENDERS.map(g => (
                        <button
                          key={g}
                          className={`style-btn ${avatarConfig.gender === g ? 'selected' : ''}`}
                          style={{ textTransform: 'capitalize' }}
                          onClick={() => { updateAvatar('gender', g); updateAvatar('hairStyle', g === 'boy' ? 'spiky' : 'twin_tails'); }}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="avatar-option-group">
                    <label className="input-label">Skin Tone</label>
                    <div className="color-picker-row">
                      {AVATAR_OPTIONS.SKIN_COLORS.map(c => (
                        <button
                          key={c}
                          className={`color-swatch ${avatarConfig.skinColor === c ? 'selected' : ''}`}
                          style={{ background: c }}
                          onClick={() => updateAvatar('skinColor', c)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="avatar-option-group">
                    <label className="input-label">Hair Color</label>
                    <div className="color-picker-row">
                      {AVATAR_OPTIONS.HAIR_COLORS.map(c => (
                        <button
                          key={c}
                          className={`color-swatch ${avatarConfig.hairColor === c ? 'selected' : ''}`}
                          style={{ background: c }}
                          onClick={() => updateAvatar('hairColor', c)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="avatar-option-group">
                    <label className="input-label">Hair Style</label>
                    <div className="style-picker-row">
                      {(avatarConfig.gender === 'boy' 
                        ? ['spiky', 'slick_back', 'crew_cut', 'side_part', 'fluffy', 'cap']
                        : ['twin_tails', 'bob', 'long', 'spiky', 'cap']
                      ).map(s => (
                        <button
                          key={s}
                          className={`style-btn ${avatarConfig.hairStyle === s ? 'selected' : ''}`}
                          onClick={() => updateAvatar('hairStyle', s)}
                          style={{ textTransform: 'capitalize' }}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="avatar-option-group">
                    <label className="input-label">Outfit Color</label>
                    <div className="color-picker-row">
                      {AVATAR_OPTIONS.OUTFIT_COLORS.map(c => (
                        <button
                          key={c}
                          className={`color-swatch ${avatarConfig.outfitColor === c ? 'selected' : ''}`}
                          style={{ background: c }}
                          onClick={() => updateAvatar('outfitColor', c)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="avatar-option-group">
                    <label className="input-label">Eyes</label>
                    <div className="style-picker-row">
                      {AVATAR_OPTIONS.EYE_STYLES.map(s => (
                        <button
                          key={s}
                          className={`style-btn ${avatarConfig.eyeStyle === s ? 'selected' : ''}`}
                          onClick={() => updateAvatar('eyeStyle', s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="avatar-option-group">
                    <label className="input-label">Accessory</label>
                    <div className="style-picker-row">
                      {AVATAR_OPTIONS.ACCESSORIES.map(s => (
                        <button
                          key={s}
                          className={`style-btn ${avatarConfig.accessory === s ? 'selected' : ''}`}
                          onClick={() => updateAvatar('accessory', s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="signup-btn-row">
                  <button className="btn btn-outline btn-sm" onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSignup}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create My Diary ♡'}
                  </button>
                </div>
              </>
            )}

            <p className="signup-login-text">
              Already have a diary? <Link to="/login" className="welcome-login-link">Log In Here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
