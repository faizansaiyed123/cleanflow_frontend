import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

function AvailabilityEditor({ employee, onClose, onSaved }) {
  const [avail, setAvail] = useState(employee.availability || {});
  const toast = useToast();

  const toggleDay = (d) => setAvail((a) => {
    const next = { ...a };
    if (next[d]) delete next[d];
    else next[d] = [['08:00', '17:00']];
    return next;
  });

  const setTime = (d, idx, part, value) => setAvail((a) => {
    const next = { ...a, [d]: [...(a[d] || [['08:00', '17:00']])] };
    next[d][idx] = part === 'start' ? [value, next[d][idx][1]] : [next[d][idx][0], value];
    return next;
  });

  const save = async () => {
    try {
      await api.patch(`/api/employees/${employee.id}`, { availability: avail });
      toast.push('Availability updated', 'success');
      onSaved();
    } catch (err) { toast.push(err.message, 'error'); }
  };

  return (
    <Modal title={`Availability — ${employee.full_name}`} onClose={onClose} footer={
      <><button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>Save</button></>
    }>
      {DAYS.map((d) => (
        <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600, width: 90, marginBottom: 0 }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={!!avail[d]} onChange={() => toggleDay(d)} />
            {d}
          </label>
          {avail[d] && (
            <>
              <input type="time" style={{ width: 110 }} value={avail[d][0][0]} onChange={(e) => setTime(d, 0, 'start', e.target.value)} />
              <span>–</span>
              <input type="time" style={{ width: 110 }} value={avail[d][0][1]} onChange={(e) => setTime(d, 0, 'end', e.target.value)} />
            </>
          )}
        </div>
      ))}
    </Modal>
  );
}

export default function EmployeesList() {
  const [employees, setEmployees] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [availEditing, setAvailEditing] = useState(null);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', hourly_rate: 18, skills: '' });
  const toast = useToast();

  const load = () => api.get('/api/employees').then(setEmployees);
  useEffect(() => { load(); }, []);

  const create = async () => {
    try {
      await api.post('/api/employees', {
        full_name: form.full_name, email: form.email, phone: form.phone,
        hourly_rate: Number(form.hourly_rate), skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
      });
      toast.push('Employee added', 'success');
      setShowNew(false);
      setForm({ full_name: '', email: '', phone: '', hourly_rate: 18, skills: '' });
      load();
    } catch (err) { toast.push(err.message, 'error'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Employees</h1>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ Add Employee</button>
      </div>
      {employees === null ? <div>Loading…</div> : employees.length === 0 ? <EmptyState title="No employees yet" /> : (
        <div className="grid grid-3">
          {employees.map((e) => (
            <div className="card" key={e.id}>
              <h3 style={{ fontSize: 16 }}>{e.full_name}</h3>
              <p style={{ margin: '4px 0', fontSize: 13.5 }}>{e.email}<br />{e.phone}</p>
              <p style={{ fontSize: 13.5 }}><strong>${e.hourly_rate}/hr</strong></p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                {e.skills.map((s) => <span key={s} className="badge badge-green">{s}</span>)}
              </div>
              <div className="text-muted" style={{ fontSize: 12, marginBottom: 8 }}>
                {Object.keys(e.availability || {}).length > 0
                  ? `Available ${Object.keys(e.availability).join(', ')}`
                  : 'No availability set'}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setAvailEditing(e)}>Edit Availability</button>
            </div>
          ))}
        </div>
      )}
      {showNew && (
        <Modal title="Add Employee" onClose={() => setShowNew(false)} footer={
          <><button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={create}>Add</button></>
        }>
          <div className="field"><label>Full name</label><input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} /></div>
          <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
          <div className="field"><label>Phone</label><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></div>
          <div className="field"><label>Hourly rate</label><input type="number" value={form.hourly_rate} onChange={(e) => setForm((f) => ({ ...f, hourly_rate: e.target.value }))} /></div>
          <div className="field"><label>Skills (comma separated)</label><input value={form.skills} onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))} /></div>
        </Modal>
      )}
      {availEditing && (
        <AvailabilityEditor employee={availEditing} onClose={() => setAvailEditing(null)}
          onSaved={() => { setAvailEditing(null); load(); }} />
      )}
    </div>
  );
}
