import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getApiBase } from '../services/api';
import './SizesPublic.css';

const TROUSER_SIZES = Array.from({ length: 29 }, (_, i) => String(28 + i));
const SHOE_SIZES = Array.from({ length: 12 }, (_, i) => String(4 + i));
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', '5XL', '6XL', '7XL'];
const GLOVE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const HELMET_SIZES = ['S', 'M', 'L', 'XL'];

const SIZE_OPTIONS = {
  coverall_size: TROUSER_SIZES,
  shoe_size: SHOE_SIZES,
  reflective_vest_size: CLOTHING_SIZES,
  clothing_size: CLOTHING_SIZES,
  jacket_size: CLOTHING_SIZES,
  trouser_size: TROUSER_SIZES,
  glove_size: GLOVE_SIZES,
  helmet_size: HELMET_SIZES,
  rain_suit_size: CLOTHING_SIZES,
};

const DEFAULT_PPE_ITEMS = [
  { name: 'Reflector vest', size_key: 'reflective_vest_size' },
  { name: 'Shirt', size_key: 'clothing_size' },
  { name: 'Overalls / Pants', size_key: 'coverall_size' },
  { name: 'Safety shoe (EU)', size_key: 'shoe_size' },
];

export default function SizesPublic() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${getApiBase()}/api/v1/sizes/public/${token}`, { cache: 'no-store', headers: { 'ngrok-skip-browser-warning': 'true' } })
      .then((r) => r.text())
      .then((text) => {
        const json = text ? (() => { try { return JSON.parse(text); } catch { return {}; } })() : {};
        if (!json.success) throw new Error(json.error?.message || 'Failed to load');
        setData(json.data);
        if (json.data?.current_sizes) {
          setForm(json.data.current_sizes);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${getApiBase()}/api/v1/sizes/public/${token}`, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(form),
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

  if (loading) return <div className="sizes-public-loading">Loading...</div>;
  if (error && !data) return <div className="sizes-public-error"><h1>Error</h1><p>{error}</p></div>;
  if (data?.already_submitted)
    return (
      <div className="sizes-public-done">
        <h1>Already submitted</h1>
        <p>Your PPE sizes have already been recorded. You will not receive any follow-up messages.</p>
      </div>
    );
  if (submitted)
    return (
      <div className="sizes-public-done">
        <h1>Thank you</h1>
        <p>Your sizes have been recorded. You will not receive any follow-up messages.</p>
      </div>
    );

  let sizeItems = (data?.ppe_items?.length > 0 ? data.ppe_items : DEFAULT_PPE_ITEMS).filter(
    (item) => item.size_key && item.size_required !== false
  );
  if (sizeItems.length === 0) sizeItems = DEFAULT_PPE_ITEMS;

  return (
    <div className="sizes-public-page">
      <div className="sizes-public-card">
        <h1>PPE Size Submission</h1>
        <p className="subtitle">PPE Issue Management</p>
        <p className="intro">Please provide your sizes for the following PPE items:</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          {sizeItems.map((item) => {
            const key = item.size_key;
            const options = SIZE_OPTIONS[key] || CLOTHING_SIZES;
            const value = form[key] || '';
            return (
              <label key={item.id || key}>
                <span>{item.name} *</span>
                <select
                  name={key}
                  value={value}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required
                >
                  <option value="">Select...</option>
                  {options.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            );
          })}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit sizes'}
          </button>
        </form>
      </div>
    </div>
  );
}
