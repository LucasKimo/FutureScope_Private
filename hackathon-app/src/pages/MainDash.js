// src/pages/MainDash.js
export default function MainDash() {
  return (
    <div className="gs-page">
      <main className="gs-container">
        {/* ===== HERO ROW ===== */}
        <section
          aria-label="goal hero"
          style={{
            background: "linear-gradient(135deg, var(--brand) 0%, #4A47D5 50%, #3C2ECF 100%)",
            color: "#fff",
            borderRadius: 20,
            boxShadow: "var(--shadow)",
            padding: 16,
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
          }}
        >
          {/* Left hero: title + three metric tiles */}
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{opacity:.9,fontWeight:700}}>Your Goal</div>
              <button className="btn-outline" style={{background:"rgba(255,255,255,.15)", color:"#fff", border:"none"}}>
                Edit Goal
              </button>
            </div>

            <h2 style={{margin:"6px 0 12px", fontSize:22, fontWeight:800}}>
              Develop AI-powered interactive storytelling platform
            </h2>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {/* Days tile */}
              <div style={{background:"rgba(255,255,255,.12)", borderRadius:14, padding:14, display:"flex", alignItems:"center", gap:12}}>
                <svg viewBox="0 0 24 24" width="28" height="28" fill="#FFD166" aria-hidden>
                  <path d="M12 2c3 4 2 6 0 8-1.3 1.3-2 2.6-2 4.1A4.9 4.9 0 0 0 15 19a5 5 0 0 0 5-5c0-2.4-1.6-4-2.8-5 .2 1.4-1 2.6-2.1 2.6 1-2 .3-4.2-3.1-5.6Z"/>
                </svg>
                <div>
                  <div style={{fontSize:24,fontWeight:800,lineHeight:1}}>1</div>
                  <div style={{opacity:.9,fontSize:12,letterSpacing:".04em",textTransform:"uppercase"}}>days</div>
                </div>
              </div>

              {/* Progress ring */}
              <div style={{background:"rgba(255,255,255,.12)", borderRadius:14, padding:14, display:"grid", placeItems:"center"}}>
                <div style={{position:"relative",width:96,height:96}}>
                  <svg viewBox="0 0 36 36" style={{width:96,height:96}}>
                    <path d="M18 2a16 16 0 1 1 0 32 16 16 0 0 1 0-32"
                          fill="none" stroke="white" strokeOpacity=".25" strokeWidth="4"/>
                    <path d="M18 2a16 16 0 0 1 0 32"
                          fill="none" stroke="white" strokeWidth="4" strokeDasharray="1 100"/>
                  </svg>
                  <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",fontSize:14}}>
                    <div style={{fontWeight:800}}>1%</div>
                    <div style={{opacity:.85,fontSize:12,marginTop:2}}>progress</div>
                  </div>
                </div>
              </div>

              {/* Target D-180 (full width across 2 cols) */}
              <div style={{gridColumn:"1 / -1", background:"rgba(255,255,255,.12)", borderRadius:14, padding:14}}>
                <div style={{fontSize:28,fontWeight:900, lineHeight:1}}>D-180</div>
                <div style={{opacity:.9,fontSize:12,letterSpacing:".04em",textTransform:"uppercase"}}>Target Date</div>
              </div>
            </div>
          </div>

          {/* Right hero: next 3 milestones card */}
          <div style={{background:"#fff", color:"#0f172a", borderRadius:14, padding:14, boxShadow:"var(--shadow)"}}>
            <h4 style={{margin:"0 0 10px", fontWeight:700}}>Next 3 Milestones</h4>
            <ul style={{listStyle:"none",margin:0,padding:0,display:"grid",gap:10}}>
              {[
                "Model selection (hosted vs local, latency & cost)",
                "Content policy & safety guardrails plan",
                "Scope, milestones, and success metrics",
              ].map((t)=>(
                <li key={t} style={{
                  display:"flex",alignItems:"center",justifyContent:"space-between",
                  border:"1px solid var(--border)",borderRadius:12,padding:"10px 12px",background:"#fff"
                }}>
                  <label style={{display:"flex",alignItems:"center",gap:10,fontSize:14}}>
                    <input type="checkbox" /> <span>{t}</span>
                  </label>
                  <span style={{color:"var(--brand)",fontWeight:700}}>→</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ===== LOWER ROW ===== */}
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:16, marginTop:16, alignItems:"start"}}>
          {/* Left: Learning Roadmap (uses your gs-card styles) */}
          <section className="gs-card" aria-label="learning roadmap" style={{margin:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <h3 style={{margin:0,fontSize:16,fontWeight:700}}>Learning Roadmap</h3>
              <a className="btn-outline" href="#" style={{borderColor:"transparent", color:"var(--brand)"}}>View Full Roadmap</a>
            </div>

            <ul style={{listStyle:"none",margin:12,padding:0,display:"grid",gap:12}}>
              {[
                {t:"Model selection (hosted vs local, latency & cost)", s:"In Progress", c:"var(--brand)"},
                {t:"Content policy & safety guardrails plan", s:"In Progress", c:"var(--brand)"},
                {t:"Scope, milestones, and success metrics", s:"In Progress", c:"var(--brand)"},
                {t:"Scene editor (nodes, edges, variables)", s:"Upcoming", c:"#CBD5E1"},
                {t:"Prompt block library (intents, constraints, style)", s:"Upcoming", c:"#CBD5E1"},
              ].map(({t,s,c})=>(
                <li key={t} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <span style={{width:10,height:10,borderRadius:"50%",background:c, marginTop:6}} />
                  <div>
                    <div style={{fontSize:14,fontWeight:600}}>{t}</div>
                    <div style={{fontSize:12, color: s==="In Progress" ? "var(--brand)" : "#94A3B8"}}>{s}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Right column cards stacked */}
          <div style={{display:"grid",gap:16}}>
            {/* Daily Insight */}
            <div className="gs-card" style={{background:"#FFF7ED", border:"1px solid #FED7AA"}}>
              <h4 style={{margin:"0 0 6px", color:"#C2410C"}}>Daily Insight</h4>
              <p style={{margin:0, color:"#9A3412"}}>
                Users who complete at least one task in their first week are 3× more likely to hit their goal. Make yours count.
              </p>
            </div>

            {/* Achievement Hub */}
            <div className="gs-card">
              <h4 style={{margin:"0 0 8px"}}>Achievement Hub</h4>
              <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                <div style={{
                  width:48,height:48,borderRadius:12,background:"var(--brand)",
                  display:"grid",placeItems:"center",color:"#fff", boxShadow:"inset 0 0 0 2px rgba(255,255,255,.15)"
                }}>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden>
                    <path d="M12 2 15 8l6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1 3-6z"/>
                  </svg>
                </div>
                <div>
                  <div style={{fontSize:14}}>You just made a first achievement! 🥳</div>
                  <div style={{fontSize:12,color:"#6B7280"}}>“Set a goal for the first time”</div>
                </div>
              </div>

              <div style={{marginTop:12, fontSize:12, fontWeight:600, color:"#475569"}}>Locked badges</div>
              <div style={{display:"flex", gap:10, marginTop:8}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{
                    width:48,height:48,borderRadius:12, background:"#E5E7EB",
                    display:"grid",placeItems:"center", position:"relative"
                  }}>
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                      <rect x="4" y="10" width="16" height="10" rx="2" fill="#9E9E9E"/>
                      <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#9E9E9E" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="15" r="1.6" fill="#757575"/>
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}