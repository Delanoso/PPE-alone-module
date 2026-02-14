import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Reminders.css';

const DEFAULT_MESSAGE = (name, link) =>
  `Hi ${name}, please submit your PPE sizes (overall pants, safety boot, reflector vest, shirt) here: ${link}`;

export default function Reminders() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/reminders')
      .then((r) => setDrivers(r.data || []))
      .catch(() => setDrivers([]))
      .finally(() => setLoading(false));
  }, []);

  const openWhatsApp = (phone, message) => {
    const cleaned = phone.replace(/\D/g, '');
    const num = cleaned.startsWith('27') ? cleaned : cleaned.startsWith('0') ? '27' + cleaned.slice(1) : '27' + cleaned;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopyAll = () => {
    const text = drivers
      .map((d) => `${d.full_name}\t${d.mobile_number}\t${d.link}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    alert(`Copied ${drivers.length} drivers with links to clipboard`);
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="reminders-page">
      <header className="page-header flex">
        <div>
          <h1>Reminders</h1>
          <p>Drivers without PPE sizes – send them a link to submit</p>
        </div>
        <div className="header-actions">
          {drivers.length > 0 && (
            <button type="button" className="btn-secondary" onClick={handleCopyAll}>
              Copy all links
            </button>
          )}
        </div>
      </header>

      <div className="card">
        <p className="reminders-intro">
          When drivers click the link and submit the form, their sizes are saved automatically to their profile.
        </p>
        {drivers.length === 0 ? (
          <p className="muted">No drivers missing sizes. All drivers have submitted their PPE sizes.</p>
        ) : (
          <>
            <p className="count-badge">{drivers.length} driver(s) need to submit sizes</p>
            <table className="data-table">
              <thead>
                <tr>
                  <th>D NO</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id}>
                    <td>{d.employee_number}</td>
                    <td>{d.full_name}</td>
                    <td>{d.mobile_number}</td>
                    <td>
                      {d.phones?.map((phone, i) => (
                        <button
                          key={i}
                          type="button"
                          className="btn-whatsapp-sm"
                          onClick={() => openWhatsApp(phone, DEFAULT_MESSAGE(d.full_name, d.link))}
                        >
                          Send to {d.phones.length > 1 ? `#${i + 1}` : 'WhatsApp'}
                        </button>
                      ))}
                      {(!d.phones || d.phones.length === 0) && (
                        <span className="muted">No number</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
