import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { money } from '../../utils/format';

const RANGES = ['today', 'this_week', 'this_month', 'last_month', 'this_year'];

export default function AnalyticsPage() {
  const [range, setRange] = useState('this_month');
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/api/analytics', { range }).then(setData);
  }, [range]);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h1>Analytics</h1>
        <div className="pill-nav">
          {RANGES.map((r) => (
            <button key={r} className={range === r ? 'active' : ''} onClick={() => setRange(r)}>
              {r.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
      {!data ? (
        <div>Loading…</div>
      ) : (
        <>
          <div className="grid grid-4" style={{ marginBottom: 20 }}>
            <div className="card stat-card">
              <span className="label">Revenue</span>
              <span className="value">{money(data.revenue)}</span>
            </div>
            <div className="card stat-card">
              <span className="label">Jobs Completed</span>
              <span className="value">{data.jobs_completed}</span>
            </div>
            <div className="card stat-card">
              <span className="label">Jobs Cancelled/No-show</span>
              <span className="value">{data.jobs_cancelled_or_no_show}</span>
            </div>
            <div className="card stat-card">
              <span className="label">New Leads</span>
              <span className="value">{data.new_leads}</span>
            </div>
            <div className="card stat-card">
              <span className="label">Quote Conversion</span>
              <span className="value">{data.quote_conversion_rate_percent}%</span>
            </div>
            <div className="card stat-card">
              <span className="label">New Contracts</span>
              <span className="value">{data.new_contracts}</span>
            </div>
            <div className="card stat-card">
              <span className="label">Avg Job Duration</span>
              <span className="value">
                {data.average_job_duration_minutes ? `${data.average_job_duration_minutes}m` : '—'}
              </span>
            </div>
            <div className="card stat-card">
              <span className="label">Avg Rating</span>
              <span className="value">
                {data.average_rating ? `★ ${data.average_rating}` : '—'}
              </span>
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 15 }}>Employee Workload</h3>
            {Object.entries(data.employee_workload).map(([name, count]) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span>{name}</span>
                <strong>{count} job(s)</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
