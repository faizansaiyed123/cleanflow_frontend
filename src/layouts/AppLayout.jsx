import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import NotificationBell from '../components/NotificationBell';

const NAV_BY_ROLE = {
  OWNER: [
    { to: '/app/dashboard', label: 'Dashboard', icon: '◆' },
    { to: '/app/leads', label: 'Leads', icon: '◎' },
    { to: '/app/quotes', label: 'Quotes', icon: '✎' },
    { to: '/app/contracts', label: 'Contracts', icon: '▤' },
    { to: '/app/calendar', label: 'Calendar', icon: '▦' },
    { to: '/app/jobs', label: 'Jobs', icon: '✓' },
    { to: '/app/customers', label: 'Customers', icon: '☺' },
    { to: '/app/employees', label: 'Employees', icon: '☺' },
    { to: '/app/invoices', label: 'Invoices', icon: '$' },
    { to: '/app/feedback', label: 'Feedback', icon: '★' },
    { to: '/app/analytics', label: 'Analytics', icon: '▲' },
    { to: '/app/audit', label: 'Audit Log', icon: '≡' },
    { to: '/app/users', label: 'Team Accounts', icon: '☺' },
    { to: '/app/settings', label: 'Settings', icon: '⚙' },
  ],
  MANAGER: [
    { to: '/app/dashboard', label: 'Dashboard', icon: '◆' },
    { to: '/app/leads', label: 'Leads', icon: '◎' },
    { to: '/app/quotes', label: 'Quotes', icon: '✎' },
    { to: '/app/contracts', label: 'Contracts', icon: '▤' },
    { to: '/app/calendar', label: 'Calendar', icon: '▦' },
    { to: '/app/jobs', label: 'Jobs', icon: '✓' },
    { to: '/app/customers', label: 'Customers', icon: '☺' },
    { to: '/app/employees', label: 'Employees', icon: '☺' },
    { to: '/app/invoices', label: 'Invoices', icon: '$' },
    { to: '/app/feedback', label: 'Feedback', icon: '★' },
  ],
  EMPLOYEE: [
    { to: '/app/mobile', label: "Today's Jobs", icon: '✓' },
  ],
  CUSTOMER: [
    { to: '/app/portal', label: 'Dashboard', icon: '◆' },
    { to: '/app/portal/quotes', label: 'Quotes', icon: '✎' },
    { to: '/app/portal/contracts', label: 'Contracts', icon: '▤' },
    { to: '/app/portal/schedule', label: 'Schedule', icon: '▦' },
    { to: '/app/portal/history', label: 'Service History', icon: '✓' },
    { to: '/app/portal/invoices', label: 'Invoices', icon: '$' },
  ],
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    function handleKeydown(e) {
      const tag = document.activeElement?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  const doSearch = useCallback(async (q) => {
    if (q.trim().length < 2) { setResults([]); return; }
    try {
      const r = await api.get('/api/search', { q });
      setResults(r);
    } catch { setResults([]); }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearch(query), 250);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  if (!user) return null;
  const nav = NAV_BY_ROLE[user.role] || [];

  const goToResult = (r) => {
    setShowResults(false);
    setQuery('');
    const map = {
      Customer: `/app/customers/${r.id}`, Lead: `/app/leads/${r.id}`, Quote: `/app/quotes/${r.id}`,
      Contract: `/app/contracts/${r.id}`, Job: `/app/jobs/${r.id}`, Invoice: `/app/invoices/${r.id}`,
      Employee: `/app/employees/${r.id}`,
    };
    if (map[r.type]) navigate(map[r.type]);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div className={`cf-sidebar-backdrop ${mobileNavOpen ? 'open' : ''}`} onClick={() => setMobileNavOpen(false)} />
      <aside className={`cf-sidebar ${mobileNavOpen ? 'open' : ''}`} style={{
        width: 220, background: 'var(--moss-dark)', color: '#eef4f0', padding: '20px 14px',
        display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
      }}>
        <div style={{ padding: '0 8px 20px', fontFamily: "'Source Serif 4', serif", fontSize: 21, fontWeight: 700, color: 'white' }}>
          CleanFlow
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/app/dashboard' || item.to === '/app/portal'}
              onClick={() => setMobileNavOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8,
                color: isActive ? 'white' : '#c9dcd1', background: isActive ? 'rgba(255,255,255,.12)' : 'transparent',
                fontSize: 14, fontWeight: 600, textDecoration: 'none',
              })}>
              <span style={{ width: 16, textAlign: 'center', opacity: .85 }}>{item.icon}</span>{item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.15)', paddingTop: 14, fontSize: 13 }}>
          <div style={{ color: 'white', fontWeight: 600 }}>{user.full_name}</div>
          <div style={{ color: '#a9c4b7', marginBottom: 10 }}>{user.role}</div>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.12)', color: 'white', width: '100%' }}
            onClick={() => { logout(); navigate('/'); }}>Sign out</button>
        </div>
      </aside>
      <main style={{ flex: 1, minWidth: 0 }}>
        {user.role !== 'EMPLOYEE' && (
          <header style={{
            padding: '14px 28px', borderBottom: '1px solid var(--line)', background: 'var(--surface)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, position: 'relative',
          }}>
            <button className="cf-hamburger btn btn-ghost btn-sm" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">☰</button>
            <div style={{ flex: 1 }} />
            <div style={{ position: 'relative', width: 320 }} className="cf-search-box">
              <input id="global-search-input" placeholder="Search customers, jobs, invoices… ( / )" value={query}
                onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)} onBlur={() => setTimeout(() => setShowResults(false), 150)} />
              {showResults && results.length > 0 && (
                <div className="card" style={{ position: 'absolute', top: 40, left: 0, right: 0, padding: 6, zIndex: 50 }}>
                  {results.map((r) => (
                    <div key={`${r.type}-${r.id}`} onMouseDown={() => goToResult(r)}
                      style={{ padding: '8px 10px', borderRadius: 6, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--moss-light)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <span>{r.label}</span>
                      <span className="badge badge-gray">{r.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <NotificationBell />
          </header>
        )}
        <div style={{ padding: user.role === 'EMPLOYEE' ? '16px' : '28px', maxWidth: 1280, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
