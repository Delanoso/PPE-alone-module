import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import './SignPublic.css';

function apiBase() {
  const host = window.location?.hostname || '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  return import.meta.env.VITE_API_BASE ?? (isLocal ? 'http://localhost:3001' : '');
}

export default function SignPublic() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signedName, setSignedName] = useState('');
  const [itemSignatures, setItemSignatures] = useState({});
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const padRefs = useRef({});

  useEffect(() => {
    fetch(`${apiBase()}/api/v1/sign/public/${token}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then((r) => r.text())
      .then((text) => {
        const json = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};
        if (!json.success) throw new Error(json.error?.message || 'Failed to load');
        setData(json.data);
        if (json.data?.items?.length) {
          const init = {};
          json.data.items.forEach((it) => { init[it.issue_item_id] = null; });
          setItemSignatures(init);
          padRefs.current = {};
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleClear = (issueItemId) => {
    const pad = padRefs.current[issueItemId];
    if (pad) pad.clear();
    setItemSignatures((prev) => ({ ...prev, [issueItemId]: null }));
  };

  const getPadData = (issueItemId) => {
    const pad = padRefs.current[issueItemId];
    if (!pad || pad.isEmpty()) return null;
    return pad.toDataURL('image/png');
  };

  const allSigned = data?.items?.length
    ? data.items.every((it) => {
        const pad = padRefs.current[it.issue_item_id];
        return pad && !pad.isEmpty();
      })
    : false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signedName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!allSigned) {
      setError('Please sign in each box to confirm receipt of every item');
      return;
    }
    if (!consent) {
      setError('Please accept the acknowledgment');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const itemSigs = (data.items || []).map((it) => ({
        issue_item_id: it.issue_item_id,
        signed_name: signedName.trim(),
        signature_data: getPadData(it.issue_item_id),
      }));
      const res = await fetch(`${apiBase()}/api/v1/sign/public/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({
          item_signatures: itemSigs,
          signed_name: signedName.trim(),
        }),
      });
      const text = await res.text();
      const json = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};
      if (!json.success) throw new Error(json.error?.message || 'Failed');
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="sign-public-loading">Loading...</div>;
  if (error && !data) return <div className="sign-public-error"><h1>Error</h1><p>{error}</p></div>;
  if (data?.status === 'SIGNED') return <div className="sign-public-done"><h1>Already signed</h1><p>This issue has already been acknowledged.</p></div>;
  if (submitted) return <div className="sign-public-done"><h1>Thank you</h1><p>All signatures have been recorded successfully.</p></div>;

  return (
    <div className="sign-public-page">
      <div className="sign-public-card">
        <h1>PPE Issue Acknowledgment</h1>
        <p className="subtitle">HFR Schafer Vervoer</p>

        <div className="sign-summary">
          <p><strong>Issue:</strong> {data?.issue_number}</p>
          <p><strong>Employee:</strong> {data?.person_name}</p>
          <p><strong>Date:</strong> {data?.issue_date ? new Date(data.issue_date).toLocaleDateString() : '-'}</p>
        </div>

        <p className="policy-text">
          Please sign in the box below each item to confirm receipt. Enter your full name first, then draw your signature in each box.
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}
          <label>
            <span>Your full name *</span>
            <input
              type="text"
              value={signedName}
              onChange={(e) => setSignedName(e.target.value)}
              placeholder="e.g. John Smith"
              required
            />
          </label>

          <div className="sign-items-list">
            <strong>Sign for each item (draw your signature in each box):</strong>
            {data?.items?.map((it) => (
              <div key={it.id} className="sign-item-row">
                <div className="sign-item-info">
                  <span className="sign-item-name">{it.ppe_item_name}</span>
                  {it.size_label && <span className="sign-item-size">Size {it.size_label}</span>}
                </div>
                <div className="signature-pad-wrap">
                  <SignatureCanvas
                    ref={(el) => { padRefs.current[it.issue_item_id] = el; }}
                    canvasProps={{
                      className: 'signature-canvas',
                      width: 400,
                      height: 120,
                    }}
                    penColor="black"
                    backgroundColor="rgba(255,255,255,0)"
                    onEnd={() => setItemSignatures((prev) => ({ ...prev, [it.issue_item_id]: true }))}
                  />
                  <button type="button" className="btn-clear-sig" onClick={() => handleClear(it.issue_item_id)}>
                    Clear
                  </button>
                </div>
              </div>
            ))}
          </div>

          <label className="checkbox-label">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>I acknowledge receipt of all items listed above and confirm they were received in good condition.</span>
          </label>
          <button type="submit" className="btn-primary" disabled={submitting || !allSigned || !signedName.trim() || !consent}>
            {submitting ? 'Submitting...' : 'Submit all signatures'}
          </button>
        </form>
      </div>
    </div>
  );
}
