import { useEffect, useState } from 'react';
import { api, BASE_URL } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/Modal';
import { dateTimeFmt } from '../../utils/format';

const PROPERTY_TYPES = ['OFFICE', 'RETAIL', 'MEDICAL', 'WAREHOUSE', 'RESTAURANT', 'RESIDENTIAL', 'OTHER'];
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const NOTIF_KEYS = [
  ['new_lead', 'New lead received'], ['quote_accepted', 'Quote accepted'], ['job_completed', 'Job completed'],
  ['invoice_overdue', 'Invoice overdue'], ['contract_expiring', 'Contract expiring soon'],
];

function WebhooksPanel() {
  const [endpoints, setEndpoints] = useState(null);
  const [eventTypes, setEventTypes] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ url: '', subscribed_events: [], description: '' });
  const [newSecret, setNewSecret] = useState(null);
  const [viewingDeliveries, setViewingDeliveries] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const toast = useToast();

  const load = () => api.get('/api/webhooks/endpoints').then(setEndpoints);
  useEffect(() => { load(); api.get('/api/webhooks/event-types').then((r) => setEventTypes(r.event_types)); }, []);

  const toggleEvent = (evt) => setForm((f) => ({
    ...f, subscribed_events: f.subscribed_events.includes(evt)
      ? f.subscribed_events.filter((x) => x !== evt) : [...f.subscribed_events, evt],
  }));

  const create = async () => {
    try {
      const result = await api.post('/api/webhooks/endpoints', form);
      setNewSecret(result.secret);
      setForm({ url: '', subscribed_events: [], description: '' });
      load();
    } catch (err) { toast.push(err.message, 'error'); }
  };

  const deactivate = async (id) => {
    await api.post(`/api/webhooks/endpoints/${id}/deactivate`);
    toast.push('Endpoint deactivated', 'success');
    load();
  };

  const openDeliveries = async (endpoint) => {
    setViewingDeliveries(endpoint);
    const d = await api.get(`/api/webhooks/endpoints/${endpoint.id}/deliveries`);
    setDeliveries(d);
  };

  const redeliver = async (deliveryId) => {
    await api.post(`/api/webhooks/deliveries/${deliveryId}/redeliver`);
    toast.push('Delivery re-queued', 'success');
    openDeliveries(viewingDeliveries);
  };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ fontSize: 15, margin: 0 }}>Webhooks</h3>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowNew(true)}>+ New Endpoint</button>
      </div>
      <p className="text-muted" style={{ fontSize: 12.5, marginTop: 0 }}>
        Outbound HTTP notifications for domain events, HMAC-signed (X-CleanFlow-Signature header) and retried with
        exponential backoff up to 6 attempts before being marked dead-letter.
      </p>
      {endpoints === null ? <div>Loading…</div> : endpoints.length === 0 ? (
        <p className="text-muted" style={{ fontSize: 13 }}>No webhook endpoints configured.</p>
      ) : (
        <table>
          <thead><tr><th>URL</th><th>Events</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {endpoints.map((e) => (
              <tr key={e.id}>
                <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.url}</td>
                <td>{e.subscribed_events.map((ev) => <span key={ev} className="badge badge-gray" style={{ marginRight: 4 }}>{ev}</span>)}</td>
                <td>{e.is_active ? <span className="badge badge-green">ACTIVE</span> : <span className="badge badge-red">INACTIVE</span>}</td>
                <td style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => openDeliveries(e)}>Deliveries</button>
                  {e.is_active && <button className="btn btn-ghost btn-sm" onClick={() => deactivate(e.id)}>Deactivate</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showNew && (
        <Modal title="New Webhook Endpoint" onClose={() => { setShowNew(false); setNewSecret(null); }} footer={
          newSecret ? <button className="btn btn-primary" onClick={() => { setShowNew(false); setNewSecret(null); }}>Done</button> :
          <><button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={create} disabled={!form.url || form.subscribed_events.length === 0}>Create</button></>
        }>
          {newSecret ? (
            <div>
              <p><strong>Save this signing secret now — it won't be shown again:</strong></p>
              <code style={{ display: 'block', background: 'var(--paper)', padding: 10, borderRadius: 6, wordBreak: 'break-all' }}>{newSecret}</code>
              <p className="text-muted" style={{ fontSize: 12.5, marginTop: 10 }}>
                Verify incoming requests by computing HMAC-SHA256 of the raw body with this secret and comparing to
                the X-CleanFlow-Signature header.
              </p>
            </div>
          ) : (
            <>
              <div className="field"><label>Endpoint URL</label><input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="https://your-system.example.com/hooks/cleanflow" /></div>
              <div className="field"><label>Description (optional)</label><input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
              <div className="field">
                <label>Subscribed events</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {eventTypes.map((evt) => (
                    <button key={evt} type="button" className={`btn btn-sm ${form.subscribed_events.includes(evt) ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => toggleEvent(evt)}>{evt}</button>
                  ))}
                </div>
              </div>
            </>
          )}
        </Modal>
      )}

      {viewingDeliveries && (
        <Modal title={`Deliveries — ${viewingDeliveries.url}`} onClose={() => setViewingDeliveries(null)}>
          {deliveries.length === 0 ? <p className="text-muted">No deliveries yet.</p> : (
            <table>
              <thead><tr><th>Event</th><th>Status</th><th>Attempts</th><th>Last Code</th><th></th></tr></thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id}>
                    <td className="mono" style={{ fontSize: 12 }}>{d.event_type}</td>
                    <td><span className={`badge ${d.status === 'SENT' ? 'badge-green' : d.status === 'DEAD_LETTER' ? 'badge-red' : 'badge-gold'}`}>{d.status}</span></td>
                    <td>{d.attempts}/{d.max_attempts}</td>
                    <td>{d.last_response_code || '—'}</td>
                    <td>{d.status === 'DEAD_LETTER' && <button className="btn btn-ghost btn-sm" onClick={() => redeliver(d.id)}>Redeliver</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Modal>
      )}
    </div>
  );
}

function FeatureFlagsPanel() {
  const [flags, setFlags] = useState(null);
  const toast = useToast();

  const load = () => api.get('/api/feature-flags').then(setFlags);
  useEffect(() => { load(); }, []);

  const toggle = async (key, value) => {
    try {
      await api.patch(`/api/feature-flags/${key}`, { is_enabled: value });
      toast.push(`${key} ${value ? 'enabled' : 'disabled'}`, 'success');
      load();
    } catch (err) { toast.push(err.message, 'error'); }
  };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 15 }}>Feature Flags</h3>
      <p className="text-muted" style={{ fontSize: 12.5, marginTop: 0 }}>
        Toggle behavior at runtime without a deploy. Changes take effect on the next relevant event.
      </p>
      {flags === null ? <div>Loading…</div> : flags.map((f) => (
        <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{f.key}</div>
            <div className="text-muted" style={{ fontSize: 12 }}>{f.description}</div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 0, fontWeight: 400 }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={f.is_enabled} onChange={(e) => toggle(f.key, e.target.checked)} />
            {f.is_enabled ? 'On' : 'Off'}
          </label>
        </div>
      ))}
    </div>
  );
}

function SystemHealthPanel() {
  const [ready, setReady] = useState(null);
  useEffect(() => {
    fetch(`${BASE_URL}/api/health/ready`).then((r) => r.json()).then(setReady).catch(() => setReady({ status: 'unknown' }));
  }, []);
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 15 }}>System Health</h3>
      <p style={{ fontSize: 13 }}>
        Database: {ready ? (ready.status === 'ready' ? <span className="badge badge-green">OK</span> : <span className="badge badge-red">DOWN</span>) : '…'}
      </p>
      <p className="text-muted" style={{ fontSize: 12 }}>
        Background worker runs the outbox drain, webhook delivery, recurring job generation, overdue/expiry sweeps,
        analytics rollup, and search index refresh on independent schedules. Metrics are exposed in Prometheus
        format at <code>/metrics</code>.
      </p>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [rules, setRules] = useState([]);
  const [selectedType, setSelectedType] = useState('OFFICE');
  const [dirty, setDirty] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const isOwner = user.role === 'OWNER';

  const load = () => {
    api.get('/api/settings').then(setSettings);
    api.get('/api/pricing/rules').then(setRules);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handler = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const rule = rules.find((r) => r.property_type === selectedType) || {
    property_type: selectedType, base_rate: 90, rate_per_sqft: 0.05, rate_per_bathroom: 18,
    rate_per_floor_above_one: 12, supplies_flat_fee: 18, frequency_adjustments: {}, special_condition_surcharge_percent: 0, is_active: true,
  };
  const [ruleForm, setRuleForm] = useState(rule);
  useEffect(() => { setRuleForm(rule); }, [selectedType, rules.length]);

  const saveSettings = async (field, value) => {
    const updated = await api.patch('/api/settings', { [field]: value });
    setSettings(updated);
    toast.push('Settings updated', 'success');
  };

  const saveBusinessHours = async (hours) => {
    const updated = await api.patch('/api/settings', { business_hours: hours });
    setSettings(updated);
    toast.push('Business hours updated', 'success');
  };

  const saveNotificationSettings = async (notif) => {
    const updated = await api.patch('/api/settings', { notification_settings: notif });
    setSettings(updated);
  };

  const saveRule = async () => {
    try {
      await api.put('/api/pricing/rules', { ...ruleForm, base_rate: Number(ruleForm.base_rate), rate_per_sqft: Number(ruleForm.rate_per_sqft),
        rate_per_bathroom: Number(ruleForm.rate_per_bathroom), rate_per_floor_above_one: Number(ruleForm.rate_per_floor_above_one),
        supplies_flat_fee: Number(ruleForm.supplies_flat_fee) });
      toast.push('Pricing rule saved', 'success');
      setDirty(false);
      load();
    } catch (err) { toast.push(err.message, 'error'); }
  };

  if (!settings) return <div>Loading…</div>;
  const hours = settings.business_hours || {};
  const notif = settings.notification_settings || {};

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Settings</h1>

      {isOwner && <SystemHealthPanel />}
      {isOwner && <WebhooksPanel />}
      {isOwner && <FeatureFlagsPanel />}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15 }}>Company Information</h3>
        <div className="field-row">
          <div className="field"><label>Company name</label>
            <input defaultValue={settings.company_name} disabled={!isOwner}
              onBlur={(e) => e.target.value !== settings.company_name && saveSettings('company_name', e.target.value)} /></div>
          <div className="field"><label>Phone</label>
            <input defaultValue={settings.phone || ''} disabled={!isOwner}
              onBlur={(e) => e.target.value !== settings.phone && saveSettings('phone', e.target.value)} /></div>
        </div>
        <div className="field-row">
          <div className="field"><label>Email</label>
            <input defaultValue={settings.email || ''} disabled={!isOwner}
              onBlur={(e) => e.target.value !== settings.email && saveSettings('email', e.target.value)} /></div>
          <div className="field"><label>Currency</label>
            <select defaultValue={settings.currency} disabled={!isOwner}
              onChange={(e) => saveSettings('currency', e.target.value)}>
              <option value="USD">USD ($)</option><option value="CAD">CAD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option>
            </select></div>
        </div>
        <div className="field"><label>Address</label>
          <input defaultValue={settings.address || ''} disabled={!isOwner}
            onBlur={(e) => e.target.value !== settings.address && saveSettings('address', e.target.value)} /></div>
        {!isOwner && <p className="text-muted" style={{ fontSize: 12.5 }}>Only an owner can edit company settings.</p>}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15 }}>Business Hours</h3>
        {DAYS.map((d) => (
          <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ width: 50, fontWeight: 600, fontSize: 13 }}>{d}</span>
            <input style={{ maxWidth: 260 }} disabled={!isOwner} defaultValue={hours[d] || 'Closed'}
              onBlur={(e) => saveBusinessHours({ ...hours, [d]: e.target.value })} />
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15 }}>Quote & Invoice Defaults</h3>
        <div className="field-row">
          <div className="field"><label>Default quote validity (days)</label>
            <input type="number" defaultValue={settings.quote_validity_days} disabled={!isOwner}
              onBlur={(e) => saveSettings('quote_validity_days', Number(e.target.value))} /></div>
          <div className="field"><label>Default invoice due (days)</label>
            <input type="number" defaultValue={settings.invoice_due_days} disabled={!isOwner}
              onBlur={(e) => saveSettings('invoice_due_days', Number(e.target.value))} /></div>
          <div className="field"><label>Default tax rate (%)</label>
            <input type="number" step="0.1" defaultValue={settings.default_tax_rate_percent} disabled={!isOwner}
              onBlur={(e) => saveSettings('default_tax_rate_percent', Number(e.target.value))} /></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15 }}>Notification Settings</h3>
        <p className="text-muted" style={{ fontSize: 12.5, marginTop: 0 }}>Choose which events notify Owner/Manager staff in-app.</p>
        {NOTIF_KEYS.map(([key, label]) => (
          <label key={key} style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 400, padding: '5px 0' }}>
            <input type="checkbox" style={{ width: 'auto' }} disabled={!isOwner} checked={notif[key] !== false}
              onChange={(e) => saveNotificationSettings({ ...notif, [key]: e.target.checked })} />
            {label}
          </label>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15 }}>Pricing Rules (Smart Quote Engine)</h3>
        <p className="text-muted" style={{ fontSize: 13 }}>These coefficients drive every quote's price and "Why this price?" breakdown. Owner-only.</p>
        <div className="pill-nav" style={{ marginBottom: 14 }}>
          {PROPERTY_TYPES.map((t) => <button key={t} className={selectedType === t ? 'active' : ''} onClick={() => setSelectedType(t)}>{t}</button>)}
        </div>
        <div className="grid grid-3">
          <div className="field"><label>Base rate ($)</label><input type="number" value={ruleForm.base_rate} disabled={!isOwner} onChange={(e) => { setRuleForm((f) => ({ ...f, base_rate: e.target.value })); setDirty(true); }} /></div>
          <div className="field"><label>Rate per sq ft ($)</label><input type="number" step="0.001" value={ruleForm.rate_per_sqft} disabled={!isOwner} onChange={(e) => { setRuleForm((f) => ({ ...f, rate_per_sqft: e.target.value })); setDirty(true); }} /></div>
          <div className="field"><label>Rate per bathroom ($)</label><input type="number" value={ruleForm.rate_per_bathroom} disabled={!isOwner} onChange={(e) => { setRuleForm((f) => ({ ...f, rate_per_bathroom: e.target.value })); setDirty(true); }} /></div>
          <div className="field"><label>Rate per extra floor ($)</label><input type="number" value={ruleForm.rate_per_floor_above_one} disabled={!isOwner} onChange={(e) => { setRuleForm((f) => ({ ...f, rate_per_floor_above_one: e.target.value })); setDirty(true); }} /></div>
          <div className="field"><label>Supplies flat fee ($)</label><input type="number" value={ruleForm.supplies_flat_fee} disabled={!isOwner} onChange={(e) => { setRuleForm((f) => ({ ...f, supplies_flat_fee: e.target.value })); setDirty(true); }} /></div>
          <div className="field"><label>Special condition surcharge (%)</label><input type="number" step="0.01" value={ruleForm.special_condition_surcharge_percent} disabled={!isOwner} onChange={(e) => { setRuleForm((f) => ({ ...f, special_condition_surcharge_percent: Number(e.target.value) })); setDirty(true); }} /></div>
        </div>
        {isOwner && <button className="btn btn-primary" onClick={saveRule}>Save Pricing Rule</button>}
        {dirty && <span className="text-muted" style={{ fontSize: 12, marginLeft: 10 }}>Unsaved changes</span>}
      </div>
    </div>
  );
}
