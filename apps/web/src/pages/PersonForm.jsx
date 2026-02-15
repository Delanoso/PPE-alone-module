import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import './PersonForm.css';

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

export default function PersonForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    employee_number: '',
    first_name: '',
    last_name: '',
    mobile_number: '',
    department_id: '',
    sub_department_id: '',
    job_title: 'Driver',
    ...Object.fromEntries(Object.keys(SIZE_OPTIONS).map((k) => [k, ''])),
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/departments').then((r) => {
      const depts = r.data || [];
      setDepartments(depts);
      if (!isEdit) {
        const drivers = depts.find((d) => d.name?.toLowerCase().includes('driver'));
        const fallback = depts[0];
        const dept = drivers || fallback;
        if (dept) {
          const sub = dept.sub_departments?.[0];
          setForm((f) => ({
            ...f,
            department_id: dept.id,
            sub_department_id: sub?.id || '',
          }));
        }
      }
    });
  }, [isEdit]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      api(`/people/${id}`)
        .then((r) => {
          const p = r.data;
          const sizes = p.size_profile || {};
          const sizeDefaults = Object.fromEntries(
            Object.keys(SIZE_OPTIONS).map((k) => [k, sizes[k] || ''])
          );
          setForm({
            employee_number: p.employee_number || '',
            first_name: p.first_name || '',
            last_name: p.last_name || '',
            mobile_number: p.mobile_number || '',
            department_id: p.department_id || '',
            sub_department_id: p.sub_department_id || '',
            job_title: p.job_title || 'Driver',
            ...sizeDefaults,
          });
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => {
      const next = { ...f, [name]: value };
      if (name === 'department_id') next.sub_department_id = '';
      return next;
    });
  };

  const selectedDept = departments.find((d) => d.id === form.department_id);
  const ppeItems = selectedDept?.ppe_items || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        employee_number: form.employee_number,
        first_name: form.first_name,
        last_name: form.last_name,
        mobile_number: form.mobile_number,
        department_id: form.department_id,
        sub_department_id: form.sub_department_id,
        job_title: form.job_title?.trim() || null,
      };
      Object.keys(SIZE_OPTIONS).forEach((k) => {
        if (form[k]) payload[k] = form[k];
      });
      if (isEdit) {
        await api(`/people/${id}`, { method: 'PATCH', body: payload });
      } else {
        await api('/people', { method: 'POST', body: payload });
      }
      navigate('/people');
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading">Loading...</div>;

  return (
    <div className="person-form-page">
      <header className="page-header">
        <h1>{isEdit ? 'Edit person' : 'Add person'}</h1>
      </header>

      <form onSubmit={handleSubmit} className="form-card">
        {error && <div className="form-error">{error}</div>}

        <section className="form-section">
          <h2>Person details</h2>
          <div className="form-row">
            <label>
              <span>Employee number (D NO) *</span>
              <input name="employee_number" value={form.employee_number} onChange={handleChange} required disabled={isEdit} />
            </label>
            <label>
              <span>First name (NAME) *</span>
              <input name="first_name" value={form.first_name} onChange={handleChange} required />
            </label>
            <label>
              <span>Last name (SURNAME) *</span>
              <input name="last_name" value={form.last_name} onChange={handleChange} required />
            </label>
            <label>
              <span>Contact number *</span>
              <input name="mobile_number" type="tel" value={form.mobile_number} onChange={handleChange} required placeholder="e.g. 072 333 1204" />
            </label>
            <label>
              <span>Department *</span>
              <select name="department_id" value={form.department_id} onChange={handleChange} required>
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Job title</span>
              <input name="job_title" value={form.job_title} onChange={handleChange} placeholder="e.g. Driver" />
            </label>
            <label>
              <span>Sub-department *</span>
              <select name="sub_department_id" value={form.sub_department_id} onChange={handleChange} required>
                <option value="">Select sub-department</option>
                {departments
                  .find((d) => d.id === form.department_id)
                  ?.sub_departments?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  )) || []}
              </select>
            </label>
          </div>
        </section>

        <section className="form-section">
          <h2>PPE sizes</h2>
          <p className="form-hint">
            {ppeItems.length > 0
              ? 'Enter sizes for the PPE items assigned to this department.'
              : 'Select a department to see its PPE size fields.'}
          </p>
          <div className="form-row grid-3">
            {ppeItems.map((item) => {
              const sizeKey = item.size_key;
              if (!sizeKey || !item.size_required) return null;
              const options = SIZE_OPTIONS[sizeKey] || CLOTHING_SIZES;
              return (
                <label key={item.id}>
                  <span>{item.name}</span>
                  <select name={sizeKey} value={form[sizeKey] || ''} onChange={handleChange}>
                    <option value="">-</option>
                    {options.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>
              );
            })}
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/people')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
