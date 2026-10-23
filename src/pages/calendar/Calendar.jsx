import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { timeFmt } from '../../utils/format';

function startOfWeek(d) {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}
function startOfMonth(d) { const date = new Date(d); date.setDate(1); date.setHours(0, 0, 0, 0); return date; }

const STATUSES = ['SCHEDULED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

export default function Calendar() {
  const [view, setView] = useState('week'); // week | month | day
  const [anchor, setAnchor] = useState(new Date());
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ employee_id: '', status: '' });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api.get('/api/employees').then(setEmployees); }, []);

  const range = useMemo(() => {
    if (view === 'day') { const s = new Date(anchor); s.setHours(0,0,0,0); const e = new Date(s); e.setDate(e.getDate()+1); return [s, e]; }
    if (view === 'month') { const s = startOfMonth(anchor); const e = new Date(s); e.setMonth(e.getMonth()+1); return [s, e]; }
    const s = startOfWeek(anchor); const e = new Date(s); e.setDate(e.getDate()+7); return [s, e];
  }, [view, anchor]);

  useEffect(() => {
    api.get('/api/scheduling/calendar', {
      start: range[0].toISOString(), end: range[1].toISOString(),
      employee_id: filters.employee_id || undefined, status: filters.status || undefined,
    }).then(setJobs);
  }, [range, filters]);

  const days = useMemo(() => {
    const count = Math.round((range[1] - range[0]) / (1000 * 60 * 60 * 24));
    return Array.from({ length: count }, (_, i) => { const d = new Date(range[0]); d.setDate(d.getDate() + i); return d; });
  }, [range]);

  const jobsForDay = (day) => jobs.filter((j) => new Date(j.scheduled_start).toDateString() === day.toDateString())
    .sort((a, b) => new Date(a.scheduled_start) - new Date(b.scheduled_start));

  const step = (dir) => {
    const n = new Date(anchor);
    if (view === 'day') n.setDate(n.getDate() + dir);
    else if (view === 'month') n.setMonth(n.getMonth() + dir);
    else n.setDate(n.getDate() + dir * 7);
    setAnchor(n);
  };

  const gridCols = view === 'day' ? '1fr' : `repeat(${days.length}, 1fr)`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h1>Calendar</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="pill-nav">
            {['day', 'week', 'month'].map((v) => <button key={v} className={view === v ? 'active' : ''} onClick={() => setView(v)}>{v}</button>)}
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => step(-1)}>← Prev</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setAnchor(new Date())}>Today</button>
          <button className="btn btn-secondary btn-sm" onClick={() => step(1)}>Next →</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowFilters((s) => !s)}>Filters {(filters.employee_id || filters.status) ? '●' : ''}</button>
        </div>
      </div>

      {showFilters && (
        <div className="card" style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="field" style={{ marginBottom: 0, minWidth: 200 }}>
            <label>Employee</label>
            <select value={filters.employee_id} onChange={(e) => setFilters((f) => ({ ...f, employee_id: e.target.value }))}>
              <option value="">All employees</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0, minWidth: 200 }}>
            <label>Status</label>
            <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ employee_id: '', status: '' })}>Clear filters</button>
        </div>
      )}

      <div style={{ fontWeight: 700, marginBottom: 10 }}>
        {view === 'month' ? anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : view === 'day' ? anchor.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
          : `${range[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(range[1] - 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
      </div>

      <div className="grid" style={{ gridTemplateColumns: gridCols, gap: 10 }}>
        {days.map((day) => (
          <div key={day.toISOString()} className="card" style={{ minHeight: view === 'month' ? 110 : 220, padding: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 8, color: 'var(--ink-soft)' }}>
              {day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
            </div>
            {jobsForDay(day).map((j) => (
              <div key={j.id} onClick={() => navigate(`/app/jobs/${j.id}`)}
                style={{ background: 'var(--moss-light)', borderRadius: 6, padding: '6px 8px', marginBottom: 6, cursor: 'pointer', fontSize: 12 }}>
                <div style={{ fontWeight: 700 }}>{timeFmt(j.scheduled_start)}</div>
                <div>{j.customer_name}</div>
                {view !== 'month' && <div className="text-muted">{j.property_label}</div>}
                <StatusBadge status={j.status} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
