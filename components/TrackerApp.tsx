'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Header from '@/components/Header';
import LogEntryForm from '@/components/LogEntryForm';
import TodayProgress from '@/components/TodayProgress';
import WeekStats from '@/components/WeekStats';
import { dateFromOffset, fmt, mondayOf, weekdayLabel } from '@/lib/dates';
import { STORAGE_CHANGE_EVENT, getItem, setItem } from '@/lib/storage';
import { WORKOUT_PLAN } from '@/lib/workoutPlan';
import type { DayLog, Targets } from '@/lib/types';

const DAYS_TOTAL = 30;

const DEFAULT_TARGETS: Targets = {
  calories: 1950,
  protein: 145,
  water: 14,
  steps: 9000,
};

const EMPTY_LOG: DayLog = {
  calories: 0,
  protein: 0,
  weight: 0,
  waist: 0,
  water: 0,
  workoutDone: false,
  notes: '',
};

function parseTargets(raw: string | null) {
  if (!raw) return DEFAULT_TARGETS;
  try {
    const parsed = JSON.parse(raw) as Partial<Targets>;
    return {
      calories: Number(parsed.calories) || DEFAULT_TARGETS.calories,
      protein: Number(parsed.protein) || DEFAULT_TARGETS.protein,
      water: Number(parsed.water) || DEFAULT_TARGETS.water,
      steps: Number(parsed.steps) || DEFAULT_TARGETS.steps,
    };
  } catch {
    return DEFAULT_TARGETS;
  }
}

function parseLog(raw: string | null) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<DayLog>;
    return {
      calories: Number(parsed.calories) || 0,
      protein: Number(parsed.protein) || 0,
      weight: Number(parsed.weight) || 0,
      waist: Number(parsed.waist) || 0,
      water: Number(parsed.water) || 0,
      workoutDone: Boolean(parsed.workoutDone),
      notes: typeof parsed.notes === 'string' ? parsed.notes : '',
    };
  } catch {
    return null;
  }
}

function dayStatusClass(entry: DayLog | null, targets: Targets) {
  if (!entry) return '';
  const calOk = entry.calories && entry.calories <= targets.calories * 1.1;
  const protOk = entry.protein && entry.protein >= targets.protein * 0.85;
  if (calOk && protOk) return 'logged-good';
  if (entry.calories || entry.protein) return entry.calories > targets.calories * 1.25 ? 'logged-bad' : 'logged-over';
  return '';
}

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

