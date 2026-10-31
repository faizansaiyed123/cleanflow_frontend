import { useState } from 'react';
import { api } from '../../api/client';

const PROPERTY_TYPES = [
  'OFFICE',
  'RETAIL',
  'MEDICAL',
  'WAREHOUSE',
  'RESTAURANT',
  'RESIDENTIAL',
  'OTHER',
];
const FREQUENCIES = ['ONE_TIME', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM'];

export default function RequestQuote() {
  const [form, setForm] = useState({
    contact_name: '',
    company_name: '',
    email: '',
    phone: '',
    address_line1: '',
    city: '',
    state: '',
    zip_code: '',
    property_type: 'OFFICE',
    square_footage: '',
    bathrooms: '',
    floors: '',
    frequency: 'WEEKLY',
    preferred_start_date: '',
    preferred_time: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        square_footage: form.square_footage ? Number(form.square_footage) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        floors: form.floors ? Number(form.floors) : null,
        preferred_start_date: form.preferred_start_date || null,
      };
      const resp = await api.post('/api/public/quote-requests', payload);
      setResult(resp);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div style={{ maxWidth: 560, margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
        <div className="card">
          <span className="badge badge-green" style={{ marginBottom: 12 }}>
            Request received
          </span>
          <h2>Thanks — we've got it!</h2>
          <p>{result.message}</p>
          <p>Your reference number is</p>
          <p
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 28,
              color: 'var(--moss-dark)',
            }}
          >
            {result.reference_number}
          </p>
          <p className="text-muted">Keep this handy if you follow up with us.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '50px auto', padding: '0 20px 60px' }}>
      <h1>Request a Quote</h1>
      <p>Tell us about your space and we'll follow up with a transparent, itemized estimate.</p>
      <form className="card" onSubmit={handleSubmit}>
        <div className="field-row">
          <div className="field">
            <label>Your name *</label>
            <input required value={form.contact_name} onChange={set('contact_name')} />
          </div>
          <div className="field">
            <label>Company name</label>
            <input value={form.company_name} onChange={set('company_name')} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Email *</label>
            <input type="email" required value={form.email} onChange={set('email')} />
          </div>
          <div className="field">
            <label>Phone *</label>
            <input required value={form.phone} onChange={set('phone')} />
          </div>
        </div>
        <div className="field">
          <label>Address</label>
          <input
            value={form.address_line1}
            onChange={set('address_line1')}
            placeholder="Street address"
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label>City</label>
            <input value={form.city} onChange={set('city')} />
          </div>
          <div className="field">
            <label>State</label>
            <input value={form.state} onChange={set('state')} />
          </div>
          <div className="field">
            <label>ZIP</label>
            <input value={form.zip_code} onChange={set('zip_code')} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Property type</label>
            <select value={form.property_type} onChange={set('property_type')}>
              {PROPERTY_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Cleaning frequency</label>
            <select value={form.frequency} onChange={set('frequency')}>
              {FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f.replace('_', '-').charAt(0) + f.replace('_', '-').slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Square footage</label>
            <input
              type="number"
              min="1"
              value={form.square_footage}
              onChange={set('square_footage')}
            />
          </div>
          <div className="field">
            <label>Bathrooms</label>
            <input type="number" min="0" value={form.bathrooms} onChange={set('bathrooms')} />
          </div>
          <div className="field">
            <label>Floors</label>
            <input type="number" min="1" value={form.floors} onChange={set('floors')} />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Preferred start date</label>
            <input
              type="date"
              value={form.preferred_start_date}
              onChange={set('preferred_start_date')}
            />
          </div>
          <div className="field">
            <label>Preferred time</label>
            <input
              placeholder="e.g. Mornings"
              value={form.preferred_time}
              onChange={set('preferred_time')}
            />
          </div>
        </div>
        <div className="field">
          <label>Anything else we should know?</label>
          <textarea rows="3" value={form.notes} onChange={set('notes')} />
        </div>
        {error && <p className="text-danger">{error}</p>}
        <button className="btn btn-primary" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
