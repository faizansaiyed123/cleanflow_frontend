import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import Pagination from '../../components/Pagination';
import { dateTimeFmt } from '../../utils/format';

export default function AuditLogPage() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const load = () => api.get('/api/audit-logs', { q: q || undefined, page, page_size: 50 }).then(setData);
  useEffect(() => { load(); }, [page]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Audit Log</h1>
        <input placeholder="Filter by action (e.g. quote.)" style={{ width: 260 }} value={q}
          onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())} />
      </div>
      <div className="card" style={{ padding: 0 }}>
        {data === null ? <div style={{ padding: 20 }}>Loading…</div> : (
          <>
            <table>
              <thead><tr><th>Action</th><th>Entity</th><th>Actor Role</th><th>When</th></tr></thead>
              <tbody>
                {data.items.map((l) => (
                  <tr key={l.id}>
                    <td className="mono">{l.action}</td>
                    <td>{l.entity_type} <span className="text-muted">#{l.entity_id.slice(0, 8)}</span></td>
                    <td>{l.actor_role || 'system'}</td>
                    <td>{dateTimeFmt(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '0 12px' }}><Pagination page={data.page} pageSize={data.page_size} total={data.total} onPageChange={setPage} /></div>
          </>
        )}
      </div>
    </div>
  );
}
