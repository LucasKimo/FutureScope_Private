import { useNavigate } from 'react-router-dom';
import HeroLogo from '../components/icon_app_plain.svg';
import FutureScopeIcon from '../components/futurescope.svg';
import { useAuth } from '../auth/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleClick = () => {
    navigate('/add_goals');
  };

  const handleDashboardClick = () => {
    navigate('/main_dashboard');
  };

  return (
    <div className="landing-bg">
      <section className="gs-hero">
        <img src={HeroLogo} alt="FutureScope Logo" className="hero-logo select-none" />
        <h1 style={{ fontSize: '64px', fontWeight: 800 }}>
          Turn Your Future Goals Into
          <br />
          <span className="highlight" style={{ color: '#FFF3C3' }}>Future Scope</span>
        </h1>
        <p className="gs-sublan">
          AI-powered planning meets gamification
          <br /> set your goal, get a timeline,
          and level up as you achieve it.
        </p>
        <div className="gs-actions">
          <button
            type="button"
            className="btn-primary-landing"
            onClick={handleClick}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <img
              src={FutureScopeIcon}
              alt="FutureScope Icon"
              className="btn-icon"
              width={30}
              height={30}
              style={{ transform: 'rotate(45deg)' }}
            />
            <span style={{ lineHeight: '24px' }}>Start My Journey</span>
          </button>

          {token && (
            <button
              type="button"
              className="btn-primary-landing"
              onClick={handleDashboardClick}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <span style={{ lineHeight: '24px' }}>Main Dashboard</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
