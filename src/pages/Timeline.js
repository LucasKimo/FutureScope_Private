import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Steps from '../components/Steps';

export default function SetDate() {
  const navigate = useNavigate();
  const location = useLocation();

  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [goal, setGoal] = useState('');
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    const flow = location.state?.flow;
    if (!flow) return;
    setGoal(flow.goal || '');
    setEstimate(flow.estimate || null);
    if (location.state?.start) setStart(location.state.start);
    if (location.state?.end) setEnd(location.state.end);
  }, [location.state]);

  const initialHours = location.state?.hours || estimate?.suggested_hours_per_week?.mid || 7;
  const hours = Number(initialHours);

  const isValid = start && end && new Date(start) <= new Date(end);

  const totalHours = Number(estimate?.total_hours || 0);
  const estWeeks = totalHours > 0 ? Math.max(1, Math.ceil(totalHours / Math.max(1, hours))) : null;
  const estMonths = estWeeks ? Math.max(1, Math.round(estWeeks / 4.345)) : null;
  const estYears = estWeeks ? Math.max(0.1, Number((estWeeks / 52.1775).toFixed(1))) : null;

  let timelineWeeks = null;
  let timelineYears = null;
  let fits = null;
  if (start && end && estWeeks) {
    const ms = new Date(end) - new Date(start);
    const days = Math.round(ms / (1000 * 60 * 60 * 24));
    timelineWeeks = days > 0 ? Math.max(1, Math.round(days / 7)) : null;
    timelineYears = timelineWeeks ? Math.max(0.1, Number((timelineWeeks / 52.1775).toFixed(1))) : null;
    fits = timelineWeeks != null ? estWeeks <= timelineWeeks : null;
  }

  const handleStepClick = (step) => {
    const flow = location.state?.flow;
    if (step === 1) navigate('/add_goals', { state: { goal } });
    else if (step === 2) navigate('/add_goals/previous_knowledge', { state: { flow } });
  };

  return (
    <div className="gs-page">
      <main className="gs-container">
        <Steps active={3} onStepClick={handleStepClick} />

        <header className="gs-hero">
          <h1>
            When Do You Want to <span style={{ color: 'var(--brand)' }}>Start &amp; Finish</span>?
          </h1>
          <p className="gs-sub">Select your goal start and end dates to help us create your personalized timeline.</p>
          <p className="gs-sub" style={{ marginTop: 4 }}>Choose realistic dates to help us plan your timeline effectively.</p>
        </header>

        <section className="gs-card" style={{ maxWidth: 940, marginTop: 16 }}>
          <h3 className="gs-card-title" style={{ marginTop: 0 }}>Approximate Time to Complete</h3>

          {!estimate ? (
            <div style={{ fontSize: 14, color: '#b91c1c' }}>
              No AI estimate found. Please go back to Knowledge and continue again.
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Estimated Years</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand)' }}>{estYears}</div>
                </div>
                <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Estimated Months</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand)' }}>{estMonths}</div>
                </div>
              </div>

              <div style={{ marginTop: 10, fontSize: 14, color: '#374151' }}>
                OpenAI estimate for <b>{goal || 'your goal'}</b>: about <b>{totalHours} total hours</b>. With <b>{hours}h/week</b>, that is about <b>{estYears} years</b> (~{estMonths} months).
              </div>

              {estimate?.explanation && (
                <div style={{ marginTop: 6, fontSize: 13, color: '#6B7280' }}>
                  {estimate.explanation}
                </div>
              )}

              {timelineYears != null && (
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  Your selected timeline spans <b>{timelineYears} years</b>.{' '}
                  {fits === true && <span style={{ color: '#16a34a' }}>Good fit.</span>}
                  {fits === false && (
                    <span style={{ color: '#b91c1c' }}>
                      You need about {Number(((estWeeks - timelineWeeks) / 52.1775).toFixed(1))} more years to hit this estimate.
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <section className="gs-card" style={{ maxWidth: 940, marginTop: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Start Date</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                aria-label="Start date"
                className="date-input"
                style={{
                  width: '100%',
                  padding: '14px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  background: '#fff',
                  fontSize: 14,
                  colorScheme: 'light'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>End Date</label>
              <input
                type="date"
                value={end}
                min={start || undefined}
                onChange={(e) => setEnd(e.target.value)}
                aria-label="End date"
                className="date-input"
                style={{
                  width: '100%',
                  padding: '14px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  background: '#fff',
                  fontSize: 14,
                  colorScheme: 'light'
                }}
              />
            </div>
          </div>
        </section>

        <div className="gs-actions" style={{ marginTop: 24 }}>
          <button className="btn-outline" type="button" onClick={() => navigate(-1)}>
            Back
          </button>
          <button
            className="btn-primary"
            type="button"
            disabled={!isValid || !estimate}
            onClick={() =>
              navigate('/add_goals/commitment', {
                state: { start, end, hours, totalHours, flow: location.state?.flow || null }
              })
            }
            style={!isValid || !estimate ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
          >
            Continue to Commitment
          </button>
        </div>

        {!isValid && (start || end) && (
          <p className="gs-sub" style={{ textAlign: 'center', marginTop: 8, color: '#b91c1c' }}>
            Please pick both dates and ensure the end date is after the start date.
          </p>
        )}
      </main>
    </div>
  );
}
