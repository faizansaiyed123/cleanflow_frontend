const COLOR_MAP = {
  // Leads
  NEW: 'gray', CONTACTED: 'gold', QUALIFIED: 'green', QUOTED: 'green', WON: 'green', LOST: 'red',
  // Quotes
  DRAFT: 'gray', SENT: 'gold', VIEWED: 'gold', ACCEPTED: 'green', REJECTED: 'red', EXPIRED: 'red',
  // Contracts
  PENDING: 'gold', ACTIVE: 'green', PAUSED: 'gold', CANCELLED: 'red',
  // Jobs
  SCHEDULED: 'gray', ASSIGNED: 'gold', IN_PROGRESS: 'green', COMPLETED: 'green', NO_SHOW: 'red',
  // Invoices
  PARTIALLY_PAID: 'gold', PAID: 'green', OVERDUE: 'red', VOID: 'gray',
};

export default function StatusBadge({ status }) {
  const color = COLOR_MAP[status] || 'gray';
  return <span className={`badge badge-${color}`}>{String(status).replace(/_/g, ' ')}</span>;
}
