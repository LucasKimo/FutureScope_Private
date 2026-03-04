import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Steps from '../components/Steps';
import RoadmapChecklist from '../components/RoadmapChecklist';
import { getEstimate } from '../services/estimateApi';
import { useAuth } from '../auth/AuthContext';
import { hydrateLastRoadmapFromServer, readLastRoadmap, writeLastRoadmap } from '../services/persist';

export default function Knowledge() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [goal, setGoal] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [checked, setChecked] = useState({});
  const [estimate, setEstimate] = useState(null);
  const [estimating, setEstimating] = useState(false);

  useEffect(() => {
    const local = readLastRoadmap();
    if (local) {
      setGoal(local.goal || '');
      setRoadmap(local.roadmap || null);
      setChecked(local.checked || {});
      setEstimate(local.estimate || null);
    }

    let active = true;
    (async () => {
      if (!token) return;
      const remote = await hydrateLastRoadmapFromServer(token);
      if (!active || !remote) return;
      setGoal(remote.goal || '');
      setRoadmap(remote.roadmap || null);
      setChecked(remote.checked || {});
      setEstimate(remote.estimate || null);
    })();

    return () => {
      active = false;
    };
  }, [token]);

  const onToggle = (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    setEstimate(null);
    writeLastRoadmap({ goal, roadmap, checked: next, estimate: null }, token);
  };

  const handleContinueTimeline = async () => {
    if (!roadmap) {
      alert('Please generate a roadmap first.');
      return;
    }

    setEstimating(true);
    try {
      const nextEstimate = await getEstimate({ goal, roadmap, checked });
      setEstimate(nextEstimate);
      await writeLastRoadmap({ goal, roadmap, checked, estimate: nextEstimate }, token);
      navigate('/add_goals/timeline');
    } catch (e) {
      alert(e.message || 'Failed to calculate estimate. Please try again.');
    } finally {
      setEstimating(false);
    }
  };

  const totalItems = (roadmap?.categories || []).reduce(
    (sum, c) => sum + (c.items?.length || 0),
    0
  );
  const doneItems = Object.values(checked).filter(Boolean).length;
  const progress = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;

  return (
    <div className="gs-page">
      <main className="gs-container">
        <Steps active={2} />

        <header className="gs-hero">
          <h1>
            What Is Your <span style={{ color: 'var(--brand)' }}>Previous Knowledge</span>?
          </h1>
          <p className="gs-sub">Tell us about your current skills and experience related to your goal.</p>
          <p className="gs-sub" style={{ marginTop: 4 }}>Review and customize your milestones.</p>
        </header>

        <section className="gs-card" style={{ maxWidth: 940, marginTop: 24 }}>
          <div style={{ marginBottom: 4, fontSize: 12, color: '#6B7280', fontWeight: 700 }}>
            Your Goal
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              marginBottom: 16,
              paddingTop: 4
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 20 }}>
              {goal || 'No goal provided'}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800 }}>{progress}%</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>Complete</div>
            </div>
          </div>

          {!roadmap ? (
            <p style={{ opacity: 0.8 }}>
              No checklist found. Please go back to <strong>Add Goals</strong> and press
              <em> Continue to Knowledge</em> to generate it.
            </p>
          ) : (
            <RoadmapChecklist
              roadmap={roadmap}
              checked={checked}
              onToggle={onToggle}
              showProgress={false}
            />
          )}

          {estimate && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#374151' }}>
              Latest estimate: about <strong>{estimate.total_hours}</strong> hours remaining.
            </div>
          )}
        </section>

        <div className="gs-actions" style={{ marginTop: 24 }}>
          <button className="btn-outline" type="button">Save Draft</button>
          <button
            className="btn-primary"
            type="button"
            onClick={handleContinueTimeline}
            disabled={!roadmap || estimating}
          >
            {estimating ? 'Calculating...' : 'Continue to Timeline'}
          </button>
        </div>
      </main>
    </div>
  );
}
