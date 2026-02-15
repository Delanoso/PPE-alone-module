import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ company_id: '', username: '', full_name: '', email: '', password: '' });

  useEffect(() => {
    Promise.all([api('/admin/users'), api('/admin/companies')])
      .then(([ur, cr]) => {
        setUsers(ur.data || []);
        setCompanies(cr.data || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter
    ? users.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(filter.toLowerCase()) ||
          u.email?.toLowerCase().includes(filter.toLowerCase()) ||
          u.company_name?.toLowerCase().includes(filter.toLowerCase())
      )
    : users;

  const handleBlock = async (u) => {
    if (!confirm(`${u.status === 'ACTIVE' ? 'Block' : 'Unblock'} user "${u.full_name}"?`)) return;
    try {
      await api(`/admin/users/${u.id}`, {
        method: 'PATCH',
        body: { status: u.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' },
      });
      const r = await api('/admin/users');
      setUsers(r.data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAdd = async (e) => {
    e?.preventDefault();
    if (!form.company_id || !form.username || !form.full_name || !form.password) {
      setError('Company, username, full name, and password required');
      return;
    }
    try {
      await api('/admin/users', { method: 'POST', body: form });
      setForm({ company_id: '', username: '', full_name: '', email: '', password: '' });
      setAdding(false);
      const r = await api('/admin/users');
      setUsers(r.data || []);
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Users</h1>
        <button type="button" className="btn-primary" onClick={() => setAdding(true)} disabled={adding}>
          Add user
        </button>
      </header>
      {error && <div className="form-error">{error}</div>}
      {adding && (
        <form onSubmit={handleAdd} className="admin-add-form admin-add-user">
          <select value={form.company_id} onChange={(e) => setForm((f) => ({ ...f, company_id: e.target.value }))} required>
            <option value="">Select company</option>
            {companies.filter((c) => c.status === 'ACTIVE').map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input placeholder="Username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required />
          <input placeholder="Full name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} required />
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required />
          <button type="submit" className="btn-primary">Add</button>
          <button type="button" className="btn-secondary" onClick={() => setAdding(false)}>Cancel</button>
        </form>
      )}
      <div className="admin-filters">
        <input
          type="search"
          placeholder="Search by name, email, or company..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="admin-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Company</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>{u.full_name}</td>
                <td>{u.username}</td>
                <td>{u.email || '-'}</td>
                <td>{u.company_name || '-'}</td>
                <td>
                  <span className={`badge ${u.status === 'ACTIVE' ? 'success' : 'error'}`}>{u.status}</span>
                </td>
                <td>
                  <button
                    type="button"
                    className={u.status === 'ACTIVE' ? 'btn-delete' : 'btn-link'}
                    onClick={() => handleBlock(u)}
                  >
                    {u.status === 'ACTIVE' ? 'Block' : 'Unblock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
