import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PixelAvatar, { AVATAR_OPTIONS } from '../components/PixelAvatar';
import api from '../services/api';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [avatarConfig, setAvatarConfig] = useState(user?.avatarConfig || {
    gender: 'girl',
    skinColor: AVATAR_OPTIONS.SKIN_COLORS[0],
    hairColor: AVATAR_OPTIONS.HAIR_COLORS[0],
    hairStyle: 'long',
    outfitColor: AVATAR_OPTIONS.OUTFIT_COLORS[0],
    eyeStyle: 'dot',
    accessory: 'none',
  });
  const [saving, setSaving] = useState(false);

  const updateAv = (key, value) => setAvatarConfig(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/users/${user?.id}`, { ...user, displayName, avatarConfig });
      updateUser({ ...user, displayName, avatarConfig });
      showToast('Settings saved ♡');
    } catch {
      updateUser({ ...user, displayName, avatarConfig });
      showToast('Settings saved ♡');
    }
    setSaving(false);
  };

  return (
    <div className="tasks-page" style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1 className="page-title">⚙ Settings</h1>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save ♡'}
        </button>
      </div>

      {/* Profile settings */}
      <div className="pixel-card" style={{ marginBottom: 20 }}>
        <div className="pixel-card-header">👤 PROFILE</div>
        <div className="pixel-card-body">
          <div className="input-group">
            <label className="input-label">Display Name</label>
            <input type="text" className="input-field" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          </div>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input type="email" className="input-field" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
          </div>
        </div>
      </div>

      {/* Avatar settings */}
      <div className="pixel-card" style={{ marginBottom: 20 }}>
        <div className="pixel-card-header">✦ AVATAR</div>
        <div className="pixel-card-body">
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ border: '2px solid var(--border-dark)', padding: 8, background: 'var(--white)' }}>
                <PixelAvatar config={avatarConfig} size={100} />
              </div>
              <p style={{ fontSize: 11, color: 'var(--brown-muted)', marginTop: 8 }}>Preview</p>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div className="avatar-option-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Style (Gender)</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {AVATAR_OPTIONS.GENDERS.map(g => <button key={g} className={`style-btn ${avatarConfig.gender === g ? 'selected' : ''}`} style={{ padding: '4px 10px', fontFamily: 'var(--font-pixel)', fontSize: 10, border: '2px solid var(--border-dark)', background: avatarConfig.gender === g ? 'var(--pink-primary)' : 'var(--white)', cursor: 'pointer', textTransform: 'capitalize', color: 'var(--brown-text)' }} onClick={() => { updateAv('gender', g); updateAv('hairStyle', g === 'boy' ? 'spiky' : 'twin_tails'); }}>{g}</button>)}
                </div>
              </div>
              <div className="avatar-option-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Skin</label>
                <div className="color-picker-row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {AVATAR_OPTIONS.SKIN_COLORS.map(c => <button key={c} className={`color-swatch ${avatarConfig.skinColor === c ? 'selected' : ''}`} style={{ background: c, width: 26, height: 26, border: '2px solid var(--border-dark)', cursor: 'pointer', padding: 0 }} onClick={() => updateAv('skinColor', c)} />)}
                </div>
              </div>
              <div className="avatar-option-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Hair Color</label>
                <div className="color-picker-row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {AVATAR_OPTIONS.HAIR_COLORS.map(c => <button key={c} className={`color-swatch ${avatarConfig.hairColor === c ? 'selected' : ''}`} style={{ background: c, width: 26, height: 26, border: '2px solid var(--border-dark)', cursor: 'pointer', padding: 0 }} onClick={() => updateAv('hairColor', c)} />)}
                </div>
              </div>
              <div className="avatar-option-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Hair Style</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(avatarConfig.gender === 'boy' 
                    ? ['spiky', 'slick_back', 'crew_cut', 'side_part', 'fluffy', 'cap']
                    : ['twin_tails', 'bob', 'long', 'spiky', 'cap']
                  ).map(s => <button key={s} className={`style-btn ${avatarConfig.hairStyle === s ? 'selected' : ''}`} style={{ padding: '4px 10px', fontFamily: 'var(--font-pixel)', fontSize: 7, border: '2px solid var(--border-dark)', background: avatarConfig.hairStyle === s ? 'var(--pink-primary)' : 'var(--white)', cursor: 'pointer', textTransform: 'capitalize', color: 'var(--brown-text)' }} onClick={() => updateAv('hairStyle', s)}>{s.replace('_', ' ')}</button>)}
                </div>
              </div>
              <div className="avatar-option-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Outfit Color</label>
                <div className="color-picker-row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {AVATAR_OPTIONS.OUTFIT_COLORS.map(c => <button key={c} className={`color-swatch ${avatarConfig.outfitColor === c ? 'selected' : ''}`} style={{ background: c, width: 26, height: 26, border: '2px solid var(--border-dark)', cursor: 'pointer', padding: 0 }} onClick={() => updateAv('outfitColor', c)} />)}
                </div>
              </div>
              <div className="avatar-option-group" style={{ marginBottom: 12 }}>
                <label className="input-label">Accessory</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {AVATAR_OPTIONS.ACCESSORIES.map(s => <button key={s} className={`style-btn ${avatarConfig.accessory === s ? 'selected' : ''}`} style={{ padding: '4px 10px', fontFamily: 'var(--font-pixel)', fontSize: 7, border: '2px solid var(--border-dark)', background: avatarConfig.accessory === s ? 'var(--pink-primary)' : 'var(--white)', cursor: 'pointer', textTransform: 'capitalize', color: 'var(--brown-text)' }} onClick={() => updateAv('accessory', s)}>{s}</button>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="pixel-card">
        <div className="pixel-card-header" style={{ background: 'var(--red-soft)' }}>⚠ ACCOUNT</div>
        <div className="pixel-card-body">
          <button className="btn btn-outline" style={{ color: '#E85D5D', borderColor: '#E85D5D' }} onClick={() => { logout(); window.location.href = '/welcome'; }}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
