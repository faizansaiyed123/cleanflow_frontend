import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('cleanflow_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const me = await api.get('/api/auth/me');
      setUser(me);
    } catch {
      localStorage.removeItem('cleanflow_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const resp = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('cleanflow_token', resp.access_token);
    await loadMe();
    return resp;
  };

  const logout = () => {
    localStorage.removeItem('cleanflow_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
