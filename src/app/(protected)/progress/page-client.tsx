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
import { PRBoard } from "@/components/progress/pr-board";
import { RankCard } from "@/components/rank-card";
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
  const records = useCached("records", getPersonalRecords, initialRecords) ?? [];
  const achievements = useCached("achievements", getAchievements, initialAchievements) ?? { all: [], unlocked: [] };
  const profile = useCached("profile", getProfile, initialProfile);
  const exercises = useCached("exercises", getExercises, initialExercises) ?? [];
  const streakData = useCached("streakData", getStreakData, initialStreakData);

  const totalVolume = Number(profile?.total_volume_kg ?? 0);
  const currentRank = (profile?.lifter_rank as string) ?? "ROOKIE";
  const displayName = (profile as { display_name?: string } | null)?.display_name ?? "";
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
        <RankCard
          rank={currentRank}
          totalVolumeKg={totalVolume}
          displayName={displayName}
        />
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
