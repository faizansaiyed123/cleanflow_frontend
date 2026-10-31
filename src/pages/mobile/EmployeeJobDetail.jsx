import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import { dateTimeFmt } from '../../utils/format';

export default function EmployeeJobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [isProblem, setIsProblem] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const [pendingPhotoType, setPendingPhotoType] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const load = () => api.get(`/api/jobs/${id}`).then(setJob);
  useEffect(() => {
    load();
  }, [id]);

  const checkIn = async () => {
    try {
      let lat = null,
        lng = null;
      if (navigator.geolocation) {
        await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              lat = String(pos.coords.latitude);
              lng = String(pos.coords.longitude);
              resolve();
            },
            () => resolve(),
            { timeout: 2000 }
          );
        });
      }
      await api.post(`/api/jobs/${id}/check-in`, { lat, lng });
      toast.push('Checked in', 'success');
      load();
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  const checkOut = async () => {
    try {
      await api.post(`/api/jobs/${id}/check-out`);
      toast.push('Checked out', 'success');
      load();
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  const toggleItem = async (item) => {
    try {
      await api.patch(`/api/jobs/${id}/checklist/${item.id}`, { is_completed: !item.is_completed });
      load();
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  const triggerUpload = (photoType) => {
    setPendingPhotoType(photoType);
    fileRef.current.click();
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo_type', pendingPhotoType);
      formData.append('file', file);
      await api.postForm(`/api/jobs/${id}/photos`, formData);
      toast.push(`${pendingPhotoType} photo uploaded`, 'success');
      load();
    } catch (err) {
      toast.push(err.message, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    try {
      await api.post(`/api/jobs/${id}/notes`, { body: noteText, is_problem_report: isProblem });
      setNoteText('');
      setIsProblem(false);
      toast.push('Note added', 'success');
      load();
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  const complete = async () => {
    try {
      await api.post(`/api/jobs/${id}/complete`);
      toast.push('Job completed! Great work.', 'success');
      navigate('/app/mobile');
    } catch (err) {
      toast.push(err.message, 'error');
    }
  };

  if (!job) return <div>Loading…</div>;

  const hasBeforePhoto = job.photos.some((p) => p.photo_type === 'BEFORE');
  const hasAfterPhoto = job.photos.some((p) => p.photo_type === 'AFTER');
  const requiredIncomplete = job.checklist_items.filter(
    (i) => i.is_required && !i.is_completed
  ).length;

  return (
    <div style={{ paddingBottom: 40 }}>
      <Link to="/app/mobile" className="text-muted" style={{ fontSize: 13 }}>
        ← Today's Jobs
      </Link>
      <div style={{ margin: '8px 0 16px' }}>
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>{job.customer_name}</h1>
        <div className="text-muted" style={{ fontSize: 13.5 }}>
          {job.property_address}
        </div>
        <div style={{ marginTop: 6 }}>
          <StatusBadge status={job.status} />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13.5 }}>
          <strong>Scheduled:</strong> {dateTimeFmt(job.scheduled_start)}
        </div>
        <div style={{ fontSize: 13.5 }}>
          <strong>Check-in:</strong> {job.check_in_at ? dateTimeFmt(job.check_in_at) : 'Not yet'}
        </div>
        <div style={{ fontSize: 13.5 }}>
          <strong>Check-out:</strong> {job.check_out_at ? dateTimeFmt(job.check_out_at) : 'Not yet'}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {!job.check_in_at && (
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={checkIn}>
              Check In
            </button>
          )}
          {job.check_in_at && !job.check_out_at && (
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={checkOut}>
              Check Out
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 15 }}>Checklist</h3>
        {job.checklist_items.map((item) => (
          <div key={item.id} className="checklist-item">
            <input
              type="checkbox"
              checked={item.is_completed}
              disabled={job.status === 'COMPLETED'}
              onChange={() => toggleItem(item)}
            />
            <span>
              {item.label} {item.is_required && <span className="text-muted">(required)</span>}
            </span>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 15 }}>Proof of Service</h3>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileRef}
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            disabled={uploading || job.status === 'COMPLETED'}
            onClick={() => triggerUpload('BEFORE')}
          >
            {hasBeforePhoto ? '✓ Before Photo' : 'Add Before Photo'}
          </button>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            disabled={uploading || job.status === 'COMPLETED'}
            onClick={() => triggerUpload('AFTER')}
          >
            {hasAfterPhoto ? '✓ After Photo' : 'Add After Photo'}
          </button>
        </div>
        {job.photos.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {job.photos.map((p) => (
              <span key={p.id} className="badge badge-green">
                {p.photo_type}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 15 }}>Notes</h3>
        {job.job_notes.map((n) => (
          <p key={n.id} style={{ fontSize: 13.5 }}>
            {n.is_problem_report && '⚠️ '}
            {n.body}
          </p>
        ))}
        <textarea
          rows="2"
          placeholder="Add a note…"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <label
          style={{
            display: 'flex',
            gap: 6,
            alignItems: 'center',
            fontWeight: 400,
            marginBottom: 8,
          }}
        >
          <input
            type="checkbox"
            style={{ width: 'auto' }}
            checked={isProblem}
            onChange={(e) => setIsProblem(e.target.checked)}
          />{' '}
          Report a problem
        </label>
        <button className="btn btn-secondary" onClick={addNote}>
          Add Note
        </button>
      </div>

      {job.status !== 'COMPLETED' && (
        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: 14, fontSize: 16 }}
          onClick={complete}
        >
          Mark Job Complete
        </button>
      )}
      {job.status !== 'COMPLETED' &&
        (requiredIncomplete > 0 || !hasBeforePhoto || !hasAfterPhoto || !job.check_out_at) && (
          <p className="text-muted" style={{ fontSize: 12.5, textAlign: 'center', marginTop: 8 }}>
            Complete check-in/out, all required checklist items, and before/after photos to finish
            this job.
          </p>
        )}
    </div>
  );
}
