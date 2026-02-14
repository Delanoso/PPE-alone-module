import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './IssuedPPE.css';

export default function IssuedPPE() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    api('/issues/signed')
      .then((r) => setIssues(r.data || []))
      .catch(() => setIssues([]))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="issued-ppe-page">
      <header className="page-header">
        <h1>All Issued PPE</h1>
        <p>People who have signed for PPE – expand to view signatures and dates</p>
      </header>

      <div className="issued-list">
        {issues.length === 0 ? (
          <div className="card">
            <p className="muted">No signed issues yet.</p>
          </div>
        ) : (
          issues.map((issue) => {
            const isOpen = expanded[issue.id];
            return (
              <div key={issue.id} className="issued-card card">
                <button
                  type="button"
                  className="issued-header"
                  onClick={() => toggle(issue.id)}
                  aria-expanded={isOpen}
                >
                  <div className="issued-summary">
                    <span className="issued-name">{issue.person_name}</span>
                    <span className="issued-meta">
                      {issue.issue_number} • {issue.issue_date ? new Date(issue.issue_date).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  <span className="issued-chevron">{isOpen ? '▼' : '▶'}</span>
                </button>

                {isOpen && (
                  <div className="issued-details">
                    {(issue.items || []).map((it) => {
                      const sig = (it.signatures || [])[0];
                      return (
                        <div key={it.id} className="issued-item-row">
                          <div className="issued-item-info">
                            <strong>{it.ppe_item_name}</strong>
                            {it.size_label && <span className="issued-size">Size {it.size_label}</span>}
                          </div>
                          <div className="issued-signature-block">
                            <div className="issued-sig-pad">
                              {sig?.signature_data ? (
                                <img src={sig.signature_data} alt="Signature" className="issued-sig-image" />
                              ) : (
                                <span className="issued-sig-text">{sig?.signed_name || '—'}</span>
                              )}
                            </div>
                            {sig?.signed_at && (
                              <div className="issued-sig-date">
                                Signed: {new Date(sig.signed_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
