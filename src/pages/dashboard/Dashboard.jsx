import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { api } from '../../api/client';
import { money, dateFmt } from '../../utils/format';
import Skeleton from '../../components/Skeleton';

const PIE_COLORS = { PENDING: '#b6902c', ACTIVE: '#2f6b52', PAUSED: '#c1622e', EXPIRED: '#999', CANCELLED: '#b93c3c' };

function StatCard({ label, value, sub }) {
  return (
    <div className="card stat-card">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
      {sub && <span className="sub">{sub}</span>}
    </div>
  );
}

function AttentionSection({ title, items, renderItem, viewAllTo }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ fontSize: 15 }}>{title} <span className="badge badge-red">{items.length}</span></h3>
        {viewAllTo && <Link to={viewAllTo} style={{ fontSize: 13 }}>View all →</Link>}
      </div>
      <div>{items.slice(0, 5).map(renderItem)}</div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [attention, setAttention] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [jobsTrend, setJobsTrend] = useState([]);
  const [leadTrend, setLeadTrend] = useState([]);
  const [contractBreakdown, setContractBreakdown] = useState([]);
  const [customerGrowth, setCustomerGrowth] = useState([]);

  useEffect(() => {
    api.get('/api/dashboard/summary').then(setSummary).catch(() => {});
    api.get('/api/dashboard/attention-required').then(setAttention).catch(() => {});
    api.get('/api/dashboard/revenue-trend', { months: 6 }).then(setRevenueTrend).catch(() => {});
    api.get('/api/dashboard/jobs-trend', { months: 6 }).then(setJobsTrend).catch(() => {});
    api.get('/api/dashboard/lead-conversion-trend', { months: 6 }).then(setLeadTrend).catch(() => {});
    api.get('/api/dashboard/contract-status-breakdown').then(setContractBreakdown).catch(() => {});
    api.get('/api/dashboard/customer-growth', { months: 6 }).then(setCustomerGrowth).catch(() => {});
  }, []);

  const hasAttention = attention && Object.values(attention).some((v) => v.length > 0);

  return (
    <div>
      <h1 style={{ marginBottom: 20 }}>Dashboard</h1>

      {!summary ? (
        <div className="grid grid-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} height={90} />)}</div>
      ) : (
        <div className="grid grid-4" style={{ marginBottom: 28 }}>
          <StatCard label="Monthly Revenue" value={money(summary.monthly_revenue)} />
          <StatCard label="Active Contracts" value={summary.active_contracts} />
          <StatCard label="Upcoming Jobs (7d)" value={summary.upcoming_jobs_next_7_days} />
          <StatCard label="Completed This Month" value={summary.completed_jobs_this_month} />
          <StatCard label="Outstanding Invoices" value={money(summary.outstanding_invoice_total)} />
          <StatCard label="Overdue Invoices" value={summary.overdue_invoice_count} sub={money(summary.overdue_invoice_total)} />
          <StatCard label="New Leads" value={summary.new_leads_this_month} sub="this month" />
          <StatCard label="Quote Conversion" value={`${summary.quote_conversion_rate_percent}%`}
            sub={summary.average_rating ? `★ ${summary.average_rating} avg rating` : undefined} />
        </div>
      )}

      <div className="grid grid-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Revenue Trend</h3>
          {revenueTrend.length === 0 ? <Skeleton height={200} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e0d4" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v) => money(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#2f6b52" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Jobs Completed vs Cancelled/No-show</h3>
          {jobsTrend.length === 0 ? <Skeleton height={200} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={jobsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e0d4" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="completed" fill="#2f6b52" name="Completed" />
                <Bar dataKey="cancelled_or_no_show" fill="#b93c3c" name="Cancelled/No-show" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Lead Conversion</h3>
          {leadTrend.length === 0 ? <Skeleton height={180} /> : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={leadTrend}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="new_leads" fill="#b6902c" name="New Leads" />
                <Bar dataKey="won" fill="#2f6b52" name="Won" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Contract Status</h3>
          {contractBreakdown.length === 0 ? <Skeleton height={180} /> : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={contractBreakdown.filter((c) => c.count > 0)} dataKey="count" nameKey="status" outerRadius={65} label={{ fontSize: 10 }}>
                  {contractBreakdown.map((c) => <Cell key={c.status} fill={PIE_COLORS[c.status] || '#999'} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Customer Growth</h3>
          {customerGrowth.length === 0 ? <Skeleton height={180} /> : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={customerGrowth}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="total_customers" stroke="#2f6b52" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 15, marginBottom: 12 }}>Attention Required</h3>
        {!attention ? <Skeleton height={200} /> : !hasAttention ? (
          <div className="card text-muted" style={{ textAlign: 'center' }}>All clear — nothing needs attention right now.</div>
        ) : (
          <div className="grid grid-2">
            <div>
              <AttentionSection title="Unassigned Jobs" items={attention.unassigned_jobs} viewAllTo="/app/jobs"
                renderItem={(j) => <div key={j.id} style={{ fontSize: 13, padding: '4px 0' }}>{j.reference_number} — {j.customer_name} · {dateFmt(j.scheduled_start)}</div>} />
              <AttentionSection title="Overdue Invoices" items={attention.overdue_invoices} viewAllTo="/app/invoices"
                renderItem={(i) => <div key={i.id} style={{ fontSize: 13, padding: '4px 0' }}>{i.reference_number} — {money(i.balance_due)} due</div>} />
              <AttentionSection title="Quotes Expiring Soon" items={attention.quotes_expiring_soon} viewAllTo="/app/quotes"
                renderItem={(q) => <div key={q.id} style={{ fontSize: 13, padding: '4px 0' }}>{q.reference_number} — expires {dateFmt(q.valid_until)}</div>} />
            </div>
            <div>
              <AttentionSection title="Contracts Expiring Soon" items={attention.contracts_expiring_soon} viewAllTo="/app/contracts"
                renderItem={(c) => <div key={c.id} style={{ fontSize: 13, padding: '4px 0' }}>{c.reference_number} — ends {dateFmt(c.end_date)}</div>} />
              <AttentionSection title="Jobs Missing Proof" items={attention.jobs_missing_proof} viewAllTo="/app/jobs"
                renderItem={(j) => <div key={j.id} style={{ fontSize: 13, padding: '4px 0' }}>{j.reference_number} — {j.customer_name}</div>} />
              <AttentionSection title="No-show Jobs" items={attention.no_show_jobs} viewAllTo="/app/jobs"
                renderItem={(j) => <div key={j.id} style={{ fontSize: 13, padding: '4px 0' }}>{j.reference_number} — {j.customer_name}</div>} />
              <AttentionSection title="Recent Low Ratings" items={attention.recent_low_ratings} viewAllTo="/app/feedback"
                renderItem={(f) => <div key={f.id} style={{ fontSize: 13, padding: '4px 0' }}>★ {f.rating} — {f.comment || 'No comment'}</div>} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
