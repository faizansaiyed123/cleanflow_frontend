import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { money, dateFmt } from '../../utils/format';

export default function CustomerQuotes() {
  const [quotes, setQuotes] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    api.get('/api/quotes', { page_size: 100 }).then((d) => setQuotes(d.items));
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Your Quotes</h1>
      {quotes === null ? (
        <div>Loading…</div>
      ) : quotes.length === 0 ? (
        <EmptyState title="No quotes yet" />
      ) : (
        <div className="grid grid-2">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="card card-hover"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/app/quotes/${q.id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="mono">{q.reference_number}</span>
                <StatusBadge status={q.status} />
              </div>
              <div
                style={{ fontSize: 22, fontFamily: "'Source Serif 4', serif", margin: '10px 0' }}
              >
                {money(q.total)}
              </div>
              <div className="text-muted" style={{ fontSize: 13 }}>
                {q.property_type} · {q.frequency}
              </div>
              <div className="text-muted" style={{ fontSize: 13 }}>
                Valid until {dateFmt(q.valid_until)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
