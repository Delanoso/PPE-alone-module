import { useState, useEffect } from 'react';
import { api } from '../services/api';
import './AddItemModal.css';

function toWhatsAppNumber(phone) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('27')) return cleaned;
  if (cleaned.startsWith('0')) return '27' + cleaned.slice(1);
  return '27' + cleaned;
}

const ALTERNATIVE_WHATSAPP = '27608842557';
const ALTERNATIVE_NUMBER = '060 884 2557';

export default function AddItemModal({ issue, issuableItems, onClose, onSuccess }) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [sizeLabel, setSizeLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (issuableItems?.length) setItems(issuableItems);
  }, [issuableItems]);

  const sel = items.find((i) => i.id === selectedItem);
  const sizeKey = sel?.size_key;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) {
      setError('Select an item');
      return;
    }
    if (sel?.size_required && !sizeLabel) {
      setError('Select a size');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await api(`/issues/${issue.id}/add-item`, {
        method: 'POST',
        body: {
          ppe_item_id: selectedItem,
          size_label: sizeLabel || null,
          quantity: 1,
        },
      });
      setResult(res.data);
      onSuccess?.(res.data);
    } catch (err) {
      setError(err.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const signUrl = result?.sign_url || '';
  const driverWhatsApp = result?.person_mobile ? toWhatsAppNumber(result.person_mobile) : null;
  const whatsAppLink = driverWhatsApp
    ? `https://wa.me/${driverWhatsApp}?text=${encodeURIComponent(`Hi ${result?.person_name || 'there'}, please sign for your extra PPE item: ${signUrl}`)}`
    : `https://wa.me/${ALTERNATIVE_WHATSAPP}?text=${encodeURIComponent(`${result?.person_name || 'Driver'}: Sign for extra item: ${signUrl}`)}`;

  if (!issue) return null;

  return (
    <div className="add-item-overlay" onClick={onClose}>
      <div className="add-item-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-item-header">
          <h2>Add extra item</h2>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p className="add-item-sub">Issue {issue.issue_number} — {issue.person_name}</p>

        {!result ? (
          <form onSubmit={handleSubmit}>
            {error && <div className="form-error">{error}</div>}
            <label>
              <span>Item</span>
              <select value={selectedItem} onChange={(e) => { setSelectedItem(e.target.value); setSizeLabel(''); }}>
                <option value="">Choose item...</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </label>
            {sizeKey && (
              <label>
                <span>Size</span>
                <select value={sizeLabel} onChange={(e) => setSizeLabel(e.target.value)}>
                  <option value="">Size</option>
                  {sizeKey === 'coverall_size' &&
                    Array.from({ length: 29 }, (_, j) => 28 + j).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  {sizeKey === 'shoe_size' &&
                    Array.from({ length: 12 }, (_, j) => 4 + j).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  {(sizeKey === 'reflective_vest_size' || sizeKey === 'clothing_size') &&
                    ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', '5XL', '6XL', '7XL'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                </select>
              </label>
            )}
            <div className="add-item-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Adding...' : 'Add item'}
              </button>
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="add-item-success">
            <p className="success-msg">Extra item added. Send the sign link to the driver.</p>
            <div className="sign-url-row">
              <input type="text" readOnly value={signUrl} className="sign-url-input" />
              <button type="button" className="btn-secondary" onClick={() => navigator.clipboard.writeText(signUrl)}>
                Copy
              </button>
            </div>
            <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
              Send via WhatsApp
            </a>
            <p className="hint">Or send to {ALTERNATIVE_NUMBER} if driver has no phone</p>
            <button type="button" className="btn-secondary" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}
