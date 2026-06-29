export function fmt(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function dateFromOffset(startDate: Date, offset: number) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + offset);
  return date;
}

export function weekdayLabel(date: Date) {
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function mondayOf(date: Date) {
  const dt = new Date(date);
  const day = dt.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  dt.setDate(dt.getDate() + diff);
  return dt;
}

