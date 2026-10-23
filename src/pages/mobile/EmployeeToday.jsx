import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { timeFmt } from '../../utils/format';

export default function EmployeeToday() {
  const [jobs, setJobs] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { api.get('/api/jobs/today').then(setJobs); }, []);

  return (
    <div>
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Today's Jobs</h1>
      <p className="text-muted" style={{ marginBottom: 16 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      {jobs === null ? <div>Loading…</div> : jobs.length === 0 ? (
        <EmptyState title="No jobs today" subtitle="Enjoy the day off!" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {jobs.map((j) => (
            <div key={j.id} className="card card-hover" onClick={() => navigate(`/app/mobile/${j.id}`)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: 16 }}>{timeFmt(j.scheduled_start)}</strong>
                <StatusBadge status={j.status} />
              </div>
              <div style={{ marginTop: 6 }}>{j.customer_name}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>{j.property_label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
