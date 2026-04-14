import { useState, useEffect } from 'react';
import { getRoadmap } from '../services/roadmapApi';
import { useNavigate, useLocation } from 'react-router-dom';
import Steps from '../components/Steps';

export default function AddGoals() {
  const navigate = useNavigate();
  const location = useLocation();

  const [goal, setGoal] = useState('');

  useEffect(() => {
    if (location.state?.goal) setGoal(location.state.goal);
  }, [location.state]);
  const [loading, setLoading] = useState(false); 

  // Continue 클릭 시: 자동 생성 → localStorage 저장 → Knowledge로 이동
  const handleContinue = async () => {
    const g = goal.trim();
    if (!g) {
      alert('Please enter your goal.');
      return;
    }
    setLoading(true);
    try {
      // AI로 체크리스트 생성
      const roadmap = await getRoadmap(g);
      console.log(roadmap)
      const checked = {};

      // Move to next page
      navigate('/add_goals/previous_knowledge', {
        state: {
          flow: { goal: g, roadmap, checked, estimate: null }
        }
      });
    } catch (e) {
      alert(e.message || 'Failed to generate checklist. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gs-page-add-goals">
      <main className="gs-container">
        <Steps active={1} />

        <header className="gs-hero">
          <h1>What’s Your <span style={{color:'var(--brand)'}}>Visionary Goal</span>?</h1>
          <p className="gs-sub">Tell us your visionary goal — where do you want your story or career to be in the future?</p>
          <p className="gs-sub" style={{marginTop:4}}>Dream big! We’ll help you create a personalized roadmap to turn your vision into reality.</p>
        </header>

        <section className="gs-card" style={{maxWidth:940}}>
          <label style={{display:'block', fontSize:13, fontWeight:700, marginBottom:8}}>Your Main Goal</label>
          <textarea
            value={goal}
            onChange={(e)=> setGoal(e.target.value)}
            rows={3}
            placeholder="Describe your main goal here..."
            className="goal-input"
            style={{
              width:'100%', padding:'14px 12px', border:'1px solid var(--border)', borderRadius:12,
              background:'#fff', fontSize:14, resize:'vertical'
            }}
          />
        </section>


        <div className="gs-actions" style={{marginTop:24}}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleContinue}
            disabled={loading}
            title={loading ? 'Generating checklist…' : 'Go to Knowledge'}
          >
            {loading ? 'Preparing…' : 'Continue to Knowledge'}


          </button>
        </div>
      </main>
    </div>
  );
}
