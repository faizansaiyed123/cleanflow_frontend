import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { money, dateFmt } from '../../utils/format';

export default function CustomerContracts() {
  const [contracts, setContracts] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { api.get('/api/contracts', { page_size: 100 }).then((d) => setContracts(d.items)); }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Your Contracts</h1>
      {contracts === null ? <div>Loading…</div> : contracts.length === 0 ? <EmptyState title="No contracts yet" /> : (
        <div className="grid grid-2">
          {contracts.map((c) => (
            <div key={c.id} className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => navigate(`/app/contracts/${c.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="mono">{c.reference_number}</span><StatusBadge status={c.status} />
              </div>
              <p style={{ margin: '10px 0 4px' }}><strong>{c.frequency}</strong> — {money(c.monthly_value)}/mo</p>
              <div className="text-muted" style={{ fontSize: 13 }}>Started {dateFmt(c.start_date)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
