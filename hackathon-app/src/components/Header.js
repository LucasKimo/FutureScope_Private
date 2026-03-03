import { Link } from 'react-router-dom';
import icon from './icon_app.svg';
import { useAuth } from '../auth/AuthContext';

export default function Header() {
  const { user, token, logout } = useAuth();
  return (
    <header className="app-header">
      <div className="brand" style={{ justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', gap: '8px' }}>
          <img src={icon} alt="FutureScope" className="logo" />
          <span>FutureScope</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {token ? (
            <>
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>
                {user?.email || 'Signed in'}
              </span>
              <button className="btn-outline" type="button" onClick={logout} style={{ padding: '8px 12px' }}>
                Logout
              </button>
            </>
          ) : (
            <Link className="btn-primary" to="/login" style={{ textDecoration: 'none', padding: '8px 12px' }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
