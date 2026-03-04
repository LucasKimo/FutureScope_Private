import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Steps from '../components/Steps';
import { useAuth } from '../auth/AuthContext';
import { hydrateLastRoadmapFromServer, readLastRoadmap } from '../services/persist';

export default function DedicatedTime() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    const local = readLastRoadmap();
    if (local) setEstimate(local.estimate || null);

    let active = true;
    (async () => {
      if (!token) return;
      const remote = await hydrateLastRoadmapFromServer(token);
      if (!active || !remote) return;
      setEstimate(remote.estimate || null);
    })();
    return () => {
      active = false;
    };
  }, [token]);

  const start = useMemo(() => {
    return location.state?.start ? new Date(location.state.start) : null;
  }, [location.state?.start]);

  const end = useMemo(() => {
    return location.state?.end ? new Date(location.state.end) : null;
  }, [location.state?.end]);

  const weeks = useMemo(() => {
    if (!start || !end || isNaN(start) || isNaN(end) || end < start) return 26;
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.round(days / 7));
  }, [start, end]);

  const totalHours = Number(location.state?.totalHours || estimate?.total_hours || 0);

  const suggested = useMemo(() => {
    if (estimate?.suggested_hours_per_week) {
      const { low, mid, high } = estimate.suggested_hours_per_week;
      return {
        low: Math.max(1, Math.round(low)),
        mid: Math.max(1, Math.round(mid)),
        high: Math.max(1, Math.round(high))
      };
    }

    if (totalHours > 0) {
      const mid = Math.max(1, Math.round(totalHours / weeks));
      return {
        low: Math.max(1, mid - 1),
        mid,
        high: Math.min(40, mid + 1)
      };
    }

    return { low: 5, mid: 7, high: 10 };
  }, [estimate, totalHours, weeks]);

  const [hours, setHours] = useState(suggested.mid || 7);

  useEffect(() => {
    setHours(suggested.mid || 7);
  }, [suggested.mid]);

  const presets = [5, 7, 10, 15];

  return (
    <div className="gs-page">
      <main className="gs-container">
        <Steps active={4} />

        <header className="gs-hero">
          <h1>How Much Time Can You Dedicate?</h1>
          <p className="gs-sub">How many hours per week can you realistically dedicate to achieving your goal?</p>
          <p className="gs-sub" style={{ marginTop: 4 }}>Be honest. Consistent time beats sporadic marathons.</p>
        </header>

        <section className="gs-card" style={{ maxWidth: 940 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Smart Recommendation</div>
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12, background: '#FAFAFA' }}>
            {totalHours > 0 ? (
              <p style={{ margin: '0 0 8px', fontSize: 14 }}>
                Based on your selected knowledge and {weeks}-week timeline, we recommend
                <strong> {suggested.low}-{suggested.high} hours per week</strong> for steady progress.
              </p>
            ) : (
              <p style={{ margin: '0 0 8px', fontSize: 14, color: '#b91c1c' }}>
                No AI estimate found yet. Go back to Knowledge and continue again.
              </p>
            )}

            {totalHours > 0 && (
              <div style={{ fontSize: 12, color: '#6B7280' }}>
                Estimated total effort: ~{totalHours} hours
              </div>
            )}
            {estimate?.explanation && (
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{estimate.explanation}</div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: 12, marginTop: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Weekly Time Commitment</div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color: 'var(--brand)' }}>{hours}</div>
              <div style={{ fontSize: 12, color: '#6B7280' }}>hours/week</div>
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <input
              type="range"
              min={1}
              max={40}
              step={1}
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value, 10))}
              style={{ width: '100%' }}
              aria-label="hours per week"
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7280', marginTop: 6 }}>
              <span>1 hour</span><span>20 hours</span><span>40 hours</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            {presets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setHours(p)}
                className={p === hours ? 'btn-primary' : 'btn-outline'}
                style={{ padding: '10px 16px' }}
              >
                {p} hours
              </button>
            ))}
          </div>
        </section>

        <div className="gs-actions" style={{ marginTop: 24 }}>
          <button className="btn-outline" type="button" onClick={() => navigate(-1)}>
            Back
          </button>
          <button
            className="btn-primary"
            type="button"
            disabled={totalHours <= 0}
            onClick={() =>
              navigate('/add_goals/goal_summary', {
                state: { hours, start: location.state?.start, end: location.state?.end, totalHours }
              })
            }
          >
            Continue to Goal Summary
          </button>
        </div>
      </main>
    </div>
  );
}
