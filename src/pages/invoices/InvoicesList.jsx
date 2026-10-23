import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { dateFmt, money } from '../../utils/format';

const STATUSES = ['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID'];

export default function InvoicesList() {
  const [data, setData] = useState(null);
  const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem('cf_invoices_status') || '');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  const load = () => api.get('/api/invoices', { status: statusFilter || undefined, page, page_size: 20 }).then(setData);
  useEffect(() => { load(); }, [statusFilter, page]);
  useEffect(() => { localStorage.setItem('cf_invoices_status', statusFilter); }, [statusFilter]);

  const toggleSelect = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const exportCsv = () => api.download('/api/invoices/export/csv', 'invoices.csv');

  const bulkSend = async () => {
    try {
      const result = await api.post('/api/invoices/bulk-send', { invoice_ids: selected });
      toast.push(`Sent ${result.sent.length} invoice(s)${result.failed.length ? `, ${result.failed.length} failed` : ''}`,
        result.failed.length ? 'error' : 'success');
      setSelected([]);
      load();
    } catch (err) { toast.push(err.message, 'error'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Invoices</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {selected.length > 0 && (
            <>
              <span className="text-muted" style={{ fontSize: 13 }}>{selected.length} selected</span>
              <button className="btn btn-primary btn-sm" onClick={bulkSend}>Bulk Send</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Clear</button>
            </>
          )}
          <button className="btn btn-secondary" onClick={exportCsv}>Export CSV</button>
        </div>
      </div>
      <div className="pill-nav" style={{ marginBottom: 16 }}>
        <button className={!statusFilter ? 'active' : ''} onClick={() => { setStatusFilter(''); setPage(1); }}>All</button>
        {STATUSES.map((s) => <button key={s} className={statusFilter === s ? 'active' : ''} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>)}
      </div>
      <div className="card" style={{ padding: 0 }}>
        {data === null ? <div style={{ padding: 20 }}>Loading…</div> : data.items.length === 0 ? (
          <EmptyState title="No invoices yet" />
        ) : (
          <>
            <table>
              <thead><tr><th style={{ width: 30 }}></th><th>Reference</th><th>Total</th><th>Balance Due</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {data.items.map((i) => (
                  <tr key={i.id} className="clickable">
                    <td onClick={(e) => e.stopPropagation()}>
                      {i.status === 'DRAFT' && <input type="checkbox" checked={selected.includes(i.id)} onChange={() => toggleSelect(i.id)} />}
                    </td>
                    <td className="mono" onClick={() => navigate(`/app/invoices/${i.id}`)}>{i.reference_number}</td>
                    <td onClick={() => navigate(`/app/invoices/${i.id}`)}>{money(i.total)}</td>
                    <td onClick={() => navigate(`/app/invoices/${i.id}`)}>{money(i.balance_due)}</td>
                    <td onClick={() => navigate(`/app/invoices/${i.id}`)}>{dateFmt(i.due_date)}</td>
                    <td onClick={() => navigate(`/app/invoices/${i.id}`)}><StatusBadge status={i.status} /></td>
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
