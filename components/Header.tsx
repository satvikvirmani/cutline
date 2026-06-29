'use client';

import type { Targets } from '@/lib/types';

type Dot = {
  key: string;
  title: string;
  status: string;
  isToday: boolean;
  selected: boolean;
};

type Props = {
  dayCount: number;
  totalDays: number;
  subtitle: string;
  dots: Dot[];
  settingsOpen: boolean;
  onToggleSettings: () => void;
  targets: Targets;
  onChangeTargets: (targets: Targets) => void;
  onSaveTargets: () => void;
  targetSavedNote: string;
  onSelectDay: (date: string) => void;
};

export default function Header({
  dayCount,
  totalDays,
  subtitle,
  dots,
  settingsOpen,
  onToggleSettings,
  targets,
  onChangeTargets,
  onSaveTargets,
  targetSavedNote,
  onSelectDay,
}: Props) {
  return (
    <header className="header-card">
      <div className="title-row">
        <h1 className="title">30-Day Cut</h1>
        <div className="day-count">Day {dayCount} of {totalDays}</div>
      </div>
      <div className="subtitle">{subtitle}</div>
      <div className="streak-row">
        {dots.map((dot) => (
          <button
            key={dot.key}
            type="button"
            title={dot.title}
            className={`dot ${dot.status} ${dot.isToday ? 'is-today' : ''} ${dot.selected ? 'selected' : ''}`}
            onClick={() => onSelectDay(dot.key)}
          />
        ))}
      </div>
      <button type="button" className="gear" onClick={onToggleSettings}>
        edit targets
      </button>
      <div className={`settings-panel ${settingsOpen ? 'open' : ''}`}>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="tgtCal">Calorie target / day</label>
            <input id="tgtCal" type="number" value={targets.calories} onChange={(e) => onChangeTargets({ ...targets, calories: Number(e.target.value) || 0 })} />
          </div>
          <div className="field">
            <label htmlFor="tgtProt">Protein target (g) / day</label>
            <input id="tgtProt" type="number" value={targets.protein} onChange={(e) => onChangeTargets({ ...targets, protein: Number(e.target.value) || 0 })} />
          </div>
          <div className="field">
            <label htmlFor="tgtWater">Water target (glasses)</label>
            <input id="tgtWater" type="number" value={targets.water} onChange={(e) => onChangeTargets({ ...targets, water: Number(e.target.value) || 0 })} />
          </div>
          <div className="field">
            <label htmlFor="tgtSteps">Steps target / day</label>
            <input id="tgtSteps" type="number" value={targets.steps} onChange={(e) => onChangeTargets({ ...targets, steps: Number(e.target.value) || 0 })} />
          </div>
        </div>
        <button type="button" className="save-btn" style={{ marginTop: '10px' }} onClick={onSaveTargets}>
          Save targets
        </button>
        <div className="saved-note">{targetSavedNote}</div>
      </div>
    </header>
  );
}
