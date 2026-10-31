import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { dateTimeFmt } from '../../utils/format';

export default function CustomerSchedule() {
  const [jobs, setJobs] = useState(null);
  useEffect(() => {
    api.get('/api/jobs', { upcoming_only: true, page_size: 100 }).then((d) => setJobs(d.items));
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Upcoming Schedule</h1>
      <div className="card" style={{ padding: 0 }}>
        {jobs === null ? (
          <div style={{ padding: 20 }}>Loading…</div>
        ) : jobs.length === 0 ? (
          <EmptyState title="Nothing scheduled" />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Property</th>
                <th>Scheduled</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td className="mono">{j.reference_number}</td>
                  <td>{j.property_label}</td>
                  <td>{dateTimeFmt(j.scheduled_start)}</td>
                  <td>
                    <StatusBadge status={j.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
