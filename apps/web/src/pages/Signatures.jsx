import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Signatures.css';

export default function Signatures() {
  const [requests, setRequests] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api('/signatures/requests'), api('/issues')])
      .then(([r1, r2]) => {
        setRequests(r1.data || []);
        setIssues(r2.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const pending = issues.filter((i) => i.status === 'PENDING_SIGNATURE');
  const signed = issues.filter((i) => i.status === 'SIGNED');

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="signatures-page">
      <header className="page-header">
        <h1>Signatures</h1>
        <p>Signature requests and acknowledgements</p>
      </header>

      <div className="sig-cards">
        <div className="stat-card">
          <span className="stat-value">{pending.length}</span>
          <span className="stat-label">Pending signature</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{signed.length}</span>
          <span className="stat-label">Signed</span>
        </div>
      </div>

      <div className="card table-card">
        <h2>All issues by signature status</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Issue #</th>
              <th>Employee</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((i) => (
              <tr key={i.id}>
                <td>{i.issue_number}</td>
                <td>{i.person_name}</td>
                <td>{new Date(i.issue_date).toLocaleDateString()}</td>
                <td>
                  <span className={`badge ${i.status === 'SIGNED' ? 'success' : 'warn'}`}>
                    {i.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
