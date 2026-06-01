import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /** Persist tokens and user after successful auth */
  const setAuth = useCallback((data) => {
    const { accessToken, refreshToken, user: userData } = data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore logout API errors — clear local state anyway
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  /** Restore session from localStorage and validate with profile API */
  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');

      if (!stored || !accessToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authService.getProfile();
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
      } catch {
        localStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    setAuth,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
