import { createContext, useContext, useState } from 'react';
import { getApiBase } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { const v = localStorage.getItem('ppe_user'); return v ? JSON.parse(v) : null; } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('ppe_token'));
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/login`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ username, password }),
      });
      const text = await res.text();
      const json = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};
      if (!json.success) {
        const msg = json.error?.message || (res.status >= 500 ? `Server error (${res.status})` : `Login failed (${res.status})`);
        throw new Error(msg);
      }
      localStorage.setItem('ppe_token', json.data.access_token);
      localStorage.setItem('ppe_user', JSON.stringify(json.data.user));
      setToken(json.data.access_token);
      setUser(json.data.user);
      return json.data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('ppe_token');
    localStorage.removeItem('ppe_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
