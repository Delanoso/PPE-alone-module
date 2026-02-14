const apiBase = import.meta.env.VITE_API_BASE ?? (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location?.hostname) ? 'http://127.0.0.1:3001' : '');
const API_BASE = apiBase + '/api/v1';

function getToken() {
  return localStorage.getItem('ppe_token');
}

export async function api(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const fetchOpts = { ...options, headers };
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    fetchOpts.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, fetchOpts);
  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
  return data;
}
