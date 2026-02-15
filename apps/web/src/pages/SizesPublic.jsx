import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getApiBase } from '../services/api';
import './SizesPublic.css';

const VEST_AND_SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', '5XL', '6XL', '7XL'];
const OVERALL_PANTS_SIZES = Array.from({ length: 29 }, (_, i) => String(28 + i));
const SAFETYBOOT_SIZES = Array.from({ length: 12 }, (_, i) => String(4 + i));

export default function SizesPublic() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    reflective_vest_size: '',
    clothing_size: '',
    coverall_size: '',
    trouser_size: '',
    shoe_size: '',
  });
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
          setForm((f) => ({
            ...f,
            reflective_vest_size: json.data.current_sizes.reflective_vest_size || '',
            clothing_size: json.data.current_sizes.clothing_size || '',
            coverall_size: json.data.current_sizes.coverall_size || '',
            trouser_size: json.data.current_sizes.trouser_size || '',
            shoe_size: json.data.current_sizes.shoe_size || '',
          }));
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

  return (
    <div className="sizes-public-page">
      <div className="sizes-public-card">
        <h1>PPE Size Submission</h1>
        <p className="subtitle">PPE Issue Management</p>
        <p className="intro">Please provide your sizes for the following PPE items:</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <label>
            <span>Reflector vest size *</span>
            <select
              name="reflective_vest_size"
              value={form.reflective_vest_size}
              onChange={(e) => setForm((f) => ({ ...f, reflective_vest_size: e.target.value }))}
              required
            >
              <option value="">Select...</option>
              {VEST_AND_SHIRT_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Shirt size *</span>
            <select
              name="clothing_size"
              value={form.clothing_size}
              onChange={(e) => setForm((f) => ({ ...f, clothing_size: e.target.value }))}
              required
            >
              <option value="">Select...</option>
              {VEST_AND_SHIRT_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Overalls / Pants size *</span>
            <select
              name="coverall_size"
              value={form.coverall_size || form.trouser_size}
              onChange={(e) => setForm((f) => ({ ...f, coverall_size: e.target.value, trouser_size: e.target.value }))}
              required
            >
              <option value="">Select...</option>
              {OVERALL_PANTS_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Safety shoe size (EU) *</span>
            <select
              name="shoe_size"
              value={form.shoe_size}
              onChange={(e) => setForm((f) => ({ ...f, shoe_size: e.target.value }))}
              required
            >
              <option value="">Select...</option>
              {SAFETYBOOT_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit sizes'}
          </button>
        </form>
      </div>
    </div>
  );
}
