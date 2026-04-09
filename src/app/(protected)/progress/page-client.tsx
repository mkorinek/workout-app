"use client";

import { useTranslations } from "next-intl";
import { useCached } from "@/lib/cache/use-cached";
import { getPersonalRecords } from "@/actions/records";
import { getAchievements } from "@/actions/achievements";
import { getProfile, getStreakData } from "@/actions/profile";
import { getExercises } from "@/actions/exercises";
import type {
  RecordsData,
  AchievementsData,
  ProfileData,
  ExercisesData,
  StreakData,
} from "@/lib/cache/app-store";
import { getNextRank } from "@/lib/utils";
import { PRBoard } from "@/components/progress/pr-board";
import { AchievementBoard } from "@/components/achievements/achievement-board";
import { WeeklyStreakSection } from "@/components/progress/weekly-streak";
import { ProgressClient } from "./client";

interface Props {
  initialRecords: RecordsData;
  initialAchievements: AchievementsData;
  initialProfile: ProfileData;
  initialExercises: ExercisesData;
  initialStreakData: StreakData;
}

export function ProgressPageClient({
  initialRecords,
  initialAchievements,
  initialProfile,
  initialExercises,
  initialStreakData,
}: Props) {
  const t = useTranslations("progress");
  const tc = useTranslations("common");
  const records = useCached("records", getPersonalRecords, initialRecords) ?? [];
  const achievements = useCached("achievements", getAchievements, initialAchievements) ?? { all: [], unlocked: [] };
  const profile = useCached("profile", getProfile, initialProfile);
  const exercises = useCached("exercises", getExercises, initialExercises) ?? [];
  const streakData = useCached("streakData", getStreakData, initialStreakData);

  const totalVolume = Number(profile?.total_volume_kg ?? 0);
  const currentRank = (profile?.lifter_rank as string) ?? "ROOKIE";
  const nextRank = getNextRank(currentRank);
  const exerciseNames = exercises.map((e: { name: string }) => e.name);
  const savedTracked = (profile as { tracked_exercises?: string[] } | null)?.tracked_exercises ?? [];

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-lg font-bold text-text-primary mb-6">
        {t("title")}
      </h1>

      {/* Rank progress */}
      <div className="mb-6">
        <p className="text-xs font-medium text-text-secondary mb-3">
          {t("lifterRank")}
        </p>
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-accent/20 bg-accent/[0.04]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/60">
              {t("current")}
            </span>
            {nextRank && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/60">
                {t("next")}
              </span>
            )}
          </div>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-accent text-sm font-bold">
                {currentRank}
              </span>
              {nextRank && (
                <span className="text-sm text-text-muted font-medium">
                  {nextRank.name}
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mb-3">
              {t("totalVolume")} <span className="text-accent font-medium tabular-nums">{totalVolume.toLocaleString()} {tc("kg")}</span>
            </p>
            {nextRank && (
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (totalVolume / nextRank.volumeNeeded) * 100)}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly streak */}
      {streakData && (
        <div className="mb-6">
          <p className="text-xs font-medium text-text-secondary mb-3">
            {t("weeklyStreak")}
          </p>
          <WeeklyStreakSection
            currentStreak={streakData.currentStreak}
            workoutsThisWeek={streakData.workoutsThisWeek}
            weeklyGoal={streakData.weeklyWorkoutGoal}
          />
        </div>
      )}

      {/* Charts */}
      <div className="mb-6">
        <p className="text-xs font-medium text-text-secondary mb-3">
          {t("exerciseProgress")}
        </p>
        <ProgressClient exerciseNames={exerciseNames} savedTracked={savedTracked} />
      </div>

      {/* PRs */}
      <div className="mb-6">
        <PRBoard records={records as { id: string; exercise_name: string; record_type: string; value: number; achieved_at: string }[]} />
      </div>

      {/* Achievements */}
      <div>
        <p className="text-xs font-medium text-text-secondary mb-3">
          {t("achievements")}
        </p>
        <AchievementBoard
          all={achievements.all as { id: string; name: string; description: string; category: string; icon: string }[]}
          unlocked={achievements.unlocked as { achievement_id: string; unlocked_at: string; achievements: { id: string; name: string; description: string; category: string; icon: string } }[]}
        />
      </div>
    </div>
  );
}
