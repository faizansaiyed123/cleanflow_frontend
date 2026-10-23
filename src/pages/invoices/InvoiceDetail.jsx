import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { dateFmt, money } from '../../utils/format';

const METHODS = ['CASH', 'CHECK', 'CREDIT_CARD', 'ACH', 'OTHER'];

export default function InvoiceDetail() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [confirmVoid, setConfirmVoid] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', method: 'CASH', reference: '' });
  const [paymentIdemKey, setPaymentIdemKey] = useState(null);
  const { user } = useAuth();
  const toast = useToast();
  const isStaff = user.role === 'OWNER' || user.role === 'MANAGER';

  const load = () => {
    api.get(`/api/invoices/${id}`).then((inv) => { setInvoice(inv); setPayForm((f) => ({ ...f, amount: inv.balance_due })); });
    api.get(`/api/invoices/${id}/payments`).then(setPayments);
  };
  useEffect(() => { load(); }, [id]);

  const send = async () => { await api.post(`/api/invoices/${id}/send`); toast.push('Invoice sent', 'success'); load(); };
  const voidInvoice = async () => {
    try { await api.post(`/api/invoices/${id}/void`); toast.push('Invoice voided', 'success'); load(); }
    catch (err) { toast.push(err.message, 'error'); }
  };
  const downloadPdf = () => api.openInNewTab(`/api/invoices/${id}/pdf`);
  const recordPayment = async () => {
    try {
      await api.post(
        `/api/invoices/${id}/payments`,
        { amount: Number(payForm.amount), method: payForm.method, reference: payForm.reference || null },
        { idempotencyKey: paymentIdemKey },
      );
      toast.push('Payment recorded', 'success');
      setShowPayment(false);
      setPaymentIdemKey(null);
      load();
    } catch (err) { toast.push(err.message, 'error'); }
  };

  if (!invoice) return <div>Loading…</div>;

  return (
    <div>
      {isStaff && <Link to="/app/invoices" className="text-muted" style={{ fontSize: 13 }}>← Back to Invoices</Link>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '8px 0 20px' }}>
        <div><h1 style={{ marginBottom: 4 }}>Invoice {invoice.reference_number}</h1><StatusBadge status={invoice.status} /></div>
        {isStaff && (
          <div style={{ display: 'flex', gap: 8 }}>
            {invoice.status === 'DRAFT' && <button className="btn btn-secondary" onClick={send}>Send to Customer</button>}
            <button className="btn btn-secondary" onClick={downloadPdf}>Download PDF</button>
            {invoice.balance_due > 0 && invoice.status !== 'DRAFT' && invoice.status !== 'VOID' && (
              <button className="btn btn-primary" onClick={() => { setPaymentIdemKey(crypto.randomUUID()); setShowPayment(true); }}>Record Payment</button>
            )}
            {invoice.status !== 'VOID' && invoice.amount_paid === 0 && (
              <button className="btn btn-danger" onClick={() => setConfirmVoid(true)}>Void</button>
            )}
          </div>
        )}
        {!isStaff && (
          <button className="btn btn-secondary" onClick={downloadPdf}>Download PDF</button>
        )}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15 }}>Line Items</h3>
          {invoice.items.map((it) => (
            <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
              <span>{it.description}</span><strong>{money(it.amount)}</strong>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', marginTop: 6 }}><span>Subtotal</span><span>{money(invoice.subtotal)}</span></div>
          {invoice.discount_amount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Discount</span><span>-{money(invoice.discount_amount)}</span></div>}
          {invoice.tax_amount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span>Tax</span><span>{money(invoice.tax_amount)}</span></div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: '1px solid var(--line)', fontSize: 18 }}><span>Total</span><strong>{money(invoice.total)}</strong></div>
          <p style={{ marginTop: 10 }}><strong>Due:</strong> {dateFmt(invoice.due_date)}</p>
          <p><strong>Balance due:</strong> {money(invoice.balance_due)}</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15 }}>Payment History</h3>
          {payments.length === 0 ? <p className="text-muted">No payments recorded yet.</p> : payments.map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
              <span>{p.method} {p.reference && `(${p.reference})`} · {dateFmt(p.paid_at)}</span><strong>{money(p.amount)}</strong>
            </div>
          ))}
        </div>
      </div>

      {showPayment && (
        <Modal title="Record Payment" onClose={() => setShowPayment(false)} footer={
          <><button className="btn btn-secondary" onClick={() => setShowPayment(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={recordPayment}>Record Payment</button></>
        }>
          <div className="field"><label>Amount</label><input type="number" step="0.01" value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} /></div>
          <div className="field"><label>Method</label>
            <select value={payForm.method} onChange={(e) => setPayForm((f) => ({ ...f, method: e.target.value }))}>
              {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="field"><label>Reference (optional)</label><input value={payForm.reference} onChange={(e) => setPayForm((f) => ({ ...f, reference: e.target.value }))} /></div>
          <p className="text-muted" style={{ fontSize: 12.5 }}>Balance due: {money(invoice.balance_due)}. Partial payments are supported.</p>
        </Modal>
      )}
      {confirmVoid && (
        <ConfirmDialog title="Void this invoice?" danger confirmLabel="Void Invoice"
          message="Voided invoices are excluded from outstanding-balance totals and can no longer be sent or paid."
          onConfirm={() => { setConfirmVoid(false); voidInvoice(); }} onCancel={() => setConfirmVoid(false)} />
      )}
    </div>
  );
}
