"use client";

import { getStreakColor } from "@/lib/streak";

interface WeeklyStreakSectionProps {
  currentStreak: number;
  workoutsThisWeek: number;
  weeklyGoal: number;
}

export function WeeklyStreakSection({
  currentStreak,
  workoutsThisWeek,
  weeklyGoal,
}: WeeklyStreakSectionProps) {
  const color = getStreakColor(currentStreak);
  const weekComplete = workoutsThisWeek >= weeklyGoal;
  const progressWidth = Math.min(100, (workoutsThisWeek / weeklyGoal) * 100);

  return (
    <div className="card p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-text-secondary">
          Weekly Streak
        </p>
        {weekComplete && (
          <span className="text-[10px] font-semibold" style={{ color }}>
            Week complete
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span
          className="text-3xl font-bold tabular-nums"
          style={{ color }}
        >
          {currentStreak}
        </span>
        <span className="text-sm text-text-muted">
          {currentStreak === 1 ? "week" : "weeks"}
        </span>
      </div>

      <div className="mb-2">
        <span className="text-xs text-text-muted">
          This week: {workoutsThisWeek}/{weeklyGoal}
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5">
        {Array.from({ length: weeklyGoal }).map((_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-full transition-colors"
            style={{
              backgroundColor: i < workoutsThisWeek ? color : "var(--color-border)",
            }}
          />
        ))}
      </div>

      <div className="h-1 bg-border rounded-full mt-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progressWidth}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
