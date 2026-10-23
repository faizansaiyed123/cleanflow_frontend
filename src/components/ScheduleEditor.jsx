import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import Modal from './Modal';
import { dateFmt, timeFmt } from '../utils/format';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function ScheduleEditor({ contractId }) {
  const [schedule, setSchedule] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm] = useState(null);
  const [showException, setShowException] = useState(false);
  const [excForm, setExcForm] = useState({ original_occurrence_date: '', is_skipped: false, override_date: '', override_time_of_day: '', note: '' });
  const toast = useToast();

  const load = async () => {
    try {
      const s = await api.get(`/api/scheduling/contracts/${contractId}/schedule`);
      setSchedule(s);
      setForm({ days_of_week: s.days_of_week, interval_weeks: s.interval_weeks, time_of_day: s.time_of_day,
        duration_minutes: s.duration_minutes, generate_horizon_days: s.generate_horizon_days });
    } catch {
      setNotFound(true);
    }
  };
  useEffect(() => { load(); }, [contractId]);

  const toggleDay = (d) => setForm((f) => ({
    ...f, days_of_week: f.days_of_week.includes(d) ? f.days_of_week.filter((x) => x !== d) : [...f.days_of_week, d],
  }));

  const save = async () => {
    try {
      await api.patch(`/api/scheduling/schedules/${schedule.id}`, form);
      toast.push('Schedule updated — future occurrences will follow the new pattern', 'success');
      load();
    } catch (err) { toast.push(err.message, 'error'); }
  };

  const regenerate = async () => {
    try {
      const r = await api.post(`/api/scheduling/schedules/${schedule.id}/generate`);
      toast.push(`Generated ${r.created_job_count} new job(s)`, 'success');
    } catch (err) { toast.push(err.message, 'error'); }
  };

  const submitException = async () => {
    try {
      await api.post(`/api/scheduling/schedules/${schedule.id}/exceptions`, {
        original_occurrence_date: excForm.original_occurrence_date,
        is_skipped: excForm.is_skipped,
        override_date: excForm.is_skipped ? null : (excForm.override_date || null),
        override_time_of_day: excForm.is_skipped ? null : (excForm.override_time_of_day || null),
        note: excForm.note || null,
      });
      toast.push('Occurrence override saved', 'success');
      setShowException(false);
      setExcForm({ original_occurrence_date: '', is_skipped: false, override_date: '', override_time_of_day: '', note: '' });
    } catch (err) { toast.push(err.message, 'error'); }
  };

  if (notFound) return null;
  if (!schedule || !form) return <div className="card">Loading schedule…</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h3 style={{ fontSize: 15, margin: 0 }}>Recurring Schedule</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowException(true)}>Add Occurrence Override</button>
          <button className="btn btn-secondary btn-sm" onClick={regenerate}>Regenerate Jobs</button>
        </div>
      </div>
      <p className="text-muted" style={{ fontSize: 12.5, marginTop: 0 }}>
        Editing this pattern only affects future occurrences that haven't been generated yet — jobs already on the
        calendar are untouched. Generated through {dateFmt(schedule.last_generated_through)}.
      </p>

      {(form.days_of_week !== undefined) && schedule.frequency !== 'MONTHLY' && (
        <div className="field">
          <label>Days of week</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {DAYS.map((d) => (
              <button key={d} type="button" className={`btn btn-sm ${form.days_of_week.includes(d) ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => toggleDay(d)}>{d}</button>
            ))}
          </div>
        </div>
      )}
      <div className="field-row">
        <div className="field"><label>Time of day</label><input type="time" value={form.time_of_day} onChange={(e) => setForm((f) => ({ ...f, time_of_day: e.target.value }))} /></div>
        <div className="field"><label>Duration (minutes)</label><input type="number" value={form.duration_minutes} onChange={(e) => setForm((f) => ({ ...f, duration_minutes: Number(e.target.value) }))} /></div>
        <div className="field"><label>Interval (weeks)</label><input type="number" min="1" value={form.interval_weeks} onChange={(e) => setForm((f) => ({ ...f, interval_weeks: Number(e.target.value) }))} /></div>
      </div>
      <button className="btn btn-primary btn-sm" onClick={save}>Save Schedule</button>

      {showException && (
        <Modal title="Add Occurrence Override" onClose={() => setShowException(false)} footer={
          <><button className="btn btn-secondary" onClick={() => setShowException(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitException} disabled={!excForm.original_occurrence_date}>Save Override</button></>
        }>
          <div className="field"><label>Original occurrence date</label>
            <input type="date" value={excForm.original_occurrence_date} onChange={(e) => setExcForm((f) => ({ ...f, original_occurrence_date: e.target.value }))} />
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 400, marginBottom: 10 }}>
            <input type="checkbox" style={{ width: 'auto' }} checked={excForm.is_skipped}
              onChange={(e) => setExcForm((f) => ({ ...f, is_skipped: e.target.checked }))} />
            Skip this occurrence entirely
          </label>
          {!excForm.is_skipped && (
            <div className="field-row">
              <div className="field"><label>Move to date</label><input type="date" value={excForm.override_date} onChange={(e) => setExcForm((f) => ({ ...f, override_date: e.target.value }))} /></div>
              <div className="field"><label>Move to time</label><input type="time" value={excForm.override_time_of_day} onChange={(e) => setExcForm((f) => ({ ...f, override_time_of_day: e.target.value }))} /></div>
            </div>
          )}
          <div className="field"><label>Note</label><input value={excForm.note} onChange={(e) => setExcForm((f) => ({ ...f, note: e.target.value }))} /></div>
          <p className="text-muted" style={{ fontSize: 12 }}>
            If a job already exists for that date, it will be updated directly. Otherwise this override is applied
            the next time jobs are generated.
          </p>
        </Modal>
      )}
    </div>
  );
}
