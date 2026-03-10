import { useMemo } from 'react';
import './roadmap-checklist.css';

function calcProgress(checked, categories) {
  const items = categories.flatMap(c => c.items);
  const total = items.length;
  const done = items.filter(it => checked[it.id]).length;
  return { total, done, pct: Math.round((done / (total || 1)) * 100) };
}

export default function RoadmapChecklist({ roadmap, checked, onToggle, onExport, onImport }) {
  const categories = useMemo(
    () => roadmap?.categories ?? [],
    [roadmap]
  );

  useMemo(
    () => calcProgress(checked, categories),
    [checked, categories]
  );

  const numbered = useMemo(() => {
    return categories.map((c, i) => ({
      ...c,
      level: i + 1,
    }));
  }, [categories]);

  return (
    <div className="rc-wrap">
      <div className="rc-head">
        <div />
        <div className="rc-progress">
          {/* <div className="rc-progress-num">{pct}%</div>
          <div className="rc-progress-sub">Complete</div> */}
        </div>
      </div>

      <div className="rc-grid">
        {numbered.map((cat) => (
          <div key={cat.name} className="rc-card">
            <div className="rc-card-head">
              <div className="rc-level">{cat.level}</div>
              <div className="rc-title">{cat.name}</div>
            </div>

            <ul className="rc-list">
              {cat.items.map((it) => (
                <li key={it.id} className="rc-item">
                  <label className="rc-check">
                    <input
                      type="checkbox"
                      checked={!!checked[it.id]}
                      onChange={() => onToggle(it.id)}
                    />
                    <span className="rc-box" aria-hidden="true" />
                    <span className="rc-label">{it.label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}