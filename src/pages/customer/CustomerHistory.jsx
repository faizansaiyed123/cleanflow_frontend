import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { BASE_URL } from '../../api/client';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { useToast } from '../../context/ToastContext';
import { dateTimeFmt } from '../../utils/format';

export default function CustomerHistory() {
  const [jobs, setJobs] = useState(null);
  const [selected, setSelected] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const toast = useToast();

  const load = () => api.get('/api/jobs', { status: 'COMPLETED', page_size: 100 }).then((d) => setJobs(d.items));
  useEffect(() => { load(); }, []);

  const openReport = async (jobSummary) => {
    const full = await api.get(`/api/jobs/${jobSummary.id}`);
    setSelected(full);
    setRating(5);
    setComment('');
  };

  const submitFeedback = async () => {
    try {
      await api.post(`/api/jobs/${selected.id}/feedback`, { rating, comment });
      toast.push('Thanks for your feedback!', 'success');
      setSelected(null);
    } catch (err) { toast.push(err.message, 'error'); }
  };

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Service History</h1>
      {jobs === null ? <div>Loading…</div> : jobs.length === 0 ? <EmptyState title="No completed services yet" /> : (
        <div className="grid grid-2">
          {jobs.map((j) => (
            <div key={j.id} className="card card-hover" style={{ cursor: 'pointer' }} onClick={() => openReport(j)}>
              <strong className="mono">{j.reference_number}</strong>
              <div className="text-muted" style={{ fontSize: 13 }}>{dateTimeFmt(j.scheduled_start)}</div>
              <div className="text-muted" style={{ fontSize: 13 }}>{j.property_label}</div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <Modal title={`Service Report — ${selected.reference_number}`} onClose={() => setSelected(null)}>
          <p><strong>Completed:</strong> {dateTimeFmt(selected.completed_at)}</p>
          <p><strong>Employee(s):</strong> {selected.assignments.map((a) => a.employee_name).join(', ') || '—'}</p>
          <div style={{ margin: '12px 0' }}>
            <strong>Checklist</strong>
            {selected.checklist_items.map((i) => (
              <div key={i.id} style={{ fontSize: 13.5 }}>{i.is_completed ? '✅' : '⬜'} {i.label}</div>
            ))}
          </div>
          {selected.photos.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <strong>Photos</strong>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                {selected.photos.map((p) => (
                  <div key={p.id} style={{ textAlign: 'center' }}>
                    <img src={`${BASE_URL}/api/files/job-photos/${p.id}`} alt={p.photo_type}
                      style={{ width: 110, height: 82, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--line)' }}
                      onError={(e) => { e.target.style.opacity = 0.3; }} />
                    <div style={{ fontSize: 11 }}>{p.photo_type}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, marginTop: 12 }}>
            <strong>Leave feedback</strong>
            <div style={{ margin: '8px 0' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} style={{ cursor: 'pointer', fontSize: 22, color: n <= rating ? '#b6902c' : '#ddd' }} onClick={() => setRating(n)}>★</span>
              ))}
            </div>
            <textarea rows="2" placeholder="Optional comment…" value={comment} onChange={(e) => setComment(e.target.value)} style={{ marginBottom: 8 }} />
            <button className="btn btn-primary" onClick={submitFeedback}>Submit Feedback</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
