import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import { dateFmt, money } from '../../utils/format';

const STATUSES = ['PENDING', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED'];

export default function ContractsList() {
  const [data, setData] = useState(null);
  const [statusFilter, setStatusFilter] = useState(
    () => localStorage.getItem('cf_contracts_status') || ''
  );
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/api/contracts', { status: statusFilter || undefined, page, page_size: 20 })
      .then(setData);
  }, [statusFilter, page]);
  useEffect(() => {
    localStorage.setItem('cf_contracts_status', statusFilter);
  }, [statusFilter]);

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Contracts</h1>
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
          <EmptyState title="No contracts yet" />
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Frequency</th>
                  <th>Monthly Value</th>
                  <th>Start</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((c) => (
                  <tr
                    key={c.id}
                    className="clickable"
                    onClick={() => navigate(`/app/contracts/${c.id}`)}
                  >
                    <td className="mono">{c.reference_number}</td>
                    <td>{c.frequency}</td>
                    <td>{money(c.monthly_value)}</td>
                    <td>{dateFmt(c.start_date)}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
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