export default function TrackerApp() {
  const [targets, setTargets] = useState<Targets>(DEFAULT_TARGETS);
  const [targetDraft, setTargetDraft] = useState<Targets>(DEFAULT_TARGETS);
  const [dayLogs, setDayLogs] = useState<Record<string, DayLog>>({});
  const [selectedDate, setSelectedDate] = useState(() => fmt(startOfToday()));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [savedNote, setSavedNote] = useState('');
  const [targetSavedNote, setTargetSavedNote] = useState('');
  const [savingDay, setSavingDay] = useState(false);
  const [draft, setDraft] = useState<DayLog>(EMPTY_LOG);
  const previousDateRef = useRef(selectedDate);

  const startDate = useMemo(() => startOfToday(), []);
  const selectedEntry = dayLogs[selectedDate] ?? null;
  const selectedDay = new Date(selectedDate);
  const dayCount = Math.round((selectedDay.getTime() - startDate.getTime()) / 86400000) + 1;

  const dots = useMemo(() => {
    return Array.from({ length: DAYS_TOTAL }, (_, index) => {
      const date = dateFromOffset(startDate, index);
      const key = fmt(date);
      return {
        key,
        title: weekdayLabel(date),
        status: dayStatusClass(dayLogs[key] ?? null, targets),
        isToday: key === fmt(startDate),
        selected: key === selectedDate,
      };
    });
  }, [dayLogs, selectedDate, startDate, targets]);

  useEffect(() => {
    let active = true;

    async function load() {
      const [targetValue, entries] = await Promise.all([
        getItem('targets'),
        Promise.all(Array.from({ length: DAYS_TOTAL }, (_, index) => getItem(`daylog:${fmt(dateFromOffset(startDate, index))}`))),
      ]);

      if (!active) return;

      const nextTargets = parseTargets(targetValue);
      const nextLogs: Record<string, DayLog> = {};
      entries.forEach((value, index) => {
        const log = parseLog(value);
        if (log) {
          nextLogs[fmt(dateFromOffset(startDate, index))] = log;
        }
      });

      setTargets(nextTargets);
      setTargetDraft(nextTargets);
      setDayLogs(nextLogs);
    }

    void load();

    const onChange = () => {
      void load();
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, onChange);
    return () => {
      active = false;
      window.removeEventListener(STORAGE_CHANGE_EVENT, onChange);
    };
  }, [startDate]);

  useEffect(() => {
    const entry = selectedEntry ?? EMPTY_LOG;
    setDraft(entry);
    if (previousDateRef.current !== selectedDate) {
      setSavedNote('');
    }
    previousDateRef.current = selectedDate;
  }, [selectedDate, selectedEntry]);

  async function saveTargets(next: Targets) {
    setTargets(next);
    setTargetDraft(next);
    try {
      await setItem('targets', JSON.stringify(next));
      setTargetSavedNote('Targets saved ✓');
    } catch {
      setTargetSavedNote('Could not save targets — try again');
    }
  }

  async function saveDay() {
    setSavingDay(true);
    try {
      const payload: DayLog = {
        calories: Number(draft.calories) || 0,
        protein: Number(draft.protein) || 0,
        weight: Number(draft.weight) || 0,
        waist: Number(draft.waist) || 0,
        water: Number(draft.water) || 0,
        workoutDone: Boolean(draft.workoutDone),
        notes: draft.notes || '',
      };

      const key = `daylog:${selectedDate}`;
      setDayLogs((current) => ({ ...current, [selectedDate]: payload }));
      setSavedNote('Saved ✓');
      await setItem(key, JSON.stringify(payload));
    } catch {
      setSavedNote('Could not save — try again');
    } finally {
      setSavingDay(false);
    }
  }

  function updateDraft(patch: Partial<DayLog>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  const weekStats = useMemo(() => {
    const mon = mondayOf(new Date(selectedDate));

    let weights: number[] = [];
    let workoutsPlanned = 0;
    let workoutsDone = 0;
    let logged = 0;

    for (let i = 0; i < 7; i += 1) {
      const d = new Date(mon);
      d.setDate(d.getDate() + i);
      const key = fmt(d);
      const entry = dayLogs[key];
      if (d.getDay() !== 0) workoutsPlanned += 1;
      if (entry) {
        logged += 1;
        if (entry.weight) weights.push(entry.weight);
        if (entry.workoutDone) workoutsDone += 1;
      }
    }

    return {
      avgWeight: weights.length ? (weights.reduce((sum, weight) => sum + weight, 0) / weights.length).toFixed(1) + 'kg' : '—',
      workoutsDone,
      workoutsPlanned,
      logged,
    };
  }, [dayLogs, selectedDate]);

  return (
    <div className="wrap">
      <Header
        dayCount={Number.isFinite(dayCount) ? dayCount : 1}
        totalDays={DAYS_TOTAL}
        subtitle="Fat loss · belly & waist · face structure — log it daily, the dots fill in as you go."
        dots={dots}
        settingsOpen={settingsOpen}
        onToggleSettings={() => setSettingsOpen((value) => !value)}
        targets={targetDraft}
        onChangeTargets={(next) => {
          setTargetDraft(next);
          setTargetSavedNote('');
        }}
        onSaveTargets={() => void saveTargets(targetDraft)}
        targetSavedNote={targetSavedNote}
        onSelectDay={setSelectedDate}
      />

      <TodayProgress entry={draft} targets={targets} />

      <LogEntryForm
        dateLabel={weekdayLabel(selectedDay)}
        plannedWorkout={WORKOUT_PLAN[selectedDay.getDay()]}
        entry={draft}
        targets={targets}
        saving={savingDay}
        savedNote={savedNote}
        onChange={updateDraft}
        onSave={saveDay}
      />

      <WeekStats avgWeight={weekStats.avgWeight} workoutsDone={weekStats.workoutsDone} workoutsPlanned={weekStats.workoutsPlanned} logged={weekStats.logged} />
    </div>
  );
}
