import { money } from '../utils/format';

export default function PricingBreakdown({ breakdown, total }) {
  if (!breakdown) return null;
  return (
    <div className="card" style={{ background: 'var(--moss-light)', border: '1px solid var(--moss)' }}>
      <div style={{ fontWeight: 700, marginBottom: 10, color: 'var(--moss-dark)' }}>Why this price?</div>
      {breakdown.line_items.map((li, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 14 }}>
          <span>{li.label}</span>
          <strong style={{ color: li.amount < 0 ? 'var(--moss-dark)' : 'var(--ink)' }}>
            {li.amount < 0 ? '-' : ''}{money(Math.abs(li.amount))}
          </strong>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTop: '1px solid var(--moss)', fontSize: 17 }}>
        <span>Total</span><strong>{money(total ?? breakdown.total)}</strong>
      </div>
    </div>
  );
}
