"use client";

import { useTranslations } from "next-intl";

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
  const t = useTranslations("streak");
  const weekComplete = workoutsThisWeek >= weeklyGoal;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-accent/20 bg-accent/[0.04]">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/60">
          {t("streak")}
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/60">
          {t("thisWeek")}
        </span>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tabular-nums text-accent">
              {currentStreak}
            </span>
            <span className="text-sm text-text-muted">
              {t("week", { count: currentStreak })}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-medium tabular-nums text-accent">
              {workoutsThisWeek}/{weeklyGoal}
            </span>
            {weekComplete && (
              <span className="text-[10px] font-semibold text-accent ml-1">
                ✓
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5">
          {Array.from({ length: weeklyGoal }).map((_, i) => (
            <div
              key={i}
              className="h-2 flex-1 rounded-full transition-colors"
              style={{
                backgroundColor:
                  i < workoutsThisWeek
                    ? "var(--color-accent)"
                    : "var(--color-border)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
