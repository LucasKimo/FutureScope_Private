import { Link } from 'react-router-dom';
import icon from './icon_app.svg';

export default function Header() {
  return (
    <header className="app-header">
      <div className="brand">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', gap: '8px' }}>
          <img src={icon} alt="FutureScope" className="logo" />
          <span>FutureScope</span>
        </Link>
      </div>
    </header>
  );
}
