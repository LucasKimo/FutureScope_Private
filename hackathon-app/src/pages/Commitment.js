import { useNavigate, useLocation } from 'react-router-dom';
import { useMemo, useState } from 'react';
import Steps from '../components/Steps';

export default function DedicatedTime() {
  const navigate = useNavigate();
  const location = useLocation();

  // # read dates if forwarded via router state
  const start = location.state?.start ? new Date(location.state.start) : null;
  const end = location.state?.end ? new Date(location.state.end) : null;

  // # compute timeline length in weeks if dates exist
  const weeks = useMemo(() => {
    if (!start || !end || isNaN(start) || isNaN(end) || end < start) return 26; // fallback example
    const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.round(days / 7));
  }, [start, end]);

  // # simple heuristic for suggestion based on timeline length
  const suggested = useMemo(() => {
    // target ~200 hours total effort; hours/week ~= 200 / weeks
    const mid = Math.max(1, Math.round(200 / weeks));
    const low = Math.max(1, mid - 1);
    const high = Math.min(40, mid + 1);
    return { low, mid, high };
  }, [weeks]);

  const [hours, setHours] = useState(suggested.mid || 7);

  const presets = [5, 7, 10, 15];

  return (
    <div className="gs-page">
      <main className="gs-container">
        {/* # Steps (Commitment active) */}
        <Steps active={3} />

        {/* # Title + subtitle */}
        <header className="gs-hero">
          <h1>How Much Time Can You Dedicate?</h1>
          <p className="gs-sub">How many hours per week can you realistically dedicate to achieving your goal?</p>
          <p className="gs-sub" style={{marginTop:4}}>Be honest! Consistent time beats sporadic marathons.</p>
        </header>

        {/* # Smart Recommendation card */}
        <section className="gs-card" style={{maxWidth:940}}>
          <div style={{fontSize:13, fontWeight:700, marginBottom:8}}>Smart Recommendation</div>
          <div style={{border:'1px solid var(--border)', borderRadius:12, padding:12, background:'#FAFAFA'}}>
            <p style={{margin:'0 0 8px', fontSize:14}}>
              Based on your goal complexity and {weeks}-week timeline, we recommend
              <strong> {suggested.low}–{suggested.high} hours per week</strong> for steady progress.
            </p>
            <div style={{fontSize:12, color:'#6B7280'}}>
              Estimated total effort: ~200 hours · Your timeline: {weeks} weeks
            </div>
          </div>

          {/* # Weekly commitment slider */}
          <div style={{display:'grid', gridTemplateColumns:'1fr auto', alignItems:'end', gap:12, marginTop:22}}>
            <div style={{fontSize:13, fontWeight:700}}>Weekly Time Commitment</div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:28, fontWeight:800, lineHeight:1, color:'var(--brand)'}}>{hours}</div>
              <div style={{fontSize:12, color:'#6B7280'}}>hours/week</div>
            </div>
          </div>

          <div style={{marginTop:10}}>
            <input
              type="range"
              min={1}
              max={40}
              step={1}
              value={hours}
              onChange={(e)=> setHours(parseInt(e.target.value,10))}
              style={{width:'100%'}}
              aria-label="hours per week"
            />
            <div style={{display:'flex', justifyContent:'space-between', fontSize:12, color:'#6B7280', marginTop:6}}>
              <span>1 hour</span><span>20 hours</span><span>40 hours</span>
            </div>
          </div>

          {/* # Preset buttons */}
          <div style={{display:'flex', gap:10, flexWrap:'wrap', marginTop:14}}>
            {presets.map((p)=> (
              <button
                key={p}
                type="button"
                onClick={()=> setHours(p)}
                className={p===hours ? 'btn-primary' : 'btn-outline'}
                style={{padding:'10px 16px'}}
              >
                {p} hours
              </button>
            ))}
          </div>
        </section>

        {/* # Footer actions */}
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
            onClick={()=> navigate('/add_goals/goal_summary', { state: { hours, start: location.state?.start, end: location.state?.end } })}
          >
            Continue to Goal Summary
          </button>
        </div>
      </main>
    </div>
  );
}


