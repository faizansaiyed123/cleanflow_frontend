import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { dateFmt, money } from '../../utils/format';

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'QUOTED', 'WON', 'LOST'];

export default function LeadsList() {
  const [data, setData] = useState(null);
  const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem('cf_leads_status') || '');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const load = () => api.get('/api/leads', { status: statusFilter || undefined, q: q || undefined, page, page_size: 20 }).then(setData);

  useEffect(() => { load(); }, [statusFilter, page]);
  useEffect(() => { localStorage.setItem('cf_leads_status', statusFilter); }, [statusFilter]);

  const exportCsv = () => api.download('/api/leads/export/csv', 'leads.csv');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Leads</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Search leads…" style={{ width: 220 }} value={q}
            onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())} />
          <button className="btn btn-secondary" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>
      <div className="pill-nav" style={{ marginBottom: 16 }}>
        <button className={!statusFilter ? 'active' : ''} onClick={() => { setStatusFilter(''); setPage(1); }}>All</button>
        {STATUSES.map((s) => (
          <button key={s} className={statusFilter === s ? 'active' : ''} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
        ))}
      </div>
      <div className="card" style={{ padding: 0 }}>
        {data === null ? <div style={{ padding: 20 }}>Loading…</div> : data.items.length === 0 ? (
          <EmptyState title="No leads found" subtitle="New website quote requests will appear here automatically." />
        ) : (
          <>
            <table>
              <thead><tr><th>Reference</th><th>Contact</th><th>Company</th><th>Source</th><th>Status</th><th>Est. Value</th><th>Created</th></tr></thead>
              <tbody>
                {data.items.map((l) => (
                  <tr key={l.id} className="clickable" onClick={() => navigate(`/app/leads/${l.id}`)}>
                    <td className="mono">{l.reference_number}</td>
                    <td>{l.contact_name}</td>
                    <td>{l.company_name || '—'}</td>
                    <td>{l.source}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td>{money(l.estimated_value)}</td>
                    <td>{dateFmt(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '0 12px' }}>
              <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
