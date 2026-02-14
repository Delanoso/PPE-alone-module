import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './SizeRequests.css';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || window.location.origin;

export default function SizeRequests() {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    person_names: '',
    job_title_filter: 'Driver',
    department_id: '',
  });

  const load = () => {
    setLoading(true);
    Promise.all([api('/size-requests'), api('/departments')])
      .then(([r1, r2]) => {
        setRequests(r1.data || []);
        setDepartments(r2.data || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (selected) {
      api(`/size-requests/${selected.id}`).then((r) => setSelected(r.data)).catch(() => setSelected(null));
    }
  }, [selected?.id]);

  const handleCreate = () => {
    setActionLoading(true);
    setError('');
    api('/size-requests', { method: 'POST', body: newForm })
      .then(() => {
        setShowNew(false);
        setNewForm({ name: '', person_names: '', job_title_filter: 'Driver', department_id: '' });
        load();
        setSelected(null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setActionLoading(false));
  };

  const handleSend = (id) => {
    setActionLoading(true);
    setError('');
    api(`/size-requests/${id}/send`, { method: 'POST' })
      .then(() => {
        load();
        if (selected?.id === id) api(`/size-requests/${id}`).then((r) => setSelected(r.data));
      })
      .catch((e) => setError(e.message))
      .finally(() => setActionLoading(false));
  };

  const handleReminder = (id) => {
    setActionLoading(true);
    setError('');
    api(`/size-requests/${id}/send-reminder`, { method: 'POST' })
      .then(() => {
        load();
        if (selected?.id === id) api(`/size-requests/${id}`).then((r) => setSelected(r.data));
      })
      .catch((e) => setError(e.message))
      .finally(() => setActionLoading(false));
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="size-requests-page">
      <header className="page-header flex">
        <div>
          <h1>PPE Size Requests</h1>
          <p>Send WhatsApp messages to drivers to collect PPE sizes. Reminders only go to non-responders.</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowNew(true)}>
          New size request
        </button>
      </header>

      {error && <div className="form-error">{error}</div>}

      {showNew && (
        <div className="card new-request-card">
          <h2>Create size request</h2>
          <p className="muted">
            Add names (from Webfleet or your list) – one per line – or use job title / department filter.
          </p>
          <div className="form-row">
            <label>
              <span>Request name</span>
              <input
                type="text"
                value={newForm.name}
                onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Q1 2025 Driver sizes"
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              <span>People by name (one per line or comma-separated)</span>
              <textarea
                value={newForm.person_names}
                onChange={(e) => setNewForm((f) => ({ ...f, person_names: e.target.value }))}
                placeholder="Jan Van der Berg, Petrus Smit, Maria Botha (or one name per line)"
                rows={5}
                className="names-textarea"
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              <span>Or filter by job title (contains)</span>
              <input
                type="text"
                value={newForm.job_title_filter}
                onChange={(e) => setNewForm((f) => ({ ...f, job_title_filter: e.target.value }))}
                placeholder="Driver"
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              <span>Department (optional)</span>
              <select
                value={newForm.department_id}
                onChange={(e) => setNewForm((f) => ({ ...f, department_id: e.target.value }))}
              >
                <option value="">All departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setShowNew(false)}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleCreate} disabled={actionLoading}>
              {actionLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      <div className="size-requests-list card">
        <h2>Size requests</h2>
        {requests.length === 0 ? (
          <p className="muted">No size requests yet. Create one to send WhatsApp messages to drivers.</p>
        ) : (
          <div className="request-cards">
            {requests.map((r) => (
              <div
                key={r.id}
                className={`request-card ${selected?.id === r.id ? 'selected' : ''}`}
                onClick={() => setSelected(selected?.id === r.id ? null : r)}
              >
                <div className="request-card-header">
                  <h3>{r.name || 'Untitled'}</h3>
                  <span className="request-date">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <div className="request-stats">
                  <span>{r.total} total</span>
                  <span>{r.sent} sent</span>
                  <span className="responded">{r.responded} responded</span>
                  <span className="pending">{r.sent - r.responded} pending</span>
                </div>
                <div className="request-actions">
                  <button
                    type="button"
                    className="btn-primary btn-sm"
                    onClick={(e) => { e.stopPropagation(); handleSend(r.id); }}
                    disabled={actionLoading || r.sent >= r.total}
                  >
                    Send to all
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={(e) => { e.stopPropagation(); handleReminder(r.id); }}
                    disabled={actionLoading || r.responded >= r.sent || r.sent === 0}
                  >
                    Remind non-responders
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && selected.recipients && (
        <div className="card recipients-card">
          <h2>Recipients – {selected.name}</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Sent</th>
                <th>Responded</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              {selected.recipients.map((rec) => (
                <tr key={rec.id}>
                  <td>{rec.person_name}</td>
                  <td>{rec.mobile_number}</td>
                  <td>{rec.sent_at ? 'Yes' : 'No'}</td>
                  <td>
                    <span className={rec.responded_at ? 'badge success' : 'badge warn'}>
                      {rec.responded_at ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    {rec.sent_at && !rec.responded_at && (
                      <a href={`${PUBLIC_URL}/sizes/${rec.token}`} target="_blank" rel="noreferrer" className="btn-link">
                        Open form
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
