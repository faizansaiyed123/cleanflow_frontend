import { useEffect, useState } from 'react';
import { api } from '../api/client';
import Modal from './Modal';
import PricingBreakdown from './PricingBreakdown';
import { useToast } from '../context/ToastContext';

const PROPERTY_TYPES = ['OFFICE', 'RETAIL', 'MEDICAL', 'WAREHOUSE', 'RESTAURANT', 'RESIDENTIAL', 'OTHER'];
const FREQUENCIES = ['ONE_TIME', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM'];

export default function GenerateQuoteModal({ leadId, customerId, initial = {}, onClose, onCreated }) {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    primary_service_id: '', property_type: initial.property_type || 'OFFICE',
    square_footage: initial.square_footage || 1000, bathrooms: initial.bathrooms ?? 1,
    floors: initial.floors ?? 1, frequency: initial.frequency || 'WEEKLY',
    has_special_conditions: false, addon_service_ids: [], manual_discount_percent: 0, manual_discount_reason: '',
  });
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    api.get('/api/services').then((all) => {
      setServices(all);
      const primary = all.find((s) => !s.is_addon);
      if (primary) setForm((f) => ({ ...f, primary_service_id: primary.id }));
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      api.post('/api/pricing/preview', {
        property_type: form.property_type, square_footage: Number(form.square_footage),
        bathrooms: Number(form.bathrooms), floors: Number(form.floors), frequency: form.frequency,
        addon_service_ids: form.addon_service_ids, has_special_conditions: form.has_special_conditions,
        manual_discount_percent: Number(form.manual_discount_percent) || 0,
        manual_discount_reason: form.manual_discount_reason || null,
      }).then(setPreview).catch(() => setPreview(null));
    }, 300);
    return () => clearTimeout(t);
  }, [form]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleAddon = (id) => setForm((f) => ({
    ...f, addon_service_ids: f.addon_service_ids.includes(id)
      ? f.addon_service_ids.filter((x) => x !== id) : [...f.addon_service_ids, id],
  }));

  const submit = async () => {
    setSaving(true);
    try {
      const quote = await api.post('/api/quotes', {
        lead_id: leadId || null, customer_id: customerId || null,
        primary_service_id: form.primary_service_id, property_type: form.property_type,
        square_footage: Number(form.square_footage), bathrooms: Number(form.bathrooms),
        floors: Number(form.floors), frequency: form.frequency,
        has_special_conditions: form.has_special_conditions, addon_service_ids: form.addon_service_ids,
        manual_discount_percent: Number(form.manual_discount_percent) || 0,
        manual_discount_reason: form.manual_discount_reason || null,
      });
      toast.push(`Quote ${quote.reference_number} created`, 'success');
      onCreated(quote);
    } catch (err) {
      toast.push(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const primaryServices = services.filter((s) => !s.is_addon);
  const addonServices = services.filter((s) => s.is_addon);

  return (
    <Modal title="Generate Quote" onClose={onClose} footer={
      <>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={saving || !form.primary_service_id}>
          {saving ? 'Creating…' : 'Create Quote'}
        </button>
      </>
    }>
      <div className="field">
        <label>Primary service</label>
        <select value={form.primary_service_id} onChange={set('primary_service_id')}>
          {primaryServices.map((s) => <option key={s.id} value={s.id}>{s.name} (${s.base_rate})</option>)}
        </select>
      </div>
      <div className="field-row">
        <div className="field"><label>Property type</label>
          <select value={form.property_type} onChange={set('property_type')}>
            {PROPERTY_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="field"><label>Frequency</label>
          <select value={form.frequency} onChange={set('frequency')}>
            {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </div>
      <div className="field-row">
        <div className="field"><label>Sq ft</label><input type="number" value={form.square_footage} onChange={set('square_footage')} /></div>
        <div className="field"><label>Bathrooms</label><input type="number" value={form.bathrooms} onChange={set('bathrooms')} /></div>
        <div className="field"><label>Floors</label><input type="number" value={form.floors} onChange={set('floors')} /></div>
      </div>
      {addonServices.length > 0 && (
        <div className="field">
          <label>Add-ons</label>
          {addonServices.map((s) => (
            <label key={s.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 400, marginBottom: 4 }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={form.addon_service_ids.includes(s.id)} onChange={() => toggleAddon(s.id)} />
              {s.name} (${s.base_rate})
            </label>
          ))}
        </div>
      )}
      <div className="field-row">
        <div className="field"><label>Manual discount %</label><input type="number" min="0" max="100" value={form.manual_discount_percent} onChange={set('manual_discount_percent')} /></div>
        <div className="field"><label>Discount reason</label><input value={form.manual_discount_reason} onChange={set('manual_discount_reason')} /></div>
      </div>
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 400, marginBottom: 14 }}>
        <input type="checkbox" style={{ width: 'auto' }} checked={form.has_special_conditions}
          onChange={(e) => setForm((f) => ({ ...f, has_special_conditions: e.target.checked }))} />
        Special conditions (biohazard, post-construction, etc.)
      </label>
      <PricingBreakdown breakdown={preview} />
    </Modal>
  );
}
