import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import './PersonForm.css';

const OVERALL_PANTS_SIZES = Array.from({ length: 29 }, (_, i) => String(28 + i));
const SAFETYBOOT_SIZES = Array.from({ length: 12 }, (_, i) => String(4 + i));
const VEST_AND_SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'];

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
    coverall_size: '',
    shoe_size: '',
    reflective_vest_size: '',
    clothing_size: '',
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
          setForm({
            employee_number: p.employee_number || '',
            first_name: p.first_name || '',
            last_name: p.last_name || '',
            mobile_number: p.mobile_number || '',
            department_id: p.department_id || '',
            sub_department_id: p.sub_department_id || '',
            job_title: p.job_title || 'Driver',
            coverall_size: sizes.coverall_size || '',
            shoe_size: sizes.shoe_size || '',
            reflective_vest_size: sizes.reflective_vest_size || '',
            clothing_size: sizes.clothing_size || '',
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
        coverall_size: form.coverall_size || undefined,
        shoe_size: form.shoe_size || undefined,
        reflective_vest_size: form.reflective_vest_size || undefined,
        clothing_size: form.clothing_size || undefined,
      };
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
          <div className="form-row grid-3">
            <label>
              <span>Overall pants size</span>
              <select name="coverall_size" value={form.coverall_size} onChange={handleChange}>
                <option value="">-</option>
                {OVERALL_PANTS_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Safety boot size</span>
              <select name="shoe_size" value={form.shoe_size} onChange={handleChange}>
                <option value="">-</option>
                {SAFETYBOOT_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Reflector vest size</span>
              <select name="reflective_vest_size" value={form.reflective_vest_size} onChange={handleChange}>
                <option value="">-</option>
                {VEST_AND_SHIRT_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Shirt size</span>
              <select name="clothing_size" value={form.clothing_size} onChange={handleChange}>
                <option value="">-</option>
                {VEST_AND_SHIRT_SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
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
