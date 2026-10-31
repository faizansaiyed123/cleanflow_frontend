import { Link } from 'react-router-dom';

const SERVICES = [
  {
    title: 'Commercial Office Cleaning',
    desc: 'Recurring cleaning built around your business hours, with a verifiable checklist every visit.',
  },
  {
    title: 'Medical-Grade Disinfection',
    desc: 'Enhanced protocols for medical and dental offices, with documented compliance.',
  },
  {
    title: 'Retail & Restaurant Cleaning',
    desc: 'Before-open or after-close service that keeps customer-facing spaces spotless.',
  },
];

export default function Home() {
  return (
    <div>
      <section
        style={{
          padding: '80px 40px 60px',
          background: 'linear-gradient(180deg, #eef4ee, var(--paper))',
        }}
      >
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center' }}>
          <span className="badge badge-green" style={{ marginBottom: 16 }}>
            Commercial Cleaning, Run Like a Real Operation
          </span>
          <h1 style={{ fontSize: 46, lineHeight: 1.15, margin: '0 0 18px' }}>
            Cleaning you can actually verify — not just trust
          </h1>
          <p style={{ fontSize: 17, maxWidth: 560, margin: '0 auto 28px' }}>
            Transparent, itemized pricing. Reliable recurring scheduling. Every job documented with
            before/after photos and a completed checklist — visible in your own portal.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link to="/request-quote" className="btn btn-primary">
              Request a Free Quote
            </Link>
            <Link to="/services" className="btn btn-secondary">
              See Our Services
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 32 }}>What we clean</h2>
        <div className="grid grid-3">
          {SERVICES.map((s) => (
            <div className="card card-hover" key={s.title}>
              <h3 style={{ fontSize: 18 }}>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '60px 40px', background: 'var(--moss-light)' }}>
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            display: 'flex',
            gap: 40,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 280 }}>
            <h2>"Why this price?" — every quote, explained</h2>
            <p>
              No black-box estimates. Every quote shows exactly how we got to your number: base
              rate, square footage, bathrooms, floors, frequency discount, add-ons, and supplies —
              line by line.
            </p>
          </div>
          <div className="card" style={{ flex: 1, minWidth: 280 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <span>Base service</span>
              <strong>$100.00</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <span>Square footage (3,000 sq ft)</span>
              <strong>$150.00</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <span>Bathrooms (3)</span>
              <strong>$60.00</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <span>Frequency adjustment (Weekly)</span>
              <strong style={{ color: 'var(--moss-dark)' }}>-$39.00</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0 0',
                fontSize: 18,
              }}
            >
              <span>Total</span>
              <strong>$341.00</strong>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: '60px 40px', textAlign: 'center' }}>
        <h2>Ready to see your number?</h2>
        <p style={{ maxWidth: 480, margin: '0 auto 20px' }}>
          Tell us about your space. We'll generate a transparent, itemized quote — usually within
          one business day.
        </p>
        <Link to="/request-quote" className="btn btn-primary">
          Request a Free Quote
        </Link>
      </section>
    </div>
  );
}
