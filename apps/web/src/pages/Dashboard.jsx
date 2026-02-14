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

  if (loading) return <div className="page-loading">Loading...</div>;

  const total = people.length;
  const withSizes = people.filter((p) => {
    const s = p.size_profile || {};
    return s.coverall_size || s.shoe_size || s.reflective_vest_size || s.clothing_size;
  }).length;

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Refrigerated drivers overview</p>
      </header>

      <div className="dashboard-cards">
        <Link to="/people" className="stat-card stat-link">
          <span className="stat-value">{total}</span>
          <span className="stat-label">Total drivers</span>
        </Link>
        <div className="stat-card">
          <span className="stat-value">{withSizes}</span>
          <span className="stat-label">With PPE sizes recorded</span>
        </div>
      </div>
    </div>
  );
}
