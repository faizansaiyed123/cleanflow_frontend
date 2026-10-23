import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { dateTimeFmt } from '../utils/format';

const TYPE_STYLE = {
  Lead: { icon: '◎', color: 'var(--gold)' },
  Quote: { icon: '✎', color: 'var(--clay)' },
  Contract: { icon: '▤', color: 'var(--moss)' },
  Job: { icon: '✓', color: 'var(--moss)' },
  Invoice: { icon: '$', color: 'var(--gold)' },
  Payment: { icon: '$', color: 'var(--moss)' },
  Feedback: { icon: '★', color: 'var(--gold)' },
};

export default function CustomerTimeline({ customerId }) {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    api.get(`/api/customers/${customerId}/timeline`).then(setEvents).catch(() => setEvents([]));
  }, [customerId]);

  if (events === null) return <div className="card">Loading timeline…</div>;
  if (events.length === 0) return null;

  return (
    <div className="card">
      <h3 style={{ fontSize: 15, marginBottom: 14 }}>Customer Service Timeline</h3>
      <div style={{ position: 'relative', paddingLeft: 22 }}>
        <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 2, background: 'var(--line)' }} />
        {events.map((e, i) => {
          const style = TYPE_STYLE[e.type] || { icon: '•', color: 'var(--ink-soft)' };
          return (
            <div key={i} style={{ position: 'relative', marginBottom: 16 }}>
              <div style={{
                position: 'absolute', left: -22, top: 1, width: 16, height: 16, borderRadius: '50%',
                background: style.color, color: 'white', fontSize: 9, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700,
              }}>{style.icon}</div>
              <div style={{ fontSize: 13.5 }}>{e.label}</div>
              <div className="text-muted" style={{ fontSize: 11.5 }}>{dateTimeFmt(e.at)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
