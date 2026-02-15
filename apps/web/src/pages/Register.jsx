import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiBase } from '../services/api';
import './Login.css';

export default function Register() {
  const [form, setForm] = useState({
    company_name: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${getApiBase()}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          company_name: form.company_name.trim(),
          admin_name: form.admin_name.trim(),
          admin_email: form.admin_email.trim(),
          admin_password: form.admin_password,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!json.success) {
        throw new Error(json.error?.message || 'Registration failed');
      }
      navigate('/login', { state: { message: 'Company registered. You can now log in.' } });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>PPE Issue Management</h1>
          <p>Register your company</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}
          <label>
            <span>Company name *</span>
            <input
              name="company_name"
              type="text"
              value={form.company_name}
              onChange={handleChange}
              placeholder="Your Company Ltd"
              required
            />
          </label>
          <label>
            <span>Admin full name *</span>
            <input
              name="admin_name"
              type="text"
              value={form.admin_name}
              onChange={handleChange}
              placeholder="John Smith"
              required
            />
          </label>
          <label>
            <span>Admin email *</span>
            <input
              name="admin_email"
              type="email"
              value={form.admin_email}
              onChange={handleChange}
              placeholder="admin@company.com"
              required
            />
          </label>
          <label>
            <span>Password *</span>
            <input
              name="admin_password"
              type="password"
              value={form.admin_password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </label>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register company'}
          </button>
        </form>
        <p className="login-hint">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
