// src/components/Steps.js
import { useMemo } from 'react';

export default function Steps({ active = 1 }) {
  const steps = useMemo(() => (
    ['Your Goal', 'Knowledge', 'Commitment', 'Timeline', 'Summary']
  ), []);

  const pct = Math.min(100, Math.max(0, (active / steps.length) * 100));

  return (
    <div className="gs-steps">
      <div className="gs-steps-bar">
        <div className="gs-steps-fill" style={{ width: `${pct}%` }} />
      </div>
      <ul className="gs-steps-list" aria-label="setup steps">
        {steps.map((label, idx) => (
          <li
            key={label}
            className={idx + 1 === active ? 'active' : undefined}
          >
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}