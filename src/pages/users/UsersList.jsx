import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import EmptyState from '../../components/EmptyState';

const ROLES = ['OWNER', 'MANAGER', 'EMPLOYEE'];

export default function UsersList() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [employees, setEmployees] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'MANAGER', employee_id: '' });
  const toast = useToast();

  const load = () => api.get('/api/users', { page, page_size: 25 }).then(setData);
  useEffect(() => { load(); }, [page]);
  useEffect(() => { api.get('/api/employees').then(setEmployees); }, []);

  const create = async () => {
    try {
      await api.post('/api/users', {
        email: form.email, password: form.password, full_name: form.full_name, role: form.role,
        employee_id: form.role === 'EMPLOYEE' ? (form.employee_id || null) : null,
      });
      toast.push('User account created', 'success');
      setShowNew(false);
      setForm({ email: '', password: '', full_name: '', role: 'MANAGER', employee_id: '' });
      load();
    } catch (err) { toast.push(err.message, 'error'); }
  };

  const deactivate = async (id) => {
    try {
      await api.post(`/api/users/${id}/deactivate`);
      toast.push('User deactivated', 'success');
      setConfirmDeactivate(null);
      load();
    } catch (err) { toast.push(err.message, 'error'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Team Accounts</h1>
        <button className="btn btn-primary" onClick={() => setShowNew(true)}>+ New Account</button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        {data === null ? <div style={{ padding: 20 }}>Loading…</div> : data.items.length === 0 ? <EmptyState title="No accounts" /> : (
          <>
            <table>
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td><td>{u.email}</td>
                    <td><span className="badge badge-gray">{u.role}</span></td>
                    <td>{u.is_active ? <span className="badge badge-green">ACTIVE</span> : <span className="badge badge-red">DEACTIVATED</span>}</td>
                    <td>{u.is_active && <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDeactivate(u)}>Deactivate</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '0 12px' }}><Pagination page={data.page} pageSize={data.page_size} total={data.total} onPageChange={setPage} /></div>
          </>
        )}
      </div>
      {showNew && (
        <Modal title="New Team Account" onClose={() => setShowNew(false)} footer={
          <><button className="btn btn-secondary" onClick={() => setShowNew(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={create}>Create Account</button></>
        }>
          <div className="field"><label>Full name</label><input value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} /></div>
          <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
          <div className="field"><label>Temporary password</label><input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></div>
          <div className="field"><label>Role</label>
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          {form.role === 'EMPLOYEE' && (
            <div className="field"><label>Link to employee profile</label>
              <select value={form.employee_id} onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}>
                <option value="">Select employee…</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
              </select>
            </div>
          )}
        </Modal>
      )}
      {confirmDeactivate && (
        <ConfirmDialog title="Deactivate this account?" danger confirmLabel="Deactivate"
          message={`${confirmDeactivate.full_name} will no longer be able to log in.`}
          onConfirm={() => deactivate(confirmDeactivate.id)} onCancel={() => setConfirmDeactivate(null)} />
      )}
    </div>
  );
}
