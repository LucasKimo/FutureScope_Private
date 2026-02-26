import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Steps from '../components/Steps';

export default function SetDate() {
  const navigate = useNavigate();
  const location = useLocation();
  const hours = Number(location.state?.hours || 7);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  // # simple validation: require both and start <= end
  const isValid = start && end && new Date(start) <= new Date(end);

  const TOTAL_HOURS = 200; // heuristic total effort
  const estWeeks = Math.max(1, Math.ceil(TOTAL_HOURS / Math.max(1, hours)));
  const estMonths = Math.max(1, Math.round(estWeeks / 4.345));

  // If dates are selected, compute available timeline and fit
  let timelineWeeks = null;
  let fits = null;
  if (start && end) {
    const ms = new Date(end) - new Date(start);
    const days = Math.round(ms / (1000 * 60 * 60 * 24));
    timelineWeeks = days > 0 ? Math.max(1, Math.round(days / 7)) : null;
    fits = timelineWeeks != null ? estWeeks <= timelineWeeks : null;
  }

  return (
    <div className="gs-page">

      <main className="gs-container">
        {/* # Step progress */}
        <Steps active={3} />

        {/* # Title + subtitle */}
        <header className="gs-hero">
          <h1>
            When Do You Want to <span style={{color:'var(--brand)'}}>Start &amp; Finish</span>?
          </h1>
          <p className="gs-sub">Select your goal start and end dates to help us create your personalized timeline?</p>
          <p className="gs-sub" style={{marginTop:4}}>Choose realistic dates to help us plan your timeline effectively.</p>
        </header>

        {/* # Approximate time card */}
        <section className="gs-card" style={{maxWidth:940, marginTop:16}}>
          <h3 className="gs-card-title" style={{marginTop:0}}>Approximate Time to Complete</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
            <div style={{border:'1px solid var(--border)', borderRadius:12, padding:16, textAlign:'center'}}>
              <div style={{fontSize:12, color:'#6B7280'}}>Estimated Weeks</div>
              <div style={{fontSize:28, fontWeight:800, color:'var(--brand)'}}>{estWeeks}</div>
            </div>
            <div style={{border:'1px solid var(--border)', borderRadius:12, padding:16, textAlign:'center'}}>
              <div style={{fontSize:12, color:'#6B7280'}}>Estimated Months</div>
              <div style={{fontSize:28, fontWeight:800, color:'var(--brand)'}}>{estMonths}</div>
            </div>
          </div>
          <div style={{marginTop:10, fontSize:14, color:'#374151'}}>
            Assumption: ~{TOTAL_HOURS} total hours. With <b>{hours}h/week</b>, that’s about <b>{estWeeks} weeks</b> (~{estMonths} months).
          </div>
          {timelineWeeks != null && (
            <div style={{marginTop:8, fontSize:14}}>
              Your selected timeline spans <b>{timelineWeeks} weeks</b>.{' '}
              {fits === true && (
                <span style={{color:'#16a34a'}}>Good fit ✔︎</span>
              )}
              {fits === false && (
                // <span style={{color:'#b91c1c'}}>Estimated effort exceeds your timeline by ~{estWeeks - timelineWeeks} weeks.</span>
                <span style={{color:'#b91c1c'}}>You need ~{estWeeks - timelineWeeks} more weeks to achieve your goal.</span>
              )}
            </div>
          )}
        </section>

        {/* # Card with two inputs */}
        <section className="gs-card" style={{maxWidth:940, marginTop:24}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
            <div>
              <label style={{display:'block', fontSize:13, fontWeight:700, marginBottom:8}}>Start Date</label>
              <input
                type="date"
                value={start}
                onChange={(e)=>setStart(e.target.value)}
                aria-label="Start date"
                style={{
                  width:'100%', padding:'14px 12px', border:'1px solid var(--border)', borderRadius:12,
                  background:'#fff', fontSize:14
                }}
              />
            </div>
            <div>
              <label style={{display:'block', fontSize:13, fontWeight:700, marginBottom:8}}>End Date</label>
              <input
                type="date"
                value={end}
                min={start || undefined}
                onChange={(e)=>setEnd(e.target.value)}
                aria-label="End date"
                style={{
                  width:'100%', padding:'14px 12px', border:'1px solid var(--border)', borderRadius:12,
                  background:'#fff', fontSize:14
                }}
              />
            </div>
          </div>
        </section>

        {/* # Actions */}
        <div className="gs-actions" style={{marginTop:24}}>
          <button
            className="btn-outline"
            type="button"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
          <button
            className="btn-primary"
            type="button"
            disabled={!isValid}
            onClick={()=> navigate('/add_goals/commitment', { state: { start, end, hours } })}
            style={!isValid ? {opacity:.6, cursor:'not-allowed'} : undefined}
          >
            Continue to Commitment
          </button>
        </div>

        {/* # Validation hint */}
        {!isValid && (start || end) && (
          <p className="gs-sub" style={{textAlign:'center', marginTop:8, color:'#b91c1c'}}>
            Please pick both dates and ensure the end date is after the start date.
          </p>
        )}
      </main>
    </div>
  );
}
