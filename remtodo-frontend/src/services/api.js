import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8085',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const user = localStorage.getItem('moosplanner_user') || localStorage.getItem('remtodo_user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      if (parsed.id) {
        config.headers['X-User-Id'] = parsed.id;
      }
    } catch {
      // ignore
    }
  }
  return config;
});

export default api;
