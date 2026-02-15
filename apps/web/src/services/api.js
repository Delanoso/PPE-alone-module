/** Same logic everywhere: when not localhost, use current page origin so laptop and phone see the same data. */
function getApiBase() {
  if (typeof import.meta.env.VITE_API_BASE !== 'undefined' && import.meta.env.VITE_API_BASE !== '') {
    return import.meta.env.VITE_API_BASE;
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'http://127.0.0.1:3001';
    return window.location.origin; // same origin = same data on laptop and phone
  }
  return '';
}

const API_BASE = getApiBase() + '/api/v1';

function getToken() {
  return localStorage.getItem('ppe_token');
}

export { getApiBase };

export async function api(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const fetchOpts = { ...options, headers, cache: 'no-store' }; // always fresh data on both devices
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    fetchOpts.body = JSON.stringify(options.body);
  }
  const res = await fetch(url, fetchOpts);
  const text = await res.text();
  const data = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};
  if (!res.ok) {
    if (res.status === 401 && getToken()) {
      localStorage.removeItem('ppe_token');
      localStorage.removeItem('ppe_user');
      const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
      window.location.replace(`${window.location.origin}${base}/login`);
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error(data.error?.message || `HTTP ${res.status}`);
  }
  return data;
}
