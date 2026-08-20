import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('moosplanner_user') || localStorage.getItem('remtodo_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        // Try verifying with backend in background
        api.get(`/api/users/${parsed.id}`)
          .then(res => {
            if (res.data) {
              setUser(res.data);
              localStorage.setItem('moosplanner_user', JSON.stringify(res.data));
            }
          })
          .catch(() => {
            // Keep local session if backend is down
          });
      } catch {
        localStorage.removeItem('moosplanner_user');
        localStorage.removeItem('remtodo_user');
      }
    }
    setLoading(false);
  }, []);

  const getStableUserId = (email, existingId) => {
    if (existingId && !String(existingId).startsWith('temp-')) return existingId;
    if (!email) return 'guest';
    return `user_${email.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_')}`;
  };

  const login = async (email, password) => {
    const localUsers = JSON.parse(localStorage.getItem('moosplanner_local_users') || localStorage.getItem('remtodo_local_users') || '[]');
    const foundLocal = localUsers.find(u => u.email === email && u.password === password);

    try {
      const res = await api.post('/api/auth/login', { email, password });
      const userData = res.data;
      if (userData) {
        setUser(userData);
        localStorage.setItem('moosplanner_user', JSON.stringify(userData));
        return { success: true, user: userData };
      }
    } catch (err) {
      if (foundLocal) {
        setUser(foundLocal);
        localStorage.setItem('moosplanner_user', JSON.stringify(foundLocal));
        return { success: true, user: foundLocal };
      }

      // If backend error response exists (e.g. 401 Bad Credentials)
      if (err.response && err.response.status === 401) {
        return { success: false, error: err.response.data || 'Invalid email or password' };
      }

      // If backend is offline, create/restore a stable offline session for this email
      const stableId = getStableUserId(email);
      const fallbackUser = {
        id: stableId,
        displayName: email.split('@')[0],
        email,
        password,
        avatarConfig: { gender: 'girl', hairStyle: 'twin_tails' }
      };

      const updatedLocal = [...localUsers.filter(u => u.email !== email), fallbackUser];
      localStorage.setItem('moosplanner_local_users', JSON.stringify(updatedLocal));

      setUser(fallbackUser);
      localStorage.setItem('moosplanner_user', JSON.stringify(fallbackUser));
      return { success: true, user: fallbackUser };
    }
  };

  const signup = async (displayName, email, password) => {
    const stableId = getStableUserId(email);
    const newUser = {
      id: stableId,
      displayName,
      email,
      password,
      avatarConfig: { gender: 'girl', hairStyle: 'twin_tails' }
    };

    try {
      const res = await api.post('/api/auth/signup', { displayName, email, password });
      const userData = res.data || newUser;
      setUser(userData);
      localStorage.setItem('moosplanner_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      // Backend is offline or database error - enable smooth local mode
      const localUsers = JSON.parse(localStorage.getItem('moosplanner_local_users') || localStorage.getItem('remtodo_local_users') || '[]');
      const updatedLocal = [...localUsers.filter(u => u.email !== email), newUser];
      localStorage.setItem('moosplanner_local_users', JSON.stringify(updatedLocal));

      setUser(newUser);
      localStorage.setItem('moosplanner_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('moosplanner_user');
    localStorage.removeItem('remtodo_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('moosplanner_user', JSON.stringify(updatedUser));

    // Also update moosplanner_local_users so avatar and profile changes persist across login/logout
    try {
      const localUsers = JSON.parse(localStorage.getItem('moosplanner_local_users') || localStorage.getItem('remtodo_local_users') || '[]');
      const updatedList = localUsers.map(u => u.email === updatedUser.email ? { ...u, ...updatedUser } : u);
      if (!updatedList.some(u => u.email === updatedUser.email)) {
        updatedList.push(updatedUser);
      }
      localStorage.setItem('moosplanner_local_users', JSON.stringify(updatedList));
    } catch (e) {
      console.warn('Failed to save user to localUsers list:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
