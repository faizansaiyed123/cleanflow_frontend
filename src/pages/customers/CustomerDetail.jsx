import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import GenerateQuoteModal from '../../components/GenerateQuoteModal';
import CustomerTimeline from '../../components/CustomerTimeline';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [showQuote, setShowQuote] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const load = () => api.get(`/api/customers/${id}`).then(setCustomer);
  useEffect(() => { load(); }, [id]);

  const archive = async () => {
    try {
      await api.post(`/api/customers/${id}/archive`);
      toast.push('Customer archived', 'success');
      navigate('/app/customers');
    } catch (err) { toast.push(err.message, 'error'); }
  };

  if (!customer) return <div>Loading…</div>;
  const prop = customer.properties[0];

  return (
    <div>
      <Link to="/app/customers" className="text-muted" style={{ fontSize: 13 }}>← Back to Customers</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '8px 0 20px' }}>
        <h1>{customer.company_name || customer.contact_name}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => setConfirmArchive(true)}>Archive</button>
          <button className="btn btn-primary" onClick={() => setShowQuote(true)}>Generate Quote</button>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15 }}>Contact</h3>
          <p><strong>Contact:</strong> {customer.contact_name}</p>
          <p><strong>Email:</strong> {customer.email}</p>
          <p><strong>Phone:</strong> {customer.phone}</p>
          {customer.notes && <p><strong>Notes:</strong> {customer.notes}</p>}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15 }}>Properties</h3>
          {customer.properties.length === 0 ? <p className="text-muted">No properties on file.</p> : customer.properties.map((p) => (
            <div key={p.id} style={{ marginBottom: 10 }}>
              <strong>{p.label}</strong><br />
              <span className="text-muted">{p.full_address}</span><br />
              <span className="text-muted">{p.square_footage} sq ft · {p.bathrooms} bath · {p.floors} floor(s)</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 20 }}>
        <CustomerTimeline customerId={customer.id} />
      </div>
      {showQuote && (
        <GenerateQuoteModal customerId={customer.id}
          initial={prop ? { property_type: prop.property_type, square_footage: prop.square_footage, bathrooms: prop.bathrooms, floors: prop.floors } : {}}
          onClose={() => setShowQuote(false)} onCreated={(q) => navigate(`/app/quotes/${q.id}`)} />
      )}
      {confirmArchive && (
        <ConfirmDialog title="Archive this customer?" confirmLabel="Archive"
          message="Archived customers are hidden from active lists but their history (contracts, jobs, invoices) is preserved."
          onConfirm={() => { setConfirmArchive(false); archive(); }} onCancel={() => setConfirmArchive(false)} />
      )}
    </div>
  );
}
