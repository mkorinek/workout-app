"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SaveTemplateDialog } from "@/components/workout/save-template-dialog";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { AchievementIcon } from "@/components/achievement-icons";


interface ExerciseBreakdown {
  name: string;
  sets: { weight_kg: number; reps: number }[];
  volume: number;
}

interface PR {
  exercise_name: string;
  record_type: string;
  value: number;
}

interface Achievement {
  name: string;
  description: string;
  icon: string;
}

interface SummaryData {
  session: {
    id: string;
    started_at: string;
    completed_at: string;
    template_id: string | null;
    templateName: string | null;
  };
  totalVolume: number;
  exerciseBreakdown: ExerciseBreakdown[];
  prs: PR[];
  profile: {
    display_name: string | null;
    lifter_rank: string;
    current_week_streak: number;
    total_volume_kg: number;
  };
  newAchievements: Achievement[];
  duration: number;
}

function formatTopSet(sets: { weight_kg: number; reps: number }[]): string {
  if (sets.length === 0) return "";
  const top = sets.reduce(
    (best, s) => (s.weight_kg > best.weight_kg ? s : best),
    sets[0],
  );
  return `${top.weight_kg}kg × ${top.reps}`;
}

export function SummaryClient({ summary }: { summary: SummaryData }) {
  const router = useRouter();
  const { addToast } = useToast();
  const t = useTranslations("summary");
  const tc = useTranslations("common");
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/share/${summary.session.id}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: t("workoutSummary"), text: shareUrl });
        return;
      } catch {
        // User cancelled
      }
    }

    await navigator.clipboard.writeText(shareUrl);
    addToast(t("linkCopied"), "success");
  }, [addToast, summary.session.id, t]);

  const {
    session,
    totalVolume,
    exerciseBreakdown,
    prs,
    profile,
    newAchievements,
    duration,
  } = summary;
  const formattedDate = formatDate(session.completed_at);

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-text-primary">
            {t("title")}
          </h1>
          {session.templateName && (
            <p className="text-xs text-accent font-medium mt-0.5">
              {session.templateName}
            </p>
          )}
        </div>
        <span className="text-xs text-text-muted tabular-nums">
          {formattedDate}
        </span>
      </div>

      {/* Overview */}
      <div className="mb-6">
        <p className="text-xs font-medium text-text-secondary mb-3">
          {t("overview")}
        </p>
        <div className="card overflow-hidden">
          <div className="flex items-center px-4 py-2.5 border-b border-accent/20 bg-accent/[0.04]">
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-accent/60">
              {t("volume")}
            </span>
            <span className="w-20 text-right text-[10px] font-semibold uppercase tracking-wider text-accent/60">
              {t("duration")}
            </span>
            <span className="w-20 text-right text-[10px] font-semibold uppercase tracking-wider text-accent/60">
              {t("exercises")}
            </span>
          </div>
          <div className="flex items-center px-4 py-3">
            <span className="flex-1 text-lg font-bold tabular-nums text-accent">
              {totalVolume.toLocaleString()} {tc("kg")}
            </span>
            <span className="w-20 text-right text-sm font-medium tabular-nums text-accent">
              {duration} {tc("min")}
            </span>
            <span className="w-20 text-right text-sm font-medium tabular-nums text-accent">
              {exerciseBreakdown.length}
            </span>
          </div>
        </div>
      </div>

      {/* Exercise breakdown */}
      {exerciseBreakdown.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-text-secondary mb-3">
            {t("exercises")}
          </p>
          <div className="card overflow-hidden">
            <div className="flex items-center px-4 py-2.5 border-b border-accent/20 bg-accent/[0.04]">
              <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-accent/60">
                {t("exercise")}
              </span>
              <span className="w-16 text-right text-[10px] font-semibold uppercase tracking-wider text-accent/60">
                {t("sets")}
              </span>
              <span className="w-20 text-right text-[10px] font-semibold uppercase tracking-wider text-accent/60">
                {t("bestSet")}
              </span>
            </div>
            {exerciseBreakdown.map((ex, i) => {
              const exercisePrs = prs.filter((pr) => pr.exercise_name === ex.name);
              return (
                <div
                  key={ex.name}
                  className={`px-4 py-2.5 ${
                    i < exerciseBreakdown.length - 1
                      ? "border-b border-border-subtle"
                      : ""
                  }`}
                >
                  <div className="flex items-center">
                    <span className="flex-1 min-w-0 mr-2 text-sm text-text-primary truncate">
                      {ex.name}
                    </span>
                    <span className="w-16 text-right text-sm tabular-nums text-accent shrink-0">
                      {ex.sets.length}
                    </span>
                    <span className="w-20 text-right text-sm font-medium tabular-nums text-accent shrink-0">
                      {formatTopSet(ex.sets)}
                    </span>
                  </div>
                  {exercisePrs.length > 0 && (
                    <div className="mt-1.5 flex items-center gap-2">
                      {exercisePrs.map((pr, j) => {
                        const label = pr.record_type === "max_weight" ? t("weightPR") : pr.record_type === "max_reps" ? t("repsPR") : t("volumePR");
                        const formatted = pr.record_type === "max_reps"
                          ? String(pr.value)
                          : `${Number(pr.value)}kg`;
                        return (
                          <span
                            key={j}
                            className="text-[10px] font-medium tabular-nums text-accent bg-accent/10 rounded-full px-2 py-0.5"
                          >
                            {label}: {formatted}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-6">
        <p className="text-xs font-medium text-text-secondary mb-3">
          {t("stats")}
        </p>
        <div className="card overflow-hidden">
          <div className="flex items-center px-4 py-2.5 border-b border-accent/20 bg-accent/[0.04]">
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-accent/60">
              {t("stat")}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/60">
              {t("value")}
            </span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle">
            <span className="text-sm text-text-primary">{t("rank")}</span>
            <span className="text-sm font-medium text-accent">
              {profile.lifter_rank}
            </span>
          </div>
          {profile.current_week_streak > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-sm text-text-primary">{t("weeklyStreak")}</span>
              <span className="text-sm font-medium tabular-nums text-accent">
                {t("week", { count: profile.current_week_streak })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      {newAchievements.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-text-secondary mb-3">
            {t("achievementsUnlocked")}
          </p>
          <div className="card overflow-hidden">
            <div className="flex items-center px-4 py-2.5 border-b border-accent/20 bg-accent/[0.04]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-accent/60">
                {t("new")}
              </span>
            </div>
            {newAchievements.map((a, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-2.5 ${
                  i < newAchievements.length - 1
                    ? "border-b border-border-subtle"
                    : ""
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <AchievementIcon name={a.name} icon={a.icon} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-accent font-medium">{a.name}</p>
                  <p className="text-xs text-text-muted">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleShare} className="flex-1">
          {t("share")}
        </Button>
        {!session.template_id && (
          <Button variant="ghost" onClick={() => setShowSaveTemplate(true)}>
            {t("saveTemplate")}
          </Button>
        )}
        <Button variant="ghost" onClick={() => router.push("/workouts")}>
          {tc("back")}
        </Button>
      </div>

      <SaveTemplateDialog
        open={showSaveTemplate}
        onClose={() => setShowSaveTemplate(false)}
        sessionId={session.id}
      />
    </div>
  );
}
