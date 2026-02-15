import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Departments.css';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(new Set());
  const [addingDept, setAddingDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [addingSub, setAddingSub] = useState(null);
  const [newSubName, setNewSubName] = useState('');
  const [editingDept, setEditingDept] = useState(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [editingSub, setEditingSub] = useState(null);
  const [editSubName, setEditSubName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await api('/departments');
      setDepartments(r.data || []);
    } finally {
      setLoading(false);
    }
  }

  const toggle = (id) => {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAddDept = async (e) => {
    e?.preventDefault();
    if (!newDeptName.trim()) return;
    setError('');
    setSaving(true);
    try {
      await api('/departments', { method: 'POST', body: { name: newDeptName.trim() } });
      setNewDeptName('');
      setAddingDept(false);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to add department');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSub = async (e) => {
    e?.preventDefault();
    if (!addingSub || !newSubName.trim()) return;
    setError('');
    setSaving(true);
    try {
      await api(`/departments/${addingSub}/sub-departments`, {
        method: 'POST',
        body: { name: newSubName.trim() },
      });
      setNewSubName('');
      setAddingSub(null);
      await load();
    } catch (err) {
      setError(err.message || 'Failed to add sub-department');
    } finally {
      setSaving(false);
    }
  };

  const handleEditDept = async (e) => {
    e?.preventDefault();
    if (!editingDept || !editDeptName.trim()) return;
    setError('');
    setSaving(true);
    try {
      await api(`/departments/${editingDept}`, { method: 'PATCH', body: { name: editDeptName.trim() } });
      setEditingDept(null);
      setEditDeptName('');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update department');
    } finally {
      setSaving(false);
    }
  };

  const handleEditSub = async (e) => {
    e?.preventDefault();
    if (!editingSub || !editSubName.trim()) return;
    const [deptId, subId] = editingSub.split(':');
    setError('');
    setSaving(true);
    try {
      await api(`/departments/${deptId}/sub-departments/${subId}`, {
        method: 'PATCH',
        body: { name: editSubName.trim() },
      });
      setEditingSub(null);
      setEditSubName('');
      await load();
    } catch (err) {
      setError(err.message || 'Failed to update sub-department');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDept = async (d) => {
    if (!confirm(`Delete department "${d.name}"? This will also remove all its sub-departments. You can only delete if no people are assigned.`)) return;
    setError('');
    try {
      await api(`/departments/${d.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err.message || 'Failed to delete. Make sure no people are assigned to this department.');
    }
  };

  const handleDeleteSub = async (d, s) => {
    if (!confirm(`Delete sub-department "${s.name}"?`)) return;
    setError('');
    try {
      await api(`/departments/${d.id}/sub-departments/${s.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err.message || 'Failed to delete. Reassign people first.');
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="departments-page">
      <header className="page-header flex">
        <div>
          <h1>Departments</h1>
          <p>Manage departments and sub-departments. Add &quot;Drivers&quot; for driver teams; create others (Warehouse, Office, etc.) as needed.</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setAddingDept(true)}
          disabled={addingDept}
        >
          Add department
        </button>
      </header>

      {error && <div className="form-error">{error}</div>}

      {addingDept && (
        <form onSubmit={handleAddDept} className="dept-add-form">
          <input
            type="text"
            placeholder="Department name (e.g. Drivers)"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Adding...' : 'Add'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => { setAddingDept(false); setNewDeptName(''); setError(''); }}>
            Cancel
          </button>
        </form>
      )}

      <div className="departments-list">
        {departments.map((d) => (
          <div key={d.id} className="dept-card">
            <div className="dept-header-row">
              <button type="button" className="dept-header" onClick={() => toggle(d.id)}>
                <span className="dept-name">
                  {editingDept === d.id ? (
                    <form onSubmit={handleEditDept} onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editDeptName}
                        onChange={(e) => setEditDeptName(e.target.value)}
                        autoFocus
                      />
                      <button type="submit" className="btn-small">Save</button>
                      <button type="button" className="btn-small" onClick={() => { setEditingDept(null); setEditDeptName(''); }}>Cancel</button>
                    </form>
                  ) : (
                    d.name
                  )}
                </span>
                {editingDept !== d.id && <span className="dept-toggle">{expanded.has(d.id) ? '−' : '+'}</span>}
              </button>
              {editingDept !== d.id && (
                <div className="dept-actions">
                  <button type="button" className="btn-link" onClick={(e) => { e.stopPropagation(); setEditingDept(d.id); setEditDeptName(d.name); }}>Edit</button>
                  <button type="button" className="btn-delete" onClick={(e) => { e.stopPropagation(); handleDeleteDept(d); }}>Delete</button>
                </div>
              )}
            </div>
            {expanded.has(d.id) && (
              <div className="dept-subs">
                {d.sub_departments?.length ? (
                  d.sub_departments.map((s) => (
                    <div key={s.id} className="sub-row">
                      {editingSub === `${d.id}:${s.id}` ? (
                        <form onSubmit={handleEditSub} className="sub-edit-form">
                          <input
                            type="text"
                            value={editSubName}
                            onChange={(e) => setEditSubName(e.target.value)}
                            autoFocus
                          />
                          <button type="submit" className="btn-small">Save</button>
                          <button type="button" className="btn-small" onClick={() => { setEditingSub(null); setEditSubName(''); }}>Cancel</button>
                        </form>
                      ) : (
                        <>
                          <span>{s.name}</span>
                          <span className="badge success">Active</span>
                          <div className="sub-actions">
                            <button type="button" className="btn-link" onClick={() => { setEditingSub(`${d.id}:${s.id}`); setEditSubName(s.name); }}>Edit</button>
                            <button type="button" className="btn-delete" onClick={() => handleDeleteSub(d, s)}>Delete</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="muted">No sub-departments</p>
                )}
                {addingSub === d.id ? (
                  <form onSubmit={handleAddSub} className="sub-add-form">
                    <input
                      type="text"
                      placeholder="Sub-department name"
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      autoFocus
                    />
                    <button type="submit" className="btn-primary" disabled={saving}>Add</button>
                    <button type="button" className="btn-secondary" onClick={() => { setAddingSub(null); setNewSubName(''); }}>Cancel</button>
                  </form>
                ) : (
                  <button type="button" className="btn-add-sub" onClick={() => setAddingSub(d.id)}>
                    + Add sub-department
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
