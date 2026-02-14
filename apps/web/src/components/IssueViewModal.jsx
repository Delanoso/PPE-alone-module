import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './IssueViewModal.css';

export default function IssueViewModal({ issueId, onClose }) {
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!issueId) return;
    api(`/issues/${issueId}`)
      .then((r) => setIssue(r.data))
      .catch(() => setIssue(null))
      .finally(() => setLoading(false));
  }, [issueId]);

  if (!issueId) return null;

  return (
    <div className="issue-view-overlay" onClick={onClose}>
      <div className="issue-view-modal" onClick={(e) => e.stopPropagation()}>
        <div className="issue-view-header">
          <h2>Issue Details</h2>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        {loading ? (
          <div className="issue-view-loading">Loading...</div>
        ) : issue ? (
          <>
            <div className="issue-view-summary">
              <p><strong>{issue.issue_number}</strong> — {issue.person_name}</p>
              <p className="muted">{issue.issue_date ? new Date(issue.issue_date).toLocaleDateString() : '-'}</p>
            </div>
            <div className="issue-view-signatures">
              <h3>Signatures</h3>
              {(issue.items || []).map((it) => {
                const sig = (it.signatures || [])[0];
                return (
                  <div key={it.id} className="signature-block">
                    <div className="sig-item-name">{it.ppe_item_name}{it.size_label && ` (Size ${it.size_label})`}</div>
                    <div className="sig-pad">
                      {sig?.signature_data ? (
                        <img src={sig.signature_data} alt="Signature" className="sig-image" />
                      ) : (
                        <span className="sig-text">{sig?.signed_name || '(Not signed)'}</span>
                      )}
                    </div>
                    {sig?.signed_at && (
                      <div className="sig-date">{new Date(sig.signed_at).toLocaleString()}</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="issue-view-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </>
        ) : (
          <div className="issue-view-error">Failed to load issue</div>
        )}
      </div>
    </div>
  );
}
