import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import StatusBadge from '../../components/StatusBadge';
import GenerateQuoteModal from '../../components/GenerateQuoteModal';
import { useToast } from '../../context/ToastContext';
import { dateFmt, money } from '../../utils/format';

const STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'QUOTED', 'WON', 'LOST'];

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const load = () => api.get(`/api/leads/${id}`).then(setLead);
  useEffect(() => {
    load();
  }, [id]);

  const updateStatus = async (status) => {
    await api.patch(`/api/leads/${id}`, { status });
    toast.push('Lead status updated', 'success');
    load();
  };

  const convert = async () => {
    const customer = await api.post(`/api/leads/${id}/convert`, { create_property: true });
    toast.push(
      `Converted to customer ${customer.company_name || customer.contact_name}`,
      'success'
    );
    navigate(`/app/customers/${customer.id}`);
  };

  if (!lead) return <div>Loading…</div>;

  return (
    <div>
      <Link to="/app/leads" className="text-muted" style={{ fontSize: 13 }}>
        ← Back to Leads
      </Link>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          margin: '8px 0 20px',
        }}
      >
        <div>
          <h1 style={{ marginBottom: 4 }}>
            {lead.contact_name}{' '}
            {lead.company_name && <span className="text-muted">— {lead.company_name}</span>}
          </h1>
          <span className="mono text-muted">{lead.reference_number}</span> &nbsp;{' '}
          <StatusBadge status={lead.status} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={convert}>
            Convert to Customer
          </button>
          <button className="btn btn-primary" onClick={() => setShowQuoteModal(true)}>
            Generate Quote
          </button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15 }}>Contact & Property</h3>
          <p>
            <strong>Email:</strong> {lead.email}
            <br />
            <strong>Phone:</strong> {lead.phone}
          </p>
          <p>
            <strong>Address:</strong>{' '}
            {[lead.address_line1, lead.city, lead.state, lead.zip_code]
              .filter(Boolean)
              .join(', ') || '—'}
          </p>
          <p>
            <strong>Property type:</strong> {lead.property_type}
            <br />
            <strong>Sq ft:</strong> {lead.square_footage || '—'} &nbsp; <strong>Bathrooms:</strong>{' '}
            {lead.bathrooms ?? '—'} &nbsp; <strong>Floors:</strong> {lead.floors ?? '—'}
          </p>
          <p>
            <strong>Frequency:</strong> {lead.frequency || '—'}
          </p>
          {lead.notes && (
            <p>
              <strong>Notes:</strong> {lead.notes}
            </p>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15 }}>Pipeline</h3>
          <p>
            <strong>Source:</strong> {lead.source}
          </p>
          <p>
            <strong>Estimated value:</strong> {money(lead.estimated_value)}
          </p>
          <p>
            <strong>Created:</strong> {dateFmt(lead.created_at)}
          </p>
          <p>
            <strong>Last contacted:</strong> {dateFmt(lead.last_contacted_at)}
          </p>
          <div className="field">
            <label>Update status</label>
            <select value={lead.status} onChange={(e) => updateStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {showQuoteModal && (
        <GenerateQuoteModal
          leadId={lead.id}
          initial={{
            property_type: lead.property_type,
            square_footage: lead.square_footage || 1000,
            bathrooms: lead.bathrooms ?? 1,
            floors: lead.floors ?? 1,
            frequency: lead.frequency || 'WEEKLY',
          }}
          onClose={() => setShowQuoteModal(false)}
          onCreated={(quote) => navigate(`/app/quotes/${quote.id}`)}
        />
      )}
    </div>
  );
}
