import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../api/client';
import { DEMO_MODE, authenticateDemo, getDemoUserFromToken } from '../demo/demoApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('cleanflow_token');
    if (DEMO_MODE) {
      setUser(getDemoUserFromToken(token));
      setLoading(false);
      return;
    }
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
    if (DEMO_MODE) {
      const demoUser = authenticateDemo(email, password);
      localStorage.setItem('cleanflow_token', `cleanflow-demo:${demoUser.id}`);
      setUser(demoUser);
      return demoUser;
    }
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
    <AuthContext.Provider value={{ user, loading, login, logout, refresh: loadMe, isDemo: DEMO_MODE }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
