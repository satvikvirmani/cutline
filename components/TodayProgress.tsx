'use client';

import type { DayLog, Targets } from '@/lib/types';

type Props = {
  entry: DayLog;
  targets: Targets;
};

function bar(value: number, target: number, higherIsBetter: boolean) {
  const pct = Math.min(100, ((value / target) * 100) || 0);
  const className = higherIsBetter
    ? value >= target
      ? 'fill-green'
      : value >= target * 0.8
        ? 'fill-amber'
        : 'fill-coral'
    : value <= target * 1.05
      ? 'fill-green'
      : value <= target * 1.2
        ? 'fill-amber'
        : 'fill-coral';

  return { pct, className };
}

export default function TodayProgress({ entry, targets }: Props) {
  const calories = bar(entry.calories || 0, targets.calories, false);
  const protein = bar(entry.protein || 0, targets.protein, true);

  return (
    <section className="card">
      <h2>Today's progress</h2>
      <div className="bar-row">
        <div className="bar-label">
          <span>Calories</span>
          <b>{entry.calories || 0} / {targets.calories}</b>
        </div>
        <div className="bar-track">
          <div className={`bar-fill ${calories.className}`} style={{ width: `${calories.pct}%` }} />
        </div>
      </div>
      <div className="bar-row">
        <div className="bar-label">
          <span>Protein</span>
          <b>{entry.protein || 0} / {targets.protein}g</b>
        </div>
        <div className="bar-track">
          <div className={`bar-fill ${protein.className}`} style={{ width: `${protein.pct}%` }} />
        </div>
      </div>
    </section>
  );
}
