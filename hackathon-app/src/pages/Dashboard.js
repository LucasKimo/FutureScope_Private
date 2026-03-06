import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { hydrateLastRoadmapFromServer, readAllGoals, setActiveGoalId, deleteGoal } from '../services/persist';

function calcGoalProgress(goal) {
  const categories = goal?.roadmap?.categories || [];
  const items = categories.flatMap((c) => c.items || []);
  const total = items.length;
  const checked = goal?.checked || {};
  const done = items.filter((it) => checked[it.id]).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { total, done, pct };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [goals, setGoals] = useState(() => readAllGoals());
  const [loading, setLoading] = useState(true);
  const [selectedGoals, setSelectedGoals] = useState(new Set());
  const [deleteMode, setDeleteMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      try {
        if (token) await hydrateLastRoadmapFromServer(token);
      } finally {
        if (active) {
          setGoals(readAllGoals());
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      active = false;
    };
  }, [token]);

  const rows = useMemo(() => {
    return (goals || []).map((g) => ({
      ...g,
      progress: calcGoalProgress(g)
    }));
  }, [goals]);

  const handleSelectGoal = (goalId) => {
    const newSelected = new Set(selectedGoals);
    if (newSelected.has(goalId)) {
      newSelected.delete(goalId);
    } else {
      newSelected.add(goalId);
    }
    setSelectedGoals(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedGoals.size === 0) return;
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    for (const goalId of selectedGoals) {
      await deleteGoal(goalId, token);
    }
    setGoals(readAllGoals());
    setSelectedGoals(new Set());
    setDeleteMode(false);
    setShowDeleteConfirm(false);
  };

  const handleCancelConfirm = () => {
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = () => {
    setDeleteMode(false);
    setSelectedGoals(new Set());
  };

  return (
    <div className="gs-page gs-page--top">
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 700 }}>
              Delete Goals?
            </h2>
            <p style={{ margin: '0 0 24px', color: '#666', fontSize: '14px' }}>
              Are you sure you want to delete {selectedGoals.size} goal(s)? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={handleCancelConfirm}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e5e5e5',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="gs-container" style={{ maxWidth: 900, width: '100%' }}>
        <header className="gs-hero">
          <h1>Your Goals</h1>
          <p className="gs-sub" style={{ marginTop: 8 }}>
            Select a goal to view progress and continue your roadmap.
          </p>
        </header>

        <section className="gs-card goal-section" style={{ marginTop: 16 }}>
          {loading ? (
            <div style={{ color: 'var(--muted)', fontWeight: 700 }}>Loading goals...</div>
          ) : rows.length ? (
            <ul className="goal-list">
              {rows.map((g) => (
                <li key={g.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {deleteMode && (
                    <input
                      type="checkbox"
                      checked={selectedGoals.has(g.id)}
                      onChange={() => handleSelectGoal(g.id)}
                      style={{ cursor: 'pointer' }}
                    />
                  )}
                  <button
                    type="button"
                    className="goal-row"
                    style={{ flex: 1 }}
                    onClick={async () => {
                      if (deleteMode) {
                        handleSelectGoal(g.id);
                      } else {
                        await setActiveGoalId(g.id, token);
                        navigate('/main_dashboard');
                      }
                    }}
                  >
                    <div className="goal-row-main">
                      <div className="goal-row-title">{g.goal || 'Untitled goal'}</div>
                      <div className="goal-row-sub">
                        {g.progress.total
                          ? `${g.progress.done}/${g.progress.total} milestones complete`
                          : 'No roadmap milestones yet.'}
                      </div>
                    </div>
                    <div className="goal-row-meta">{g.progress.pct}%</div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ color: 'var(--muted)' }}>
              No saved goals yet. Create one to get started.
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            {deleteMode ? (
              <>
                <button 
                  className="btn-secondary"
                  type="button" 
                  onClick={handleDeleteSelected}
                  disabled={selectedGoals.size === 0}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: selectedGoals.size === 0 ? '#ccc' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: selectedGoals.size === 0 ? 'not-allowed' : 'pointer',
                    fontWeight: 600
                  }}
                >
                  Delete Selected ({selectedGoals.size})
                </button>
                <button 
                  className="btn-secondary"
                  type="button" 
                  onClick={handleCancelDelete}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn-secondary"
                  type="button" 
                  onClick={() => setDeleteMode(true)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Delete Goals
                </button>
                <button className="btn-primary" type="button" onClick={() => navigate('/add_goals')}>
                  Create New Goal
                </button>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
