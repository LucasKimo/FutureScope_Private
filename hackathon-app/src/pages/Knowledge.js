import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Steps from '../components/Steps';
import RoadmapChecklist from '../components/RoadmapChecklist';

export default function Knowledge() {
  const navigate = useNavigate();

  const [goal, setGoal] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [checked, setChecked] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('lastRoadmap');
    console.log(saved)
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setGoal(data.goal || '');
        setRoadmap(data.roadmap || null);
        setChecked(data.checked || {});
      } catch {
        console.error('Invalid lastRoadmap JSON');
      }
    }
  }, []);

  const onToggle = (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    localStorage.setItem('lastRoadmap', JSON.stringify({ goal, roadmap, checked: next }));
  };

  // 상단 카드 진행률 (전체 카테고리 기준)
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
            What’s Your <span style={{ color: 'var(--brand)' }}>Previous Knowledge</span>?
          </h1>
          <p className="gs-sub">Tell us about your current skills and experience related to your goal.</p>
          <p className="gs-sub" style={{ marginTop: 4 }}>Review and customize your milestones.</p>
        </header>

        {/* Checklist Card */}
        <section className="gs-card" style={{ maxWidth: 940, marginTop: 24 }}>
          {/* 라벨 */}
          <div style={{ marginBottom: 4, fontSize: 12, color: '#6B7280', fontWeight: 700 }}>
            Your Goal
          </div>

          {/* 제목 ↔ 상단 진행률 한 줄 정렬 */}
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
        </section>


        {/* Footer */}
        <div className="gs-actions" style={{ marginTop: 24 }}>
          <button className="btn-outline" type="button">Save Draft</button>
          <button className="btn-primary" type="button" onClick={() => navigate('/add_goals/timeline')}>
            Continue to Timeline
          </button>
        </div>
      </main>
    </div>
  );
}
