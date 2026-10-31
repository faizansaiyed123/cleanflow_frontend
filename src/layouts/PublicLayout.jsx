import { Link, Outlet, useLocation } from 'react-router-dom';

const LINKS = [
  { to: '/services', label: 'Services' },
  { to: '/commercial-cleaning', label: 'Commercial' },
  { to: '/residential-cleaning', label: 'Residential' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/service-areas', label: 'Service Areas' },
  { to: '/about', label: 'About' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export default function PublicLayout() {
  const location = useLocation();
  return (
    <div>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 40px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--surface)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "'Source Serif 4', serif",
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--moss-dark)',
          }}
        >
          CleanFlow
        </Link>
        <nav
          style={{
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: location.pathname === l.to ? 'var(--moss-dark)' : 'var(--ink-soft)',
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/login" className="btn btn-secondary btn-sm">
            Sign in
          </Link>
          <Link to="/request-quote" className="btn btn-primary btn-sm">
            Request a Quote
          </Link>
        </nav>
      </header>
      <Outlet />
      <footer
        style={{ background: 'var(--moss-dark)', color: '#cfe0d7', padding: '40px', marginTop: 60 }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 24,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: 20,
                color: 'white',
                marginBottom: 8,
              }}
            >
              CleanFlow
            </div>
            <p style={{ color: '#a9c4b7', maxWidth: 280 }}>
              Commercial cleaning, run like a real operation — quoted transparently, scheduled
              reliably, proven with photo evidence.
            </p>
          </div>
          <div style={{ fontSize: 13.5, color: '#a9c4b7' }}>
            <div>(555) 010-2020</div>
            <div>hello@cleanflowdemo.com</div>
            <div>500 Industrial Pkwy, Austin, TX</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
