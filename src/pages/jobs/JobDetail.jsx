import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import { dateTimeFmt } from '../../utils/format';
import { BASE_URL as API_BASE } from '../../api/client';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [health, setHealth] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const load = () => {
    api.get(`/api/jobs/${id}`).then(setJob);
    api.get(`/api/jobs/${id}/health`).then(setHealth).catch(() => {});
  };
  useEffect(() => { load(); }, [id]);

  const openAssign = async () => {
    const [emps, sugg] = await Promise.all([
      api.get('/api/employees'), api.get(`/api/jobs/${id}/suggested-employees`).catch(() => []),
    ]);
    setEmployees(emps);
    setSuggested(sugg);
    setSelectedEmployees(job.assignments.map((a) => a.employee_id));
    setShowAssign(true);
  };

  const saveAssignment = async () => {
    try {
      await api.post(`/api/jobs/${id}/assign`, { employee_ids: selectedEmployees, expected_version: job.version });
      toast.push('Employees assigned', 'success');
      setShowAssign(false);
      load();
    } catch (err) {
      if (err.status === 409) { toast.push(`${err.message} Reloading the latest version…`, 'error'); load(); }
      else toast.push(err.message, 'error');
    }
  };

  const createInvoice = async () => {
    try {
      const inv = await api.post(`/api/invoices/from-job/${id}`, {});
      toast.push(`Invoice ${inv.reference_number} created`, 'success');
      navigate(`/app/invoices/${inv.id}`);
    } catch (err) { toast.push(err.message, 'error'); }
  };

  const cancelJob = async () => {
    try {
      await api.post(`/api/jobs/${id}/cancel`, { reason: 'Cancelled by staff', expected_version: job.version });
      toast.push('Job cancelled', 'success');
      setConfirmCancel(false);
      load();
    } catch (err) {
      setConfirmCancel(false);
      if (err.status === 409) { toast.push(`${err.message} Reloading the latest version…`, 'error'); load(); }
      else toast.push(err.message, 'error');
    }
  };

  if (!job) return <div>Loading…</div>;

  return (
    <div>
      <Link to="/app/jobs" className="text-muted" style={{ fontSize: 13 }}>← Back to Jobs</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '8px 0 20px' }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Job {job.reference_number}</h1>
          <StatusBadge status={job.status} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {job.status !== 'COMPLETED' && job.status !== 'CANCELLED' && (
            <button className="btn btn-secondary" onClick={openAssign}>Assign Employees</button>
          )}
          {job.status !== 'COMPLETED' && job.status !== 'CANCELLED' && (
            <button className="btn btn-danger" onClick={() => setConfirmCancel(true)}>Cancel Job</button>
          )}
          {job.status === 'COMPLETED' && <button className="btn btn-primary" onClick={createInvoice}>Create Invoice</button>}
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15 }}>Job Details</h3>
          <p><strong>Customer:</strong> {job.customer_name}</p>
          <p><strong>Property:</strong> {job.property_label} — {job.property_address}</p>
          <p><strong>Scheduled:</strong> {dateTimeFmt(job.scheduled_start)} – {dateTimeFmt(job.scheduled_end)}</p>
          <p><strong>Check-in:</strong> {job.check_in_at ? dateTimeFmt(job.check_in_at) : '—'}</p>
          <p><strong>Check-out:</strong> {job.check_out_at ? dateTimeFmt(job.check_out_at) : '—'}</p>
          <p><strong>Assigned:</strong> {job.assignments.length ? job.assignments.map((a) => a.employee_name).join(', ') : 'Unassigned'}</p>
        </div>
        {health && (
          <div className="card">
            <h3 style={{ fontSize: 15 }}>Job Health</h3>
            {Object.entries(health.steps).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13.5 }}>
                <span style={{ textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                <span>{v ? '✅' : '⬜'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15 }}>Checklist</h3>
        {job.checklist_items.map((item) => (
          <div key={item.id} className="checklist-item">
            <input type="checkbox" checked={item.is_completed} disabled style={{ marginTop: 0 }} />
            <span>{item.label} {item.is_required && <span className="text-muted">(required)</span>}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 15 }}>Proof of Service</h3>
        {job.photos.length === 0 ? <p className="text-muted">No photos uploaded yet.</p> : (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {job.photos.map((p) => (
              <div key={p.id} style={{ textAlign: 'center' }}>
                <img src={`${API_BASE}/api/files/job-photos/${p.id}`} alt={p.photo_type}
                  style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--line)' }}
                  onError={(e) => { e.target.style.opacity = 0.3; }} />
                <div style={{ fontSize: 11, marginTop: 2 }}>{p.photo_type}</div>
              </div>
            ))}
          </div>
        )}
        {job.job_notes.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <strong style={{ fontSize: 13 }}>Notes</strong>
            {job.job_notes.map((n) => (
              <p key={n.id} style={{ fontSize: 13.5, margin: '4px 0' }}>{n.is_problem_report && '⚠️ '}{n.body}</p>
            ))}
          </div>
        )}
      </div>

      {showAssign && (
        <Modal title="Assign Employees" onClose={() => setShowAssign(false)} footer={
          <><button className="btn btn-secondary" onClick={() => setShowAssign(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveAssignment}>Save</button></>
        }>
          {suggested.length > 0 && (
            <p className="text-muted" style={{ fontSize: 12.5 }}>
              Suggested (no conflicts, lowest workload): {suggested.map((s) => s.employee_name).join(', ')}
            </p>
          )}
          {employees.map((e) => (
            <label key={e.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 400, padding: '6px 0' }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={selectedEmployees.includes(e.id)}
                onChange={() => setSelectedEmployees((s) => s.includes(e.id) ? s.filter((x) => x !== e.id) : [...s, e.id])} />
              {e.full_name} <span className="text-muted">({e.skills.join(', ') || 'no listed skills'})</span>
            </label>
          ))}
        </Modal>
      )}
      {confirmCancel && (
        <ConfirmDialog title="Cancel this job?" danger confirmLabel="Cancel Job"
          message="This job will be marked cancelled and removed from the active schedule."
          onConfirm={cancelJob} onCancel={() => setConfirmCancel(false)} />
      )}
    </div>
  );
}
