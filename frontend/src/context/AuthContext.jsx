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

    if (!token || !cached) {
      setReady(true);
      return;
    }

    setAuthToken(token);
    setUser(JSON.parse(cached));

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
