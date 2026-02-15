import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getApiBase } from '../services/api';
import './People.css';

export default function People() {
  const [searchParams] = useSearchParams();
  const deptFromUrl = searchParams.get('department_id') || '';
  const [people, setPeople] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState(deptFromUrl);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api('/departments').then((r) => setDepartments(r.data || []));
  }, []);

  useEffect(() => {
    setDepartmentFilter(deptFromUrl);
  }, [deptFromUrl]);

  useEffect(() => {
    const params = departmentFilter ? `?department_id=${departmentFilter}` : '';
    api(`/people${params}`).then((r) => setPeople(r.data || [])).finally(() => setLoading(false));
  }, [departmentFilter]);

  const handleDelete = async (p) => {
    if (!confirm(`Delete ${p.full_name}? They will be removed from the list and reminders. Issued PPE records (if signed) are kept.`)) return;
    try {
      await api(`/people/${p.id}`, { method: 'DELETE' });
      setPeople((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      alert(e.message || 'Failed to delete');
    }
  };

  const filtered = people.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      if (!p.full_name?.toLowerCase().includes(q) && !p.employee_number?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const token = localStorage.getItem('ppe_token');
    const fd = new FormData();
    fd.append('file', file);
    fetch(`${getApiBase()}/api/v1/people/import`, {
      method: 'POST',
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
      body: fd,
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) throw new Error(data.error?.message || 'Import failed');
        const { created, skipped } = data.data || {};
        alert(`Import complete: ${created} people added, ${skipped} skipped (already exist)`);
        api('/people').then((r) => setPeople(r.data || []));
      })
      .catch((e) => alert(e.message))
      .finally(() => {
        setImporting(false);
        e.target.value = '';
      });
  };

  const handleExportSizes = () => {
    const token = localStorage.getItem('ppe_token');
    const url = `${getApiBase()}/api/v1/people/export/sizes`;
    fetch(url, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}`, 'ngrok-skip-browser-warning': 'true' },
    })
      .then((r) => {
        if (!r.ok) throw new Error(r.statusText || 'Export failed');
        return r.blob();
      })
      .then((blob) => {
        const u = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = u;
        a.download = 'ppe-sizes.xlsx';
        a.click();
        URL.revokeObjectURL(u);
      })
      .catch((e) => alert(e.message));
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="people-page">
      <header className="page-header flex">
        <div>
          <h1>People</h1>
          <p>All personnel by department – PPE sizes</p>
        </div>
        <div className="header-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            className="btn-secondary"
            disabled={importing}
            onClick={() => fileInputRef.current?.click()}
          >
            {importing ? 'Importing...' : 'Import people (Excel)'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleExportSizes}>
            Export sizes (Excel)
          </button>
          <Link to="/people/new" className="btn-primary">
            Add person
          </Link>
        </div>
      </header>

      <div className="filters">
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search by name or employee number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>D NO</th>
              <th>Name</th>
              <th>Department</th>
              <th>Contact number</th>
              <th>Overall pants</th>
              <th>Safety boot</th>
              <th>Reflector vest</th>
              <th>Shirt</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.employee_number}</td>
                <td>{p.full_name}</td>
                <td>{p.department_name || '-'}</td>
                <td>{p.mobile_number}</td>
                <td>{p.size_profile?.coverall_size || '-'}</td>
                <td>{p.size_profile?.shoe_size || '-'}</td>
                <td>{p.size_profile?.reflective_vest_size || '-'}</td>
                <td>{p.size_profile?.clothing_size || '-'}</td>
                <td className="actions-cell">
                  <Link to={`/people/${p.id}/edit`} className="btn-link">Edit</Link>
                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => handleDelete(p)}
                    title="Delete driver"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="muted table-empty">No people found</p>}
      </div>
    </div>
  );
}
