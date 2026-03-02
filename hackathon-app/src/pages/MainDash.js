import { useEffect, useMemo, useState } from 'react';
import { getDashboardData } from '../services/dashboardApi';

const priorityColor = {
  high: '#DC2626',
  medium: '#D97706',
  low: '#2563EB'
};

function readDashboardSeed() {
  try {
    const raw = localStorage.getItem('lastRoadmap');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      goal: parsed.goal || '',
      roadmap: parsed.roadmap || null,
      checked: parsed.checked || {},
      estimate: parsed.estimate || null
    };
  } catch {
    return null;
  }
}

export default function MainDash() {
  const [seed, setSeed] = useState(null);
  const [checked, setChecked] = useState({});
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllRoadmap, setShowAllRoadmap] = useState(false);

  useEffect(() => {
    const next = readDashboardSeed();
    setSeed(next);
    setChecked(next?.checked || {});

    if (!next?.goal || !next?.roadmap) {
      setLoading(false);
      setError('No goal data found. Complete the setup flow first.');
      return;
    }

    let active = true;

    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getDashboardData(next);
        if (active) setDashboard(data);
      } catch (e) {
        if (active) setError(e.message || 'Failed to load dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  const handleChecklistToggle = (id) => {
    setChecked((prev) => {
      const nextChecked = { ...prev, [id]: !prev[id] };
      setSeed((prevSeed) => {
        if (!prevSeed) return prevSeed;
        const updated = { ...prevSeed, checked: nextChecked };
        localStorage.setItem(
          'lastRoadmap',
          JSON.stringify({
            goal: updated.goal,
            roadmap: updated.roadmap,
            checked: nextChecked,
            estimate: updated.estimate || null
          })
        );
        return updated;
      });
      return nextChecked;
    });
  };

  const flatItems = useMemo(() => {
    const rows = [];
    for (const category of seed?.roadmap?.categories || []) {
      for (const item of category.items || []) {
        rows.push({ ...item, category: category.name, done: Boolean(checked[item.id]) });
      }
    }
    return rows;
  }, [seed, checked]);

  const totalItems = flatItems.length;
  const doneItems = flatItems.filter((x) => x.done).length;
  const remainingItems = Math.max(0, totalItems - doneItems);
  const progressPct = totalItems ? Math.round((doneItems / totalItems) * 100) : 0;

  const nextMilestones = useMemo(() => {
    const pending = flatItems
      .filter((x) => !x.done)
      .slice(0, 3)
      .map((x, index) => ({
        title: x.label,
        reason: `Focus on ${x.category.toLowerCase()} next.`,
        priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low'
      }));

    if (pending.length > 0) return pending;
    return (dashboard?.next_milestones || []).slice(0, 3);
  }, [flatItems, dashboard]);

  const timeframeMonths = seed?.roadmap?.timeframe_months;
  const hasMoreThanFive = flatItems.length > 5;
  const visibleRoadmapItems = showAllRoadmap ? flatItems : flatItems.slice(0, 5);

  return (
    <div className="gs-page">
      <main className="gs-container">
        <section
          aria-label="goal hero"
          style={{
            background: 'linear-gradient(135deg, var(--brand) 0%, #4A47D5 50%, #3C2ECF 100%)',
            color: '#fff',
            borderRadius: 20,
            boxShadow: 'var(--shadow)',
            padding: 16,
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 16
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ opacity: 0.9, fontWeight: 700 }}>Your Goal</div>
              <div style={{ opacity: 0.9, fontSize: 12 }}>
                {loading ? 'Refreshing AI dashboard...' : 'AI-personalized'}
              </div>
            </div>

            <h2 style={{ margin: '6px 0 12px', fontSize: 22, fontWeight: 800 }}>
              {seed?.goal || 'Complete setup to generate your personalized dashboard'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ background: 'rgba(255,255,255,.12)', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="#FFD166" aria-hidden>
                  <path d="M12 2c3 4 2 6 0 8-1.3 1.3-2 2.6-2 4.1A4.9 4.9 0 0 0 15 19a5 5 0 0 0 5-5c0-2.4-1.6-4-2.8-5 .2 1.4-1 2.6-2.1 2.6 1-2 .3-4.2-3.1-5.6Z" />
                </svg>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{remainingItems}</div>
                  <div style={{ opacity: 0.9, fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase' }}>tasks left</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,.12)', borderRadius: 14, padding: 14, display: 'grid', placeItems: 'center' }}>
                <div style={{ position: 'relative', width: 96, height: 96 }}>
                  <svg viewBox="0 0 36 36" style={{ width: 96, height: 96 }}>
                    <path d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32" fill="none" stroke="white" strokeOpacity=".25" strokeWidth="4" />
                    <path
                      d="M18 2a16 16 0 1 1 0 32"
                      fill="none"
                      stroke="white"
                      strokeWidth="4"
                      strokeDasharray={`${progressPct} ${100 - progressPct}`}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 14 }}>
                    <div style={{ fontWeight: 800 }}>{progressPct}%</div>
                    <div style={{ opacity: 0.85, fontSize: 12, marginTop: -30 }}>progress</div>
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,.12)', borderRadius: 14, padding: 14 }}>
                <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>
                  {Number.isFinite(timeframeMonths) ? `${timeframeMonths} months` : 'Timeline pending'}
                </div>
                <div style={{ opacity: 0.9, fontSize: 12, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                  estimated duration
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', color: '#0f172a', borderRadius: 14, padding: 14, boxShadow: 'var(--shadow)' }}>
            <h4 style={{ margin: '0 0 10px', fontWeight: 700 }}>Next 3 Milestones</h4>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
              {nextMilestones.map((m) => (
                <li
                  key={m.title}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '10px 12px',
                    background: '#fff',
                    gap: 10
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: '#64748B' }}>{m.reason}</div>
                  </div>
                  <span style={{ color: priorityColor[m.priority] || '#2563EB', fontWeight: 700, textTransform: 'uppercase', fontSize: 12 }}>
                    {m.priority || 'medium'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16, alignItems: 'start' }}>
          <section className="gs-card" aria-label="learning roadmap" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Learning Roadmap</h3>
              <div style={{ color: 'var(--brand)', fontSize: 13, fontWeight: 700 }}>{doneItems}/{totalItems} complete</div>
            </div>

            <ul style={{ listStyle: 'none', margin: 12, padding: 0, display: 'grid', gap: 12 }}>
              {visibleRoadmapItems.map((item) => (
                <li key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => handleChecklistToggle(item.id)}
                    aria-label={item.label}
                    style={{ marginTop: 4 }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: item.done ? '#16A34A' : 'var(--brand)' }}>
                      {item.done ? 'Completed' : 'In Progress'}
                    </div>
                  </div>
                </li>
              ))}
              {!flatItems.length && <li style={{ fontSize: 14, color: '#64748B' }}>No roadmap loaded yet.</li>}
            </ul>

            {hasMoreThanFive && (
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowAllRoadmap((prev) => !prev)}
              >
                {showAllRoadmap ? 'Show less' : 'View all'}
              </button>
            )}
          </section>

          <div style={{ display: 'grid', gap: 16 }}>
            <div className="gs-card" style={{ background: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <h4 style={{ margin: '0 0 6px', color: '#C2410C' }}>Daily Insight</h4>
              <p style={{ margin: 0, color: '#9A3412' }}>
                {dashboard?.daily_insight || seed?.estimate?.explanation || 'Complete one milestone this week to build momentum.'}
              </p>
            </div>

            <div className="gs-card">
              <h4 style={{ margin: '0 0 8px' }}>Achievement Hub</h4>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'var(--brand)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff',
                    boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.15)'
                  }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden>
                    <path d="M12 2 15 8l6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1 3-6z" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14 }}>
                    {doneItems > 0 ? 'You unlocked your first milestone badge.' : 'Complete your first milestone to unlock a badge.'}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{dashboard?.focus_recommendation || 'Stay consistent with weekly sessions.'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="gs-card" style={{ marginTop: 16, border: '1px solid #FCA5A5', background: '#FEF2F2', color: '#991B1B' }}>
            {error}
          </div>
        )}
      </main>
    </div>
  );
}





