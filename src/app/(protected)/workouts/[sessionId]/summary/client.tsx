"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SaveTemplateDialog } from "@/components/workout/save-template-dialog";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

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

function formatExerciseSets(sets: { weight_kg: number; reps: number }[]): string {
  const groups = new Map<string, number>();
  for (const set of sets) {
    const key = `${set.reps}@${set.weight_kg}`;
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }

  return Array.from(groups.entries())
    .map(([key, count]) => {
      const [reps, weight] = key.split("@");
      return `${count}x${reps} @ ${Number(weight)}kg`;
    })
    .join(", ");
}

function formatRecordType(type: string): string {
  switch (type) {
    case "max_weight": return "Max Weight";
    case "max_reps": return "Max Reps";
    case "max_volume": return "Max Volume";
    default: return type;
  }
}

function formatRecordValue(type: string, value: number): string {
  switch (type) {
    case "max_weight": return `${value}kg`;
    case "max_reps": return `${value} reps`;
    case "max_volume": return `${value}kg vol`;
    default: return `${value}`;
  }
}

export function SummaryClient({ summary }: { summary: SummaryData }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: "Workout Summary", url });
        return;
      } catch {
        // User cancelled
      }
    }

    await navigator.clipboard.writeText(url);
    addToast("Link copied to clipboard", "success");
  }, [addToast]);

  const { session, totalVolume, exerciseBreakdown, prs, profile, newAchievements, duration } = summary;
  const formattedDate = formatDate(session.completed_at);

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-bold text-text-primary">
            Workout Complete
          </h1>
          <span className="text-xs text-text-muted tabular-nums">
            {formattedDate}
          </span>
        </div>
        {session.templateName && (
          <p className="text-sm text-accent font-medium">{session.templateName}</p>
        )}
      </div>

      {/* Volume headline */}
      <div className="card p-5 mb-4 text-center">
        <p className="text-xs font-medium text-text-secondary mb-1">
          Total Volume
        </p>
        <p className="text-3xl text-accent font-bold tabular-nums">
          {totalVolume.toLocaleString()} kg
        </p>
        <p className="text-xs text-text-muted mt-1">{duration} min</p>
      </div>

      {/* Exercise breakdown */}
      {exerciseBreakdown.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-text-secondary mb-2">
            Exercises
          </p>
          <div className="card overflow-hidden">
            {exerciseBreakdown.map((ex) => (
              <div
                key={ex.name}
                className="flex items-center justify-between px-4 py-3 border-b border-border-subtle last:border-0"
              >
                <span className="text-sm text-text-primary truncate flex-1">
                  {ex.name}
                </span>
                <span className="text-xs text-text-muted shrink-0 ml-2">
                  {formatExerciseSets(ex.sets)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRs */}
      {prs.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-text-secondary mb-2">
            Personal Records
          </p>
          <div className="card overflow-hidden">
            {prs.map((pr, i) => (
              <div
                key={`${pr.exercise_name}-${pr.record_type}-${i}`}
                className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle last:border-0"
              >
                <Badge variant="warning">PR</Badge>
                <span className="text-sm text-text-primary">
                  {pr.exercise_name}
                </span>
                <span className="text-xs text-warning ml-auto">
                  {formatRecordType(pr.record_type)}: {formatRecordValue(pr.record_type, Number(pr.value))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rank & Streak */}
      <div className="mb-4">
        <p className="text-xs font-medium text-text-secondary mb-2">
          Stats
        </p>
        <div className="card px-4 py-3 flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Rank</span>
            <span className="text-accent font-bold">{profile.lifter_rank}</span>
          </div>
          {profile.current_week_streak > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Weekly Streak</span>
              <span className="text-text-primary">{profile.current_week_streak} week{profile.current_week_streak !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      {newAchievements.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-text-secondary mb-2">
            Achievements Unlocked
          </p>
          <div className="card overflow-hidden">
            {newAchievements.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-0"
              >
                <span className="text-lg">{a.icon}</span>
                <div>
                  <p className="text-sm text-accent font-medium">{a.name}</p>
                  <p className="text-xs text-text-muted">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <Button onClick={handleShare} className="flex-1">
          Share Link
        </Button>
        {!session.template_id && (
          <Button variant="ghost" onClick={() => setShowSaveTemplate(true)}>
            Save Template
          </Button>
        )}
        <Button variant="ghost" onClick={() => router.push("/workouts")}>
          Back
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
