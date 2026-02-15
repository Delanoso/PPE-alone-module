import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/people').then((r) => setPeople(r.data || [])).finally(() => setLoading(false));
  }, []);

  // Auto-reload every 5 minutes when viewed via ngrok (e.g. wall display)
  useEffect(() => {
    if (!window.location.hostname.includes('ngrok')) return;
    const id = setInterval(() => window.location.reload(), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (loading) return <div className="page-loading">Loading...</div>;

  const total = people.length;
  const withSizes = people.filter((p) => {
    const s = p.size_profile || {};
    const ppeItems = p.ppe_items || [];
    const keysToCheck = ppeItems.length > 0
      ? ppeItems.filter((i) => i.size_key).map((i) => i.size_key)
      : ['coverall_size', 'shoe_size', 'reflective_vest_size', 'clothing_size'];
    return keysToCheck.every((k) => s[k] && String(s[k]).trim());
  }).length;

  const byDept = {};
  people.forEach((p) => {
    const id = p.department_id || 'unassigned';
    const name = p.department_name || 'Unassigned';
    if (!byDept[id]) byDept[id] = { name, count: 0 };
    byDept[id].count++;
  });

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Personnel overview by department</p>
      </header>

      <div className="dashboard-cards">
        <Link to="/people" className="stat-card stat-link">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total people</span>
        </Link>
        <div className="stat-card">
          <span className="stat-value">{withSizes}</span>
          <span className="stat-label">With PPE sizes recorded</span>
        </div>
        {Object.entries(byDept).map(([id, { name, count }]) => (
          <Link key={id} to={id === 'unassigned' ? '/people' : `/people?department_id=${id}`} className="stat-card stat-link">
            <span className="stat-value">{count}</span>
            <span className="stat-label">{name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
