import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => { try { const v = localStorage.getItem('ppe_user'); return v ? JSON.parse(v) : null; } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('ppe_token'));
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      // Use VITE_API_BASE when set (e.g. ngrok API tunnel). Else: direct API on localhost, or '' for same-origin proxy.
      const apiBase = import.meta.env.VITE_API_BASE ?? (['localhost', '127.0.0.1'].includes(window.location?.hostname || '') ? 'http://127.0.0.1:3001' : '');
      const res = await fetch(`${apiBase}/api/v1/auth/login`, {
        method: 'POST',
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
