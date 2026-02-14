import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Reports.css';

export default function Reports() {
  const [issues, setIssues] = useState([]);
  const [stock, setStock] = useState([]);
  const [tab, setTab] = useState('issues');

  useEffect(() => {
    api('/reports/issues').then((r) => setIssues(r.data || []));
    api('/reports/stock').then((r) => setStock(r.data || []));
  }, []);

  return (
    <div className="reports-page">
      <header className="page-header">
        <h1>Reports</h1>
        <p>Compliance and stock reports</p>
      </header>

      <div className="tabs">
        <button type="button" className={tab === 'issues' ? 'active' : ''} onClick={() => setTab('issues')}>
          Issues report
        </button>
        <button type="button" className={tab === 'stock' ? 'active' : ''} onClick={() => setTab('stock')}>
          Stock report
        </button>
      </div>

      {tab === 'issues' && (
        <div className="card table-card">
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
                    <span className={`badge ${i.status === 'SIGNED' ? 'success' : 'warn'}`}>{i.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'stock' && (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th>On hand</th>
                <th>Low stock</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((s) => (
                <tr key={s.id}>
                  <td>{s.ppe_item_name || s.ppe_item_id}</td>
                  <td>{s.size_label || '-'}</td>
                  <td>{s.on_hand_qty ?? 0}</td>
                  <td>{s.low_stock ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
