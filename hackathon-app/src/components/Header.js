import { Link, useLocation } from 'react-router-dom';
import icon from './icon_app.svg';
import { useAuth } from '../auth/AuthContext';

export default function Header() {
  const { token, logout } = useAuth();
  const location = useLocation();
  const dashboardActive =
    location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/main_dashboard');
  const isMainDash = location.pathname.startsWith('/main_dashboard');

  return (
    <header className={`app-header ${isMainDash ? 'app-header--main-dash' : ''}`}>
      <div className="brand" style={{ justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', gap: '8px' }}>
          <img src={icon} alt="FutureScope" className="logo" />
          <span>Future Scope</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          {token ? (
            <>
              <Link className={dashboardActive ? 'hdr-text-link hdr-text-link--active' : 'hdr-text-link'} to="/dashboard">
                Goals
              </Link>
              <button className="hdr-text-btn" type="button" onClick={logout}>
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
