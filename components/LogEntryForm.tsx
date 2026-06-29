'use client';

import type { DayLog, Targets } from '@/lib/types';

type Props = {
  dateLabel: string;
  plannedWorkout: string;
  entry: DayLog;
  targets: Targets;
  saving: boolean;
  savedNote: string;
  onChange: (patch: Partial<DayLog>) => void;
  onSave: () => Promise<void>;
};

export default function LogEntryForm({ dateLabel, plannedWorkout, entry, targets, saving, savedNote, onChange, onSave }: Props) {
  const filledWater = Number(entry.water) || 0;

  return (
    <section className="card">
      <h2>Log entry — <span>{dateLabel}</span></h2>
      <div className="field-grid">
        <div className="field">
          <label htmlFor="inCal">Calories eaten</label>
          <input id="inCal" type="number" placeholder="e.g. 1900" value={entry.calories || ''} onChange={(e) => onChange({ calories: Number(e.target.value) || 0 })} />
        </div>
        <div className="field">
          <label htmlFor="inProt">Protein (g)</label>
          <input id="inProt" type="number" placeholder="e.g. 145" value={entry.protein || ''} onChange={(e) => onChange({ protein: Number(e.target.value) || 0 })} />
        </div>
        <div className="field">
          <label htmlFor="inWeight">Weight (kg)</label>
          <input id="inWeight" type="number" step="0.1" placeholder="e.g. 79.6" value={entry.weight || ''} onChange={(e) => onChange({ weight: Number(e.target.value) || 0 })} />
        </div>
        <div className="field">
          <label htmlFor="inWaist">Waist (cm)</label>
          <input id="inWaist" type="number" step="0.1" placeholder="e.g. 88" value={entry.waist || ''} onChange={(e) => onChange({ waist: Number(e.target.value) || 0 })} />
        </div>
      </div>

      <div className="field" style={{ marginTop: '14px' }}>
        <label>Water (tap glasses to fill, target shown by border)</label>
        <div className="water-row">
          {Array.from({ length: targets.water }, (_, index) => (
            <button
              key={index}
              type="button"
              className={`glass ${index < filledWater ? 'filled' : ''}`}
              onClick={() => onChange({ water: index + 1 })}
            />
          ))}
        </div>
      </div>

      <div className="workout-box">
        <div>
          <div className="label">Workout</div>
          <div className="plan">{plannedWorkout}</div>
        </div>
        <button type="button" className={`toggle ${entry.workoutDone ? 'on' : ''}`} onClick={() => onChange({ workoutDone: !entry.workoutDone })}>
          <div className="knob" />
        </button>
      </div>

      <div className="field" style={{ marginTop: '14px' }}>
        <label htmlFor="inNotes">Notes (optional — how face/belly looks, energy, cravings...)</label>
        <textarea id="inNotes" placeholder="e.g. less puffy this morning, slept 6hrs" value={entry.notes} onChange={(e) => onChange({ notes: e.target.value })} />
      </div>

      <button type="button" className="save-btn" onClick={() => void onSave()}>
        {saving ? 'Saving...' : 'Save this day'}
      </button>
      <div className="saved-note">{savedNote}</div>
    </section>
  );
}
