import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import { money, dateTimeFmt, dateFmt } from '../../utils/format';

export default function CustomerDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/api/customer-portal/dashboard').then(setData);
  }, []);
  if (!data) return <div>Loading…</div>;

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Welcome back</h1>
      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <div className="card stat-card">
          <span className="label">Active Contracts</span>
          <span className="value">{data.active_contracts}</span>
        </div>
        <div className="card stat-card">
          <span className="label">Outstanding Balance</span>
          <span className="value">{money(data.outstanding_invoice_total)}</span>
        </div>
        <div className="card stat-card">
          <span className="label">Open Invoices</span>
          <span className="value">{data.outstanding_invoice_count}</span>
        </div>
        <div className="card stat-card">
          <span className="label">Your Avg Rating Given</span>
          <span className="value">
            {data.average_rating_given ? `★ ${data.average_rating_given}` : '—'}
          </span>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15 }}>Upcoming Jobs</h3>
          {data.upcoming_jobs.length === 0 ? (
            <p className="text-muted">Nothing scheduled yet.</p>
          ) : (
            data.upcoming_jobs.map((j) => (
              <div
                key={j.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span>{dateTimeFmt(j.scheduled_start)}</span>
                <StatusBadge status={j.status} />
              </div>
            ))
          )}
          <Link to="/app/portal/schedule" style={{ fontSize: 13 }}>
            View schedule →
          </Link>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15 }}>Recent Service Reports</h3>
          {data.recent_service_reports.length === 0 ? (
            <p className="text-muted">No completed services yet.</p>
          ) : (
            data.recent_service_reports.map((j) => (
              <div key={j.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                {j.reference_number} — completed {dateFmt(j.completed_at)}
              </div>
            ))
          )}
          <Link to="/app/portal/history" style={{ fontSize: 13 }}>
            View service history →
          </Link>
        </div>
      </div>
    </div>
  );
}
