'use client';

type Props = {
  avgWeight: string;
  workoutsDone: number;
  workoutsPlanned: number;
  logged: number;
};

export default function WeekStats({ avgWeight, workoutsDone, workoutsPlanned, logged }: Props) {
  return (
    <section className="card">
      <h2>This week</h2>
      <div className="stats-grid">
        <div>
          <div className="stat-num">{avgWeight}</div>
          <div className="stat-label">Avg weight</div>
        </div>
        <div>
          <div className="stat-num">{workoutsDone}/{workoutsPlanned}</div>
          <div className="stat-label">Workouts done</div>
        </div>
        <div>
          <div className="stat-num">{logged}/7</div>
          <div className="stat-label">Days logged</div>
        </div>
      </div>
    </section>
  );
}
