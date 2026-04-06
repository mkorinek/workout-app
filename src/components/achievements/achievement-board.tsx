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
    { key: "milestone", label: "milestones" },
    { key: "streak", label: "streaks" },
    { key: "hidden", label: "hidden" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {categories.map((cat) => {
        const achievements = all.filter((a) => a.category === cat.key);
        if (achievements.length === 0) return null;

        return (
          <div key={cat.key} className="border border-term-gray">
            <div className="border-b border-term-gray px-3 py-2">
              <span className="text-[10px] text-term-green uppercase tracking-widest">
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
                  className={`px-3 py-2 flex items-center gap-3 ${
                    i < achievements.length - 1 ? "border-b border-term-gray" : ""
                  } ${isUnlocked ? "" : "opacity-40"}`}
                >
                  <span
                    className={`text-base font-bold ${
                      isUnlocked ? "text-term-amber" : "text-term-gray"
                    }`}
                  >
                    {achievement.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs ${
                        isUnlocked ? "text-term-white" : "text-term-gray-light"
                      }`}
                    >
                      {isUnlocked || achievement.category !== "hidden"
                        ? achievement.name
                        : "???"}
                    </p>
                    <p className="text-[10px] text-term-gray-light truncate">
                      {isUnlocked || achievement.category !== "hidden"
                        ? achievement.description
                        : "???"}
                    </p>
                  </div>
                  {isUnlocked && userAchievement && (
                    <span className="text-[10px] text-term-green tabular-nums shrink-0">
                      {new Date(userAchievement.unlocked_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      <p className="text-[10px] text-term-gray-light text-center">
        {unlocked.length}/{all.length} unlocked
      </p>
    </div>
  );
}
