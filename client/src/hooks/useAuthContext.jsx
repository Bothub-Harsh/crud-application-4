import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, try to restore session from localStorage token
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('todo_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.me();
        setUser(res.data.user);
      } catch {
        localStorage.removeItem('todo_token');
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem('todo_token', res.data.token);
    setUser(res.data.user);
    return res;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    localStorage.setItem('todo_token', res.data.token);
    setUser(res.data.user);
    return res;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('todo_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
