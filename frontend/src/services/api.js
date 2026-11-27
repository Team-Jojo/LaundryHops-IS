import axios from 'axios';

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
});

let token = localStorage.getItem('lh_token');

export function setAuthToken(newToken) {
  token = newToken || null;
  if (newToken) localStorage.setItem('lh_token', newToken);
  else localStorage.removeItem('lh_token');
}

api.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-sign-out when a stored token turns out to be invalid/expired
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401 && localStorage.getItem('lh_token')) {
      localStorage.removeItem('lh_token');
      localStorage.removeItem('lh_user');
      if (window.location.pathname !== '/login') window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const errMsg = (e) =>
  (e && e.response && e.response.data && e.response.data.message) ||
  (e && e.message) ||
  'Something went wrong.';
