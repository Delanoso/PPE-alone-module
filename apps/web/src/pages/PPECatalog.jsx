import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './PPECatalog.css';

export default function PPECatalog() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/ppe/items').then((r) => setItems(r.data || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="ppe-page">
      <header className="page-header">
        <h1>PPE Catalog</h1>
        <p>PPE items and categories</p>
      </header>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Size required</th>
              <th>Min threshold</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td><code>{i.sku}</code></td>
                <td>{i.name}</td>
                <td>{i.category_name || i.category_id}</td>
                <td>{i.size_required ? 'Yes' : 'No'}</td>
                <td>{i.min_stock_threshold ?? 0}</td>
                <td>
                  <span className={`badge ${i.is_active !== false ? 'success' : ''}`}>
                    {i.is_active !== false ? 'Active' : 'Inactive'}
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
