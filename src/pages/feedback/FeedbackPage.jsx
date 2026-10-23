import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function FeedbackPage() {
  const [summary, setSummary] = useState(null);
  useEffect(() => { api.get('/api/feedback').then(setSummary); }, []);
  if (!summary) return <div>Loading…</div>;

  return (
    <div>
      <h1 style={{ marginBottom: 16 }}>Customer Feedback</h1>
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="card stat-card"><span className="label">Average Rating</span><span className="value">{summary.average_rating ? `★ ${summary.average_rating}` : '—'}</span></div>
        <div className="card stat-card"><span className="label">Total Reviews</span><span className="value">{summary.review_count}</span></div>
        <div className="card stat-card"><span className="label">Response Rate</span><span className="value">{summary.response_rate_percent}%</span></div>
      </div>
      <div className="card">
        <h3 style={{ fontSize: 15 }}>Recent Feedback</h3>
        {summary.recent.length === 0 ? <p className="text-muted">No feedback submitted yet.</p> : summary.recent.map((f) => (
          <div key={f.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <div>{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</div>
            <p style={{ margin: '4px 0 0' }}>{f.comment || <span className="text-muted">No comment</span>}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
