import { Link, NavLink } from 'react-router-dom';
import icon from './icon_app.svg';
import { useAuth } from '../auth/AuthContext';

export default function Header() {
  const { token, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="brand" style={{ justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', gap: '8px' }}>
          <img src={icon} alt="FutureScope" className="logo" />
          <span>Future Scope</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          {token ? (
            <>
              <NavLink
                to="/main_dashboard"
                className={({ isActive }) => (isActive ? 'hdr-text-link hdr-text-link--active' : 'hdr-text-link')}
              >
                Dashboard
              </NavLink>
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
