import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setAuthToken } from '../services/api';

const AuthContext = createContext(null);

function persist(token, user) {
  setAuthToken(token);
  localStorage.setItem('lh_user', JSON.stringify(user));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Restore session on first load, then verify the token with the API
  useEffect(() => {
    const token = localStorage.getItem('lh_token');
    const cached = localStorage.getItem('lh_user');

    const clearSession = () => {
      localStorage.removeItem('lh_token');
      localStorage.removeItem('lh_user');
      setAuthToken(null);
      setUser(null);
      setReady(true);
    };

    if (!token || !cached) {
      if (!token) localStorage.removeItem('lh_user');
      setAuthToken(token || null);
      setReady(true);
      return;
    }

    let cachedUser;
    try {
      cachedUser = JSON.parse(cached);
      if (
        !cachedUser ||
        typeof cachedUser !== 'object' ||
        !cachedUser.id ||
        typeof cachedUser.full_name !== 'string'
      ) {
        throw new Error('Invalid cached user.');
      }
    } catch {
      clearSession();
      return;
    }

    setAuthToken(token);
    setUser(cachedUser);

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem('lh_user', JSON.stringify(res.data.user));
      })
      .catch(() => {
        // token invalid — the axios interceptor clears storage + redirects
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  // Keep this tab in sync when the API interceptor rejects an expired token
  useEffect(() => {
    const clearUser = () => setUser(null);
    window.addEventListener('lh-auth-cleared', clearUser);
    return () => window.removeEventListener('lh-auth-cleared', clearUser);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    persist(res.data.token, res.data.user);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const res = await api.post('/auth/register', payload);
    persist(res.data.token, res.data.user);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    localStorage.removeItem('lh_user');
    setUser(null);
  }, []);

  const value = {
    user,
    ready,
    login,
    register,
    logout,
    isAdmin: !!user && user.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
