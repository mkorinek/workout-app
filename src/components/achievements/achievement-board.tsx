"use client";

import { useTranslations, useLocale } from "next-intl";
import { AchievementIcon } from "@/components/achievement-icons";

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  condition_type?: string;
}

function getHiddenDescriptionKey(conditionType?: string): string {
  switch (conditionType) {
    case "workout_after_midnight": return "afterMidnight";
    case "workout_duration_minutes": return "over2Hours";
    case "exercises_in_session": return "oneExercise";
    case "sets_in_session": return "hundredSets";
    default: return "secretUnlocked";
  }
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
  const t = useTranslations("achievements");
  const locale = useLocale();
  const unlockedIds = new Set(unlocked.map((u) => u.achievement_id));

  const categories = [
    { key: "milestone", label: t("milestones") },
    { key: "streak", label: t("streaks") },
    { key: "hidden", label: t("hidden") },
  ];

  return (
    <div className="flex flex-col gap-4">
      {categories.map((cat) => {
        const achievements = all.filter((a) => a.category === cat.key);
        if (achievements.length === 0) return null;

        return (
          <div key={cat.key} className="card overflow-hidden">
            {/* Header — matches PR board style */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-accent/20 bg-accent/[0.04]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/60">
                {cat.label}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/60">
                {t("unlocked")}
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
                  className={`px-4 py-2.5 flex items-center gap-3 ${
                    i < achievements.length - 1 ? "border-b border-border-subtle" : ""
                  } ${isUnlocked ? "" : "opacity-40"}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isUnlocked ? "bg-accent/10 text-accent" : "bg-surface-elevated text-text-muted"
                  }`}>
                    <AchievementIcon
                      name={achievement.name}
                      icon={achievement.icon}
                      size={18}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isUnlocked ? "text-accent font-medium" : "text-text-muted"}`}>
                      {isUnlocked || achievement.category !== "hidden"
                        ? achievement.name
                        : t("hiddenPlaceholder")}
                    </p>
                    <p className="text-xs text-text-muted truncate">
                      {achievement.category !== "hidden"
                        ? achievement.description
                        : isUnlocked
                          ? t(getHiddenDescriptionKey(achievement.condition_type) as keyof IntlMessages["achievements"])
                          : t("hiddenPlaceholder")}
                    </p>
                  </div>
                  {isUnlocked && userAchievement && (
                    <span className="text-[10px] text-accent font-medium tabular-nums shrink-0">
                      {new Date(userAchievement.unlocked_at).toLocaleDateString(locale === "cs" ? "cs-CZ" : "en-US")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      <p className="text-xs text-text-muted text-center">
        {t("unlockedCount", { unlocked: unlocked.length, total: all.length })}
      </p>
    </div>
  );
}
