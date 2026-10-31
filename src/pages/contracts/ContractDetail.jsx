import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';
import ScheduleEditor from '../../components/ScheduleEditor';
import { dateFmt, money } from '../../utils/format';

export default function ContractDetail() {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [health, setHealth] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [showRenew, setShowRenew] = useState(false);
  const [renewDate, setRenewDate] = useState('');
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const isStaff = user.role === 'OWNER' || user.role === 'MANAGER';

  const load = () => {
    api.get(`/api/contracts/${id}`).then(setContract);
    api.get(`/api/contracts/${id}/health`).then(setHealth);
  };
  useEffect(() => {
    load();
  }, [id]);

  const pause = async () => {
    await api.post(`/api/contracts/${id}/pause`);
    toast.push('Contract paused', 'success');
    load();
  };
  const resume = async () => {
    await api.post(`/api/contracts/${id}/resume`);
    toast.push('Contract resumed', 'success');
    load();
  };
  const cancel = async () => {
    await api.post(`/api/contracts/${id}/cancel`, { reason: 'Cancelled by staff' });
    toast.push('Contract cancelled', 'success');
    load();
  };
  const renew = async () => {
    try {
      const renewed = await api.post(`/api/contracts/${id}/renew`, {
        new_end_date: renewDate || null,
      });
      toast.push(`Contract renewed as ${renewed.reference_number}`, 'success');
      setShowRenew(false);
      navigate(`/app/contracts/${renewed.id}`);
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  if (!contract) return <div>Loading…</div>;

  return (
    <div>
      {isStaff && (
        <Link to="/app/contracts" className="text-muted" style={{ fontSize: 13 }}>
          ← Back to Contracts
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
          <h1 style={{ marginBottom: 4 }}>Contract {contract.reference_number}</h1>
          <StatusBadge status={contract.status} />
        </div>
        {isStaff && (
          <div style={{ display: 'flex', gap: 8 }}>
            {contract.status === 'ACTIVE' && (
              <button className="btn btn-secondary" onClick={pause}>
                Pause
              </button>
            )}
            {contract.status === 'PAUSED' && (
              <button className="btn btn-secondary" onClick={resume}>
                Resume
              </button>
            )}
            {(contract.status === 'ACTIVE' || contract.status === 'EXPIRED') && (
              <button className="btn btn-secondary" onClick={() => setShowRenew(true)}>
                Renew
              </button>
            )}
            {contract.status !== 'CANCELLED' && (
              <button className="btn btn-danger" onClick={() => setConfirmCancel(true)}>
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="label text-muted">Frequency</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{contract.frequency}</div>
        </div>
        <div className="card">
          <div className="label text-muted">Monthly Value</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{money(contract.monthly_value)}</div>
        </div>
        <div className="card">
          <div className="label text-muted">Start Date</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{dateFmt(contract.start_date)}</div>
        </div>
      </div>

      {health && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15 }}>Contract Health</h3>
          <div className="grid grid-4">
            <div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                Completed Jobs
              </div>
              <div style={{ fontWeight: 700 }}>{health.completed_job_count}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                Completion Rate
              </div>
              <div style={{ fontWeight: 700 }}>
                {health.job_completion_rate !== null
                  ? `${Math.round(health.job_completion_rate * 100)}%`
                  : '—'}
              </div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                Revenue Invoiced
              </div>
              <div style={{ fontWeight: 700 }}>{money(health.total_revenue_invoiced)}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: 12 }}>
                Avg. Rating
              </div>
              <div style={{ fontWeight: 700 }}>
                {health.average_feedback_rating ? `★ ${health.average_feedback_rating}` : '—'}
              </div>
            </div>
          </div>
          {health.is_expiring_soon && (
            <p className="text-danger" style={{ marginTop: 10 }}>
              ⚠ Expiring in {health.days_until_expiration} days
            </p>
          )}
        </div>
      )}

      {isStaff && contract.status !== 'CANCELLED' && (
        <div style={{ marginBottom: 20 }}>
          <ScheduleEditor contractId={contract.id} />
        </div>
      )}

      {confirmCancel && (
        <ConfirmDialog
          title="Cancel this contract?"
          danger
          confirmLabel="Cancel Contract"
          message="This will cancel the contract and remove any future scheduled jobs that haven't happened yet."
          onConfirm={() => {
            setConfirmCancel(false);
            cancel();
          }}
          onCancel={() => setConfirmCancel(false)}
        />
      )}
      {showRenew && (
        <Modal
          title="Renew Contract"
          onClose={() => setShowRenew(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowRenew(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={renew}>
                Renew
              </button>
            </>
          }
        >
          <p>
            This creates a new contract carrying over the same services, price, and schedule
            pattern, and marks this one expired.
          </p>
          <div className="field">
            <label>New end date (optional)</label>
            <input type="date" value={renewDate} onChange={(e) => setRenewDate(e.target.value)} />
          </div>
        </Modal>
      )}
    </div>
  );
}
