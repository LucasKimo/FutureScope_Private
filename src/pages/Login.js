import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { readAllGoals } from '../services/persist';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, loading, token } = useAuth();

  const [mode, setMode] = useState('login'); // login | register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const fromPath = useMemo(() => {
    const from = location.state?.from;
    return typeof from === 'string' && from.startsWith('/') ? from : '';
  }, [location.state]);

  const resolveNextPath = useCallback(() => {
    if (fromPath) return fromPath;

    const goals = readAllGoals();
    const hasAnyGoal = goals.some((g) => Boolean(g?.goal) && Boolean(g?.roadmap));
    return hasAnyGoal ? '/dashboard' : '/add_goals';
  }, [fromPath]);

  useEffect(() => {
    if (!loading && token) navigate(resolveNextPath(), { replace: true });
  }, [loading, token, resolveNextPath, navigate]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'register') await register(email, password);
      else await login(email, password);

      navigate(resolveNextPath(), { replace: true });
    } catch (e2) {
      setError(e2.message || 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="gs-page">
      <main className="gs-container" style={{ width: 'min(520px, 100%)' }}>
        <header className="gs-hero">
          <h1>{mode === 'register' ? 'Create Account' : 'Login'}</h1>
          <p className="gs-sub" style={{ marginTop: 8 }}>
            {mode === 'register'
              ? 'Create an account to save your roadmap and progress.'
              : 'Login to load your saved roadmap and continue.'}
          </p>
        </header>

        <section className="gs-card" style={{ width: '100%', maxWidth: 400 }}>
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  background: '#fff',
                  fontSize: 14
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                required
                minLength={8}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  background: '#fff',
                  fontSize: 14
                }}
              />
            </label>

            <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                className="hdr-text-link"
                onClick={() => setMode((m) => (m === 'login' ? 'register' : 'login'))}
                disabled={busy || loading}
                style={{ textDecoration: 'underline' }}
              >
                {mode === 'login' ? 'Create account' : 'Login'}
              </button>
            </div>

            {error && (
              <div
                className="gs-card"
                style={{
                  marginTop: 8,
                  border: '1px solid #FCA5A5',
                  background: '#FEF2F2',
                  color: '#991B1B',
                  padding: 12
                }}
              >
                {error}
              </div>
            )}

            <div className="gs-actions" style={{ justifyContent: 'center', marginTop: 8 }}>
              <button
                className="btn-primary"
                type="submit"
                disabled={busy || loading}
                style={{ minWidth: 260, padding: '12px 28px' }}
              >
                {busy ? 'Working...' : mode === 'register' ? 'Register' : 'Login'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
