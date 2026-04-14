// src/components/Steps.js
import { useMemo } from 'react';

export default function Steps({ active = 1, onStepClick }) {
  const steps = useMemo(() => (
    ['Your Goal', 'Knowledge', 'Timeline', 'Commitment', 'Summary']
  ), []);

  const pct = Math.min(100, Math.max(0, (active / steps.length) * 100));

  return (
    <div className="gs-steps">
      <div className="gs-steps-bar">
        <div className="gs-steps-fill" style={{ width: `${pct}%` }} />
      </div>
      <ul className="gs-steps-list" aria-label="setup steps">
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isCurrent = stepNum === active;
          const isDone = stepNum < active;
          const isLocked = stepNum > active;

          let className = undefined;
          if (isCurrent) className = 'active';
          else if (isLocked) className = 'locked';
          else if (isDone) className = 'done';

          return (
            <li key={label} className={className}>
              {isDone && onStepClick ? (
                <button
                  type="button"
                  className="gs-step-btn"
                  onClick={() => onStepClick(stepNum)}
                >
                  {label}
                </button>
              ) : (
                label
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
