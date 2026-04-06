/**
 * Weekly streak utilities.
 *
 * A "week" starts on the user's chosen day (0 = Sunday, 1 = Monday).
 * We identify each week by the ISO date of its start day (e.g. "2026-03-30").
 */

/** Get the start-of-week date for a given date and week start day. */
export function getWeekStartDate(date: Date, weekStartDay: number): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = (day - weekStartDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d.toISOString().split("T")[0];
}

/** Get the week start date for the week before the given week start. */
export function getPreviousWeekStart(weekStart: string, weekStartDay: number): string {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() - 7);
  return getWeekStartDate(d, weekStartDay);
}

/** Get the week-end date (exclusive) for a given week start. */
export function getWeekEndDate(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + 7);
  return d.toISOString().split("T")[0];
}

/** Milestone color thresholds. */
const STREAK_COLORS = [
  { min: 52, color: "#00ffff" }, // cyan — legendary
  { min: 26, color: "#ff3333" }, // red — hot
  { min: 12, color: "#ff6600" }, // orange
  { min: 4, color: "#ffb000" },  // amber
  { min: 0, color: "#00ff41" },  // green — default
] as const;

export function getStreakColor(weeks: number): string {
  for (const { min, color } of STREAK_COLORS) {
    if (weeks >= min) return color;
  }
  return "#00ff41";
}

/**
 * Compute the display streak — accounts for missed weeks.
 * If the last completed week is not the current or previous week,
 * the streak has already broken and should show 0.
 */
export function computeDisplayStreak(
  currentStreak: number,
  lastCompletedWeek: string | null,
  weekStartDay: number,
  now: Date = new Date()
): number {
  if (!lastCompletedWeek || currentStreak === 0) return 0;
  const currentWeek = getWeekStartDate(now, weekStartDay);
  const previousWeek = getPreviousWeekStart(currentWeek, weekStartDay);
  if (lastCompletedWeek === currentWeek || lastCompletedWeek === previousWeek) {
    return currentStreak;
  }
  return 0;
}
