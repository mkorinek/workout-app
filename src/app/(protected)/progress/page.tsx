import { getPersonalRecords } from "@/actions/records";
import { getAchievements } from "@/actions/achievements";
import { getProfile, getStreakData } from "@/actions/profile";
import { getExercises } from "@/actions/exercises";
import { PRBoard } from "@/components/progress/pr-board";
import { AchievementBoard } from "@/components/achievements/achievement-board";
import { WeeklyStreakSection } from "@/components/progress/weekly-streak";
import { ProgressClient } from "./client";
import { getRankFromVolume, getNextRank } from "@/lib/utils";

export default async function ProgressPage() {
  const [records, achievements, profile, exercises, streakData] = await Promise.all([
    getPersonalRecords(),
    getAchievements(),
    getProfile(),
    getExercises(),
    getStreakData(),
  ]);

  const totalVolume = Number(profile?.total_volume_kg ?? 0);
  const currentRank = getRankFromVolume(totalVolume);
  const nextRank = getNextRank(currentRank);
  const exerciseNames = exercises.map((e: { name: string }) => e.name);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-xs text-term-green uppercase tracking-widest mb-6">
        &gt; progress
      </h1>

      {/* Rank progress */}
      <div className="border border-term-gray p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-term-green text-sm font-bold">
            [{currentRank}@gym]$
          </span>
          {nextRank && (
            <span className="text-[10px] text-term-gray-light uppercase tracking-widest">
              next: {nextRank.name}
            </span>
          )}
        </div>
        <p className="text-[10px] text-term-gray-light mb-2">
          total volume: {totalVolume.toLocaleString()} kg
        </p>
        {nextRank && (
          <div className="h-1 bg-term-gray">
            <div
              className="h-full bg-term-green transition-all"
              style={{
                width: `${Math.min(100, (totalVolume / nextRank.volumeNeeded) * 100)}%`,
              }}
            />
          </div>
        )}
      </div>

      {/* Weekly streak */}
      {streakData && (
        <WeeklyStreakSection
          currentStreak={streakData.currentStreak}
          workoutsThisWeek={streakData.workoutsThisWeek}
          weeklyGoal={streakData.weeklyWorkoutGoal}
        />
      )}

      {/* Charts */}
      <div className="mb-6">
        <p className="text-[10px] text-term-gray-light uppercase tracking-widest mb-3">
          exercise progress
        </p>
        <ProgressClient exerciseNames={exerciseNames} />
      </div>

      {/* PRs */}
      <div className="mb-6">
        <PRBoard records={records as { id: string; exercise_name: string; record_type: string; value: number; achieved_at: string }[]} />
      </div>

      {/* Achievements */}
      <div>
        <p className="text-[10px] text-term-gray-light uppercase tracking-widest mb-3">
          achievements
        </p>
        <AchievementBoard
          all={achievements.all as { id: string; name: string; description: string; category: string; icon: string }[]}
          unlocked={achievements.unlocked as { achievement_id: string; unlocked_at: string; achievements: { id: string; name: string; description: string; category: string; icon: string } }[]}
        />
      </div>
    </div>
  );
}
