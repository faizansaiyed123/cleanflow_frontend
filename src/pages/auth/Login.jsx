import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DEMO_ACCOUNTS = [
  { role: 'Owner', email: 'owner@cleanflow.demo' },
  { role: 'Manager', email: 'manager@cleanflow.demo' },
  { role: 'Employee', email: 'employee@cleanflow.demo' },
  { role: 'Customer', email: 'customer@cleanflow.demo' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Demo1234!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const resp = await login(email, password);
      toast.push(`Welcome back!`, 'success');
      if (resp.role === 'EMPLOYEE') navigate('/app/mobile');
      else if (resp.role === 'CUSTOMER') navigate('/app/portal');
      else navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--paper)',
      }}
    >
      <div style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Link
            to="/"
            style={{
              fontFamily: "'Source Serif 4', serif",
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--moss-dark)',
            }}
          >
            CleanFlow
          </Link>
          <p style={{ marginTop: 4 }}>Sign in to your operations dashboard</p>
        </div>
        <form className="card" onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-danger" style={{ fontSize: 13.5 }}>
              {error}
            </p>
          )}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="card" style={{ marginTop: 16, fontSize: 13 }}>
          <strong>Demo accounts</strong> <span className="text-muted">(password: Demo1234!)</span>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'space-between' }}
                onClick={() => {
                  setEmail(a.email);
                  setPassword('Demo1234!');
                }}
              >
                <span>{a.role}</span>
                <span className="text-muted">{a.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
