import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function formatDate(value) {
  if (!value) return 'Not set';
  const d = new Date(value);
  if (isNaN(d)) return 'Not set';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function GoalSummary() {
  const navigate = useNavigate();
  const location = useLocation();

  const [goal, setGoal] = useState('Your goal');
  const [roadmap, setRoadmap] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('lastRoadmap');
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      setGoal(data.goal || 'Your goal');
      setRoadmap(data.roadmap || null);
    } catch {
      console.error('Invalid lastRoadmap JSON');
    }
  }, []);

  const start = location.state?.start;
  const end = location.state?.end;
  const hours = Number(location.state?.hours || 0);
  const totalHours = Number(location.state?.totalHours || 0);

  const months = useMemo(() => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s) || isNaN(e) || e < s) return null;
    const days = Math.round((e - s) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.round(days / 30.44));
  }, [start, end]);

  const milestoneCount = useMemo(() => {
    return (roadmap?.categories || []).reduce((sum, c) => sum + (c.items?.length || 0), 0);
  }, [roadmap]);

  return (
    <div className="gs-page">
      <main className="gs-container">
        <div className="gs-steps">
          <div className="gs-steps-bar">
            <div className="gs-steps-fill" style={{ width: '100%' }} />
          </div>
          <ul className="gs-steps-list" aria-label="setup steps">
            <li className="complete">Your Goal</li>
            <li className="complete">Timeline</li>
            <li className="complete">Knowledge</li>
            <li className="complete">Commitment</li>
            <li className="complete active">Summary</li>
          </ul>
        </div>

        <header className="gs-hero">
          <h1>Almost There! Here Is Your<br />Goal Summary &amp; Roadmap</h1>
          <p className="gs-sub">Ready to see your roadmap and progress at a glance?</p>
        </header>

        <section className="gs-card" aria-labelledby="summary-title">
          <h3 id="summary-title" className="gs-card-title">Your Personalised Plan</h3>

          <div className="gs-plan-box">
            <p>
              Based on your goal: <strong>{goal}</strong>, starting <strong>{formatDate(start)}</strong> and ending{' '}
              <strong>{formatDate(end)}</strong>, with your dedication of <strong>{hours || 'N/A'} hours/week</strong>
              .
            </p>
          </div>

          <div className="gs-stats" role="list">
            <div className="gs-stat purple" role="listitem">
              <div className="gs-stat-num">{months || '-'}</div>
              <div className="gs-stat-label">Month</div>
            </div>
            <div className="gs-stat blue" role="listitem">
              <div className="gs-stat-num">{hours || '-'}</div>
              <div className="gs-stat-label">Hours/week</div>
            </div>
            <div className="gs-stat green" role="listitem">
              <div className="gs-stat-num">{milestoneCount || '-'}</div>
              <div className="gs-stat-label">Milestones</div>
            </div>
            <div className="gs-stat orange" role="listitem">
              <div className="gs-stat-num">{totalHours || '-'}</div>
              <div className="gs-stat-label">Total hours</div>
            </div>
          </div>
        </section>

        <div className="gs-actions">
          <button className="btn-outline" type="button" onClick={() => navigate(-1)}>
            Back
          </button>
          <button className="btn-primary" type="button" onClick={() => navigate('/main_dashboard')}>
            View My Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
