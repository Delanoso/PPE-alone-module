import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Admin.css';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await api('/admin/companies');
      setCompanies(r.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const handleBlock = async (c) => {
    if (!confirm(`${c.status === 'ACTIVE' ? 'Block' : 'Unblock'} company "${c.name}"?`)) return;
    try {
      await api(`/admin/companies/${c.id}`, {
        method: 'PATCH',
        body: { status: c.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE' },
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleAdd = async (e) => {
    e?.preventDefault();
    if (!newName.trim()) return;
    try {
      await api('/admin/companies', { method: 'POST', body: { name: newName.trim() } });
      setNewName('');
      setAdding(false);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <h1>Companies</h1>
        <button type="button" className="btn-primary" onClick={() => setAdding(true)} disabled={adding}>
          Add company
        </button>
      </header>
      {error && <div className="form-error">{error}</div>}
      {adding && (
        <form onSubmit={handleAdd} className="admin-add-form">
          <input
            type="text"
            placeholder="Company name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary">Add</button>
          <button type="button" className="btn-secondary" onClick={() => { setAdding(false); setNewName(''); }}>Cancel</button>
        </form>
      )}
      <div className="admin-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Users</th>
              <th>People</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>
                  <span className={`badge ${c.status === 'ACTIVE' ? 'success' : 'error'}`}>{c.status}</span>
                </td>
                <td>{c.user_count ?? '-'}</td>
                <td>{c.people_count ?? '-'}</td>
                <td>
                  <button
                    type="button"
                    className={c.status === 'ACTIVE' ? 'btn-delete' : 'btn-link'}
                    onClick={() => handleBlock(c)}
                  >
                    {c.status === 'ACTIVE' ? 'Block' : 'Unblock'}
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
