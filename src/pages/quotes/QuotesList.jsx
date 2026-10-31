import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { dateFmt, money } from '../../utils/format';

const STATUSES = ['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

export default function QuotesList() {
  const [data, setData] = useState(null);
  const [statusFilter, setStatusFilter] = useState(
    () => localStorage.getItem('cf_quotes_status') || ''
  );
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/api/quotes', { status: statusFilter || undefined, page, page_size: 20 })
      .then(setData);
  }, [statusFilter, page]);
  useEffect(() => {
    localStorage.setItem('cf_quotes_status', statusFilter);
  }, [statusFilter]);

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Quotes</h1>
      <div className="pill-nav" style={{ marginBottom: 16 }}>
        <button
          className={!statusFilter ? 'active' : ''}
          onClick={() => {
            setStatusFilter('');
            setPage(1);
          }}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={statusFilter === s ? 'active' : ''}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="card" style={{ padding: 0 }}>
        {data === null ? (
          <div style={{ padding: 20 }}>Loading…</div>
        ) : data.items.length === 0 ? (
          <EmptyState title="No quotes yet" subtitle="Generate one from a lead to get started." />
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Property Type</th>
                  <th>Frequency</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Valid Until</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((q) => (
                  <tr
                    key={q.id}
                    className="clickable"
                    onClick={() => navigate(`/app/quotes/${q.id}`)}
                  >
                    <td className="mono">{q.reference_number}</td>
                    <td>{q.property_type}</td>
                    <td>{q.frequency}</td>
                    <td>{money(q.total)}</td>
                    <td>
                      <StatusBadge status={q.status} />
                    </td>
                    <td>{dateFmt(q.valid_until)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '0 12px' }}>
              <Pagination
                page={data.page}
                pageSize={data.page_size}
                total={data.total}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
