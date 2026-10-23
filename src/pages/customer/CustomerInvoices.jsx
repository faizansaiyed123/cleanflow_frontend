import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { money, dateFmt } from '../../utils/format';

export default function CustomerInvoices() {
  const [invoices, setInvoices] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { api.get('/api/invoices', { page_size: 100 }).then((d) => setInvoices(d.items)); }, []);

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Your Invoices</h1>
      <div className="card" style={{ padding: 0 }}>
        {invoices === null ? <div style={{ padding: 20 }}>Loading…</div> : invoices.length === 0 ? (
          <EmptyState title="No invoices yet" />
        ) : (
          <table>
            <thead><tr><th>Reference</th><th>Total</th><th>Balance Due</th><th>Due Date</th><th>Status</th></tr></thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="clickable" onClick={() => navigate(`/app/invoices/${i.id}`)}>
                  <td className="mono">{i.reference_number}</td>
                  <td>{money(i.total)}</td>
                  <td>{money(i.balance_due)}</td>
                  <td>{dateFmt(i.due_date)}</td>
                  <td><StatusBadge status={i.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
