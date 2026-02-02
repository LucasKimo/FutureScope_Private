import { useNavigate } from 'react-router-dom';
import HeroLogo from '../components/icon_app_plain.svg';
import FutureScopeIcon from '../components/futurescope.svg';

const Home = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/add_goals');
  };

  return (
    <div className="landing-bg">
      <div className="gs-container">
        <section className="gs-hero">
          <img src={HeroLogo} alt="FutureScope Logo" className="hero-logo" />
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
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
