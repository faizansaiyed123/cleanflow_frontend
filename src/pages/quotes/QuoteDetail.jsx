import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import PricingBreakdown from '../../components/PricingBreakdown';
import ConfirmDialog from '../../components/ConfirmDialog';
import { dateFmt, money } from '../../utils/format';

export default function QuoteDetail() {
  const { id } = useParams();
  const [quote, setQuote] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const load = () => api.get(`/api/quotes/${id}`).then(setQuote);
  useEffect(() => {
    load();
  }, [id]);

  const isStaff = user.role === 'OWNER' || user.role === 'MANAGER';
  const isCustomer = user.role === 'CUSTOMER';

  const send = async () => {
    await api.post(`/api/quotes/${id}/send`);
    toast.push('Quote sent', 'success');
    load();
  };
  const clone = async () => {
    const c = await api.post(`/api/quotes/${id}/clone`);
    toast.push('Quote cloned', 'success');
    navigate(`/app/quotes/${c.id}`);
  };
  const accept = async () => {
    try {
      const contract = await api.post(`/api/quotes/${id}/accept`);
      toast.push(`Quote accepted! Contract ${contract.reference_number} created.`, 'success');
      const path = isCustomer ? `/app/portal/contracts` : `/app/contracts/${contract.id}`;
      navigate(path);
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };
  const reject = async () => {
    await api.post(`/api/quotes/${id}/reject`, { reason: 'Declined' });
    toast.push('Quote rejected', 'success');
    load();
  };
  const downloadPdf = () => api.openInNewTab(`/api/quotes/${id}/pdf`);

  if (!quote) return <div>Loading…</div>;

  return (
    <div>
      {!isCustomer && (
        <Link to="/app/quotes" className="text-muted" style={{ fontSize: 13 }}>
          ← Back to Quotes
        </Link>
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          margin: '8px 0 20px',
        }}
      >
        <div>
          <h1 style={{ marginBottom: 4 }}>Quote {quote.reference_number}</h1>
          <StatusBadge status={quote.status} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isStaff && quote.status === 'DRAFT' && (
            <button className="btn btn-primary" onClick={send}>
              Send to Customer
            </button>
          )}
          {isStaff && (
            <button className="btn btn-secondary" onClick={clone}>
              Clone
            </button>
          )}
          <button className="btn btn-secondary" onClick={downloadPdf}>
            Download PDF
          </button>
          {(quote.status === 'SENT' || quote.status === 'VIEWED') && (
            <>
              <button className="btn btn-secondary" onClick={() => setConfirmAction('reject')}>
                Reject
              </button>
              <button className="btn btn-primary" onClick={() => setConfirmAction('accept')}>
                Accept Quote
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15 }}>Details</h3>
          <p>
            <strong>Property type:</strong> {quote.property_type}
          </p>
          <p>
            <strong>Square footage:</strong> {quote.square_footage} &nbsp;{' '}
            <strong>Bathrooms:</strong> {quote.bathrooms} &nbsp; <strong>Floors:</strong>{' '}
            {quote.floors}
          </p>
          <p>
            <strong>Frequency:</strong> {quote.frequency}
          </p>
          <p>
            <strong>Valid until:</strong> {dateFmt(quote.valid_until)}
          </p>
          {quote.terms && (
            <p>
              <strong>Terms:</strong> {quote.terms}
            </p>
          )}
          {quote.notes && (
            <p>
              <strong>Notes:</strong> {quote.notes}
            </p>
          )}
        </div>
        <PricingBreakdown breakdown={quote.pricing_breakdown} total={quote.total} />
      </div>

      {confirmAction === 'accept' && (
        <ConfirmDialog
          title="Accept this quote?"
          confirmLabel="Accept Quote"
          message="Accepting will create a customer contract, set up the recurring schedule, and generate upcoming jobs automatically."
          onConfirm={() => {
            setConfirmAction(null);
            accept();
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
      {confirmAction === 'reject' && (
        <ConfirmDialog
          title="Reject this quote?"
          danger
          confirmLabel="Reject"
          message="This quote will be marked rejected and can no longer be accepted."
          onConfirm={() => {
            setConfirmAction(null);
            reject();
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
