import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { api } from '../services/api';
import IssueViewModal from '../components/IssueViewModal';
import AddItemModal from '../components/AddItemModal';
import './Issuing.css';

const ALTERNATIVE_NUMBER = '060 884 2557';
const ALTERNATIVE_WHATSAPP = '27608842557';

function toWhatsAppNumber(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('27')) return cleaned;
  if (cleaned.startsWith('0')) return '27' + cleaned.slice(1);
  return '27' + cleaned;
}

export default function Issuing() {
  const [people, setPeople] = useState([]);
  const [items, setItems] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [lines, setLines] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [lastIssue, setLastIssue] = useState(null);
  const [viewIssueId, setViewIssueId] = useState(null);
  const [addItemIssue, setAddItemIssue] = useState(null);

  useEffect(() => {
    api('/people').then((r) => setPeople(r.data || []));
    api('/issues/issuable-items').then((r) => setItems(r.data || []));
    api('/issues').then((r) => setIssues(r.data || []));
  }, []);

  const person = people.find((p) => p.id === selectedPerson);
  const sizeProfile = person?.size_profile || {};

  useEffect(() => {
    if (items.length && selectedPerson) {
      const p = people.find((x) => x.id === selectedPerson);
      const sizes = p?.size_profile || {};
      setLines(
        items.map((it) => ({
          ppe_item_id: it.id,
          size_label: sizes[it.size_key] || '',
          quantity: 1,
          ppe_item_name: it.name,
          size_key: it.size_key,
        }))
      );
    } else if (items.length && !selectedPerson) {
      setLines([]);
    }
  }, [items, selectedPerson, people]);

  const updateLine = (idx, field, value) => {
    setLines((l) => l.map((line, i) => (i === idx ? { ...line, [field]: value } : line)));
  };

  const handleIssue = async () => {
    if (!selectedPerson || !lines.length) {
      setMessage('Select a driver first');
      return;
    }
    const validLines = lines.map((l) => ({
      ppe_item_id: l.ppe_item_id,
      size_label: l.size_label || null,
      quantity: 1,
    }));
    setSaving(true);
    setMessage('');
    setLastIssue(null);
    try {
      const res = await api('/issues', {
        method: 'POST',
        body: { person_id: selectedPerson, issue_reason: 'PPE issue', items: validLines },
      });
      setLastIssue(res.data);
      setMessage('Issue created. Send the sign link to the driver.');
      api('/issues').then((r) => setIssues(r.data || []));
    } catch (err) {
      setMessage(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const signUrl = lastIssue?.sign_url || '';
  const driverWhatsApp = lastIssue?.person_mobile ? toWhatsAppNumber(lastIssue.person_mobile) : null;
  const whatsAppToDriver = driverWhatsApp
    ? `https://wa.me/${driverWhatsApp}?text=${encodeURIComponent(`Hi ${lastIssue?.person_name || 'there'}, please sign for your PPE here: ${signUrl}`)}`
    : null;

  const whatsAppAlternative = `https://wa.me/${ALTERNATIVE_WHATSAPP}?text=${encodeURIComponent(`PPE sign links for drivers:\n\n${lastIssue?.person_name || 'Driver'}: ${signUrl}`)}`;

  const handleDownloadPDF = async (issueId) => {
    try {
      const r = await api(`/issues/${issueId}`);
      const issue = r.data;
      if (!issue) return;
      const doc = new jsPDF();
      const person = issue.person || {};
      const margin = 20;
      let y = margin;

      doc.setFontSize(16);
      doc.text('PPE Issue Acknowledgment', margin, y);
      y += 10;

      doc.setFontSize(11);
      doc.text(`Issue: ${issue.issue_number}`, margin, y);
      y += 6;
      doc.text(`Date: ${issue.issue_date ? new Date(issue.issue_date).toLocaleDateString() : '-'}`, margin, y);
      y += 8;

      doc.setFontSize(12);
      doc.text('Person Details', margin, y);
      y += 6;
      doc.setFontSize(10);
      doc.text(`Name: ${issue.person_name || person.full_name || '-'}`, margin, y);
      y += 5;
      doc.text(`Employee #: ${person.employee_number || '-'}`, margin, y);
      y += 5;
      doc.text(`Contact: ${person.mobile_number || '-'}`, margin, y);
      y += 5;
      doc.text(`Department: ${person.department?.name || '-'}`, margin, y);
      y += 10;

      doc.setFontSize(12);
      doc.text('Items & Signatures', margin, y);
      y += 8;

      (issue.items || []).forEach((it, idx) => {
        if (y > 260) {
          doc.addPage();
          y = margin;
        }
        const sig = (it.signatures || [])[0];
        doc.setFontSize(10);
        doc.text(`${idx + 1}. ${it.ppe_item_name}${it.size_label ? ` (Size ${it.size_label})` : ''}`, margin, y);
        y += 5;
        if (sig) {
          doc.text(`Signed: ${sig.signed_name} on ${sig.signed_at ? new Date(sig.signed_at).toLocaleString() : '-'}`, margin + 5, y);
          y += 5;
          if (sig.signature_data) {
            try {
              doc.addImage(sig.signature_data, 'PNG', margin + 5, y, 60, 25);
              y += 28;
            } catch {
              y += 5;
            }
          } else {
            y += 2;
          }
        } else {
          doc.text('(Not signed)', margin + 5, y);
          y += 5;
        }
        y += 3;
      });

      doc.save(`PPE-Issue-${issue.issue_number}.pdf`);
    } catch (e) {
      setMessage(e.message || 'Failed to download PDF');
    }
  };

  return (
    <div className="issuing-page">
      <header className="page-header">
        <h1>Issue PPE</h1>
        <p>Issue the 4 PPE items to drivers. Driver signs via link (WhatsApp or web).</p>
      </header>

      <div className="issuing-grid">
        <section className="card">
          <h2>New issue</h2>
          <label>
            <span>Select driver *</span>
            <select value={selectedPerson} onChange={(e) => setSelectedPerson(e.target.value)}>
              <option value="">Choose driver...</option>
              {people.filter((p) => p.status === 'ACTIVE').map((p) => (
                <option key={p.id} value={p.id}>
                  {p.employee_number} – {p.full_name}
                </option>
              ))}
            </select>
          </label>

          {lines.length > 0 && (
            <div className="issue-lines">
              <div className="line-header">
                <strong>Items (from driver profile)</strong>
              </div>
              {lines.map((line, i) => (
                <div key={i} className="line-row four-items">
                  <span className="item-name">{line.ppe_item_name}</span>
                  <select
                    value={line.size_label}
                    onChange={(e) => updateLine(i, 'size_label', e.target.value)}
                    className="size-select"
                  >
                    <option value="">Size</option>
                    {line.size_key === 'coverall_size' &&
                      Array.from({ length: 29 }, (_, j) => 28 + j).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    {line.size_key === 'shoe_size' &&
                      Array.from({ length: 12 }, (_, j) => 4 + j).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    {(line.size_key === 'reflective_vest_size' || line.size_key === 'clothing_size') &&
                      ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {message && (
            <div className={`msg ${message.includes('created') || message.includes('Send') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button type="button" className="btn-primary" onClick={handleIssue} disabled={saving}>
            {saving ? 'Creating...' : 'Create issue'}
          </button>
        </section>

        {lastIssue && signUrl && (
          <section className="card sign-links-card">
            <h2>Signature link</h2>
            <p className="driver-name">{lastIssue.person_name}</p>
            <div className="sign-url-row">
              <input type="text" readOnly value={signUrl} className="sign-url-input" />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  navigator.clipboard.writeText(signUrl);
                  setMessage('Link copied to clipboard');
                }}
              >
                Copy link
              </button>
            </div>
            <div className="link-actions">
              {whatsAppToDriver && (
                <a
                  href={whatsAppToDriver}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  Send via WhatsApp (to driver)
                </a>
              )}
              <a
                href={whatsAppAlternative}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp alt"
              >
                Send to {ALTERNATIVE_NUMBER} (if driver has no phone)
              </a>
            </div>
            <p className="muted hint">
              Driver opens the link on phone or computer and signs for each of the 4 items.
            </p>
          </section>
        )}

        <section className="card">
          <h2>Recent issues</h2>
          <ul className="issues-list">
            {issues.slice(0, 15).map((i) => (
              <li key={i.id}>
                <span className="issue-num">{i.issue_number}</span>
                <span>{i.person_name}</span>
                <span className={`badge ${i.status === 'SIGNED' ? 'success' : 'warn'}`}>{i.status}</span>
                <div className="issue-actions">
                  {i.status === 'SIGNED' && (
                    <>
                      <button
                        type="button"
                        className="btn-view"
                        onClick={() => setViewIssueId(i.id)}
                        title="View signatures"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn-pdf"
                        onClick={() => handleDownloadPDF(i.id)}
                        title="Download PDF"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        className="btn-add-item"
                        onClick={() => setAddItemIssue(i)}
                        title="Add extra item"
                      >
                        +
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {viewIssueId && (
        <IssueViewModal issueId={viewIssueId} onClose={() => setViewIssueId(null)} />
      )}
      {addItemIssue && (
        <AddItemModal
          issue={addItemIssue}
          issuableItems={items}
          onClose={() => setAddItemIssue(null)}
          onSuccess={() => api('/issues').then((r) => setIssues(r.data || []))}
        />
      )}
    </div>
  );
}
