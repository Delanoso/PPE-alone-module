import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Stock.css';

export default function Stock() {
  const [balances, setBalances] = useState([]);
  const [movements, setMovements] = useState([]);
  const [tab, setTab] = useState('current');

  useEffect(() => {
    api('/stock/balances').then((r) => setBalances(r.data || []));
    api('/stock/movements').then((r) => setMovements(r.data || []));
  }, []);

  const lowStock = balances.filter((b) => (b.on_hand_qty || 0) < 10);

  return (
    <div className="stock-page">
      <header className="page-header">
        <h1>Stock</h1>
        <p>Stock balances and movements</p>
      </header>

      <div className="tabs">
        <button type="button" className={tab === 'current' ? 'active' : ''} onClick={() => setTab('current')}>
          Current stock
        </button>
        <button type="button" className={tab === 'movements' ? 'active' : ''} onClick={() => setTab('movements')}>
          Movements
        </button>
      </div>

      {tab === 'current' && (
        <div className="card table-card">
          {lowStock.length > 0 && (
            <div className="alert warn">
              {lowStock.length} item(s) below minimum stock threshold
            </div>
          )}
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th>On hand</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {balances.map((b) => (
                <tr key={b.id}>
                  <td>{b.ppe_item_name || b.ppe_item_id}</td>
                  <td>{b.size_label || '-'}</td>
                  <td>{b.on_hand_qty ?? 0}</td>
                  <td>
                    {(b.on_hand_qty || 0) < 10 ? (
                      <span className="badge warn">Low</span>
                    ) : (
                      <span className="badge success">OK</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'movements' && (
        <div className="card table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Movement #</th>
                <th>Item</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {movements.slice().reverse().map((m) => (
                <tr key={m.id}>
                  <td>{m.movement_number}</td>
                  <td>{m.ppe_item_name || m.ppe_item_id}</td>
                  <td>{m.movement_type}</td>
                  <td>{m.quantity}</td>
                  <td>{m.reason_code}</td>
                  <td>{m.created_at ? new Date(m.created_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {movements.length === 0 && <p className="muted table-empty">No movements yet</p>}
        </div>
      )}
    </div>
  );
}
