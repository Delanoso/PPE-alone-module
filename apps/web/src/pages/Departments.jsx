import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Departments.css';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(new Set());

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

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="departments-page">
      <header className="page-header">
        <h1>Departments</h1>
        <p>Department and sub-department master data</p>
      </header>

      <div className="departments-list">
        {departments.map((d) => (
          <div key={d.id} className="dept-card">
            <button type="button" className="dept-header" onClick={() => toggle(d.id)}>
              <span className="dept-name">{d.name}</span>
              <span className="dept-toggle">{expanded.has(d.id) ? '−' : '+'}</span>
            </button>
            {expanded.has(d.id) && (
              <div className="dept-subs">
                {d.sub_departments?.length ? (
                  d.sub_departments.map((s) => (
                    <div key={s.id} className="sub-row">
                      <span>{s.name}</span>
                      <span className="badge success">Active</span>
                    </div>
                  ))
                ) : (
                  <p className="muted">No sub-departments</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
