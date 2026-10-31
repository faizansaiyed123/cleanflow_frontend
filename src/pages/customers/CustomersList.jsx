import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';

export default function CustomersList() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const load = () =>
    api.get('/api/customers', { q: q || undefined, page, page_size: 20 }).then(setData);
  useEffect(() => {
    load();
  }, [page]);

  const exportCsv = () => api.download('/api/customers/export/csv', 'customers.csv');

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
        <h1>Customers</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            placeholder="Search customers…"
            style={{ width: 220 }}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setPage(1), load())}
          />
          <button className="btn btn-secondary" onClick={exportCsv}>
            Export CSV
          </button>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        {data === null ? (
          <div style={{ padding: 20 }}>Loading…</div>
        ) : data.items.length === 0 ? (
          <EmptyState
            title="No customers yet"
            subtitle="Convert a qualified lead to create your first customer."
          />
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((c) => (
                  <tr
                    key={c.id}
                    className="clickable"
                    onClick={() => navigate(`/app/customers/${c.id}`)}
                  >
                    <td>{c.company_name || '—'}</td>
                    <td>{c.contact_name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
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
