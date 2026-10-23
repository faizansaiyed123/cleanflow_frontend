import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import { dateTimeFmt } from '../../utils/format';

const STATUSES = ['SCHEDULED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];

export default function JobsList() {
  const [data, setData] = useState(null);
  const [statusFilter, setStatusFilter] = useState(() => localStorage.getItem('cf_jobs_status') || '');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [bulkEmployeeIds, setBulkEmployeeIds] = useState([]);
  const navigate = useNavigate();
  const toast = useToast();

  const load = () => api.get('/api/jobs', { status: statusFilter || undefined, page, page_size: 20 }).then(setData);
  useEffect(() => { load(); }, [statusFilter, page]);
  useEffect(() => { localStorage.setItem('cf_jobs_status', statusFilter); }, [statusFilter]);

  const toggleSelect = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  const openBulkAssign = async () => {
    const emps = await api.get('/api/employees');
    setEmployees(emps);
    setBulkEmployeeIds([]);
    setShowBulkAssign(true);
  };

  const doBulkAssign = async () => {
    try {
      const result = await api.post('/api/jobs/bulk-assign', { job_ids: selected, employee_ids: bulkEmployeeIds });
      toast.push(`Assigned ${result.assigned.length} job(s)${result.failed.length ? `, ${result.failed.length} failed` : ''}`,
        result.failed.length ? 'error' : 'success');
      setShowBulkAssign(false);
      setSelected([]);
      load();
    } catch (err) { toast.push(err.message, 'error'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Jobs</h1>
        {selected.length > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="text-muted" style={{ fontSize: 13 }}>{selected.length} selected</span>
            <button className="btn btn-primary btn-sm" onClick={openBulkAssign}>Bulk Assign Employee</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected([])}>Clear</button>
          </div>
        )}
      </div>
      <div className="pill-nav" style={{ marginBottom: 16 }}>
        <button className={!statusFilter ? 'active' : ''} onClick={() => { setStatusFilter(''); setPage(1); }}>All</button>
        {STATUSES.map((s) => <button key={s} className={statusFilter === s ? 'active' : ''} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>)}
      </div>
      <div className="card" style={{ padding: 0 }}>
        {data === null ? <div style={{ padding: 20 }}>Loading…</div> : data.items.length === 0 ? (
          <EmptyState title="No jobs found" />
        ) : (
          <>
            <table>
              <thead><tr><th style={{ width: 30 }}></th><th>Reference</th><th>Customer</th><th>Property</th><th>Scheduled</th><th>Status</th></tr></thead>
              <tbody>
                {data.items.map((j) => (
                  <tr key={j.id} className="clickable">
                    <td onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.includes(j.id)} onChange={() => toggleSelect(j.id)} />
                    </td>
                    <td className="mono" onClick={() => navigate(`/app/jobs/${j.id}`)}>{j.reference_number}</td>
                    <td onClick={() => navigate(`/app/jobs/${j.id}`)}>{j.customer_name}</td>
                    <td onClick={() => navigate(`/app/jobs/${j.id}`)}>{j.property_label}</td>
                    <td onClick={() => navigate(`/app/jobs/${j.id}`)}>{dateTimeFmt(j.scheduled_start)}</td>
                    <td onClick={() => navigate(`/app/jobs/${j.id}`)}><StatusBadge status={j.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '0 12px' }}><Pagination page={data.page} pageSize={data.page_size} total={data.total} onPageChange={setPage} /></div>
          </>
        )}
      </div>
      {showBulkAssign && (
        <Modal title={`Bulk Assign — ${selected.length} job(s)`} onClose={() => setShowBulkAssign(false)} footer={
          <><button className="btn btn-secondary" onClick={() => setShowBulkAssign(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={doBulkAssign} disabled={bulkEmployeeIds.length === 0}>Assign</button></>
        }>
          {employees.map((e) => (
            <label key={e.id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 400, padding: '6px 0' }}>
              <input type="checkbox" style={{ width: 'auto' }} checked={bulkEmployeeIds.includes(e.id)}
                onChange={() => setBulkEmployeeIds((s) => s.includes(e.id) ? s.filter((x) => x !== e.id) : [...s, e.id])} />
              {e.full_name}
            </label>
          ))}
        </Modal>
      )}
    </div>
  );
}
