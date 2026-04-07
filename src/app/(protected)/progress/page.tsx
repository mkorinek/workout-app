import { getPersonalRecords } from "@/actions/records";
import { getAchievements } from "@/actions/achievements";
import { getProfile, getStreakData } from "@/actions/profile";
import { getExercises } from "@/actions/exercises";
import { ProgressPageClient } from "./page-client";

export default async function ProgressPage() {
  const [records, achievements, profile, exercises, streakData] = await Promise.all([
    getPersonalRecords(),
    getAchievements(),
    getProfile(),
    getExercises(),
    getStreakData(),
  ]);

  return (
    <ProgressPageClient
      initialRecords={records}
      initialAchievements={achievements}
      initialProfile={profile}
      initialExercises={exercises}
      initialStreakData={streakData}
    />
  );
}
