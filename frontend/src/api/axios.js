import axios from 'axios';

// Strip any trailing slashes from VITE_API_URL to prevent double-slash URLs
// e.g. "https://backend.onrender.com/" -> "https://backend.onrender.com/api/v1"
const _rawBase = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${_rawBase}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
