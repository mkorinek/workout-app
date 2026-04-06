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

  // ASCII progress bar: filled blocks + empty blocks
  const barLength = weeklyGoal;
  const filled = Math.min(workoutsThisWeek, weeklyGoal);
  const bar = "\u2588".repeat(filled) + "\u2591".repeat(barLength - filled);

  return (
    <div className="border border-term-gray p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] text-term-gray-light uppercase tracking-widest">
          weekly streak
        </p>
        {weekComplete && (
          <span className="text-[10px] uppercase tracking-widest" style={{ color }}>
            week complete
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-3 mb-3">
        <span
          className="text-3xl font-bold tabular-nums"
          style={{ color }}
        >
          {currentStreak}
        </span>
        <span className="text-xs text-term-gray-light">
          {currentStreak === 1 ? "week" : "weeks"}
        </span>
      </div>

      <div className="mb-1">
        <span className="text-xs text-term-gray-light">
          this week: {workoutsThisWeek}/{weeklyGoal}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="text-sm font-mono tracking-[0.2em]"
          style={{ color: weekComplete ? color : "#555" }}
        >
          {bar}
        </span>
      </div>

      <div className="h-1 bg-term-gray mt-2">
        <div
          className="h-full transition-all"
          style={{ width: `${progressWidth}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
