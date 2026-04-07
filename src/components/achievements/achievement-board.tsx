"use client";

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
  achievements: Achievement;
}

interface AchievementBoardProps {
  all: Achievement[];
  unlocked: UserAchievement[];
}

export function AchievementBoard({ all, unlocked }: AchievementBoardProps) {
  const unlockedIds = new Set(unlocked.map((u) => u.achievement_id));

  const categories = [
    { key: "milestone", label: "Milestones" },
    { key: "streak", label: "Streaks" },
    { key: "hidden", label: "Hidden" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {categories.map((cat) => {
        const achievements = all.filter((a) => a.category === cat.key);
        if (achievements.length === 0) return null;

        return (
          <div key={cat.key} className="card overflow-hidden">
            <div className="border-b border-border-subtle px-4 py-2.5">
              <span className="text-xs font-semibold text-text-secondary">
                {cat.label}
              </span>
            </div>
            {achievements.map((achievement, i) => {
              const isUnlocked = unlockedIds.has(achievement.id);
              const userAchievement = unlocked.find(
                (u) => u.achievement_id === achievement.id
              );

              return (
                <div
                  key={achievement.id}
                  className={`px-4 py-3 flex items-center gap-3 ${
                    i < achievements.length - 1 ? "border-b border-border-subtle" : ""
                  } ${isUnlocked ? "" : "opacity-40"}`}
                >
                  <span className="text-lg">
                    {achievement.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isUnlocked ? "text-text-primary font-medium" : "text-text-muted"}`}>
                      {isUnlocked || achievement.category !== "hidden"
                        ? achievement.name
                        : "???"}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {isUnlocked || achievement.category !== "hidden"
                        ? achievement.description
                        : "???"}
                    </p>
                  </div>
                  {isUnlocked && userAchievement && (
                    <span className="text-[10px] text-accent tabular-nums shrink-0">
                      {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      <p className="text-xs text-text-muted text-center">
        {unlocked.length}/{all.length} unlocked
      </p>
    </div>
  );
}
