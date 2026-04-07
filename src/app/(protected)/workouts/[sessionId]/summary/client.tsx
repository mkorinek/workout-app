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
    case "max_weight": return "max weight";
    case "max_reps": return "max reps";
    case "max_volume": return "max volume";
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

    // Mobile: native share
    if (navigator.share) {
      try {
        await navigator.share({ title: "Workout Summary", url });
        return;
      } catch {
        // User cancelled — fall through to copy
      }
    }

    // Desktop: copy link to clipboard
    await navigator.clipboard.writeText(url);
    addToast("link copied to clipboard", "success");
  }, [addToast]);

  const { session, totalVolume, exerciseBreakdown, prs, profile, newAchievements, duration } = summary;
  const formattedDate = formatDate(session.completed_at);

  return (
    <div className="p-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xs text-term-green uppercase tracking-widest">
            &gt; workout complete
          </h1>
          <span className="text-[10px] text-term-gray-light tabular-nums">
            {formattedDate}
          </span>
        </div>
        {session.templateName && (
          <p className="text-xs text-term-green mb-1">&gt; {session.templateName}</p>
        )}
      </div>

      {/* Volume headline */}
      <div className="border border-term-gray p-4 mb-4 text-center">
        <p className="text-[10px] text-term-gray-light uppercase tracking-widest mb-1">
          total volume
        </p>
        <p className="text-2xl text-term-green font-mono font-bold tabular-nums">
          {totalVolume.toLocaleString()} kg
        </p>
        <p className="text-[10px] text-term-gray-light mt-1">{duration} min</p>
      </div>

      {/* Exercise breakdown */}
      {exerciseBreakdown.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] text-term-gray-light uppercase tracking-widest mb-2">
            &gt; exercises
          </p>
          <div className="border border-term-gray">
            {exerciseBreakdown.map((ex) => (
              <div
                key={ex.name}
                className="flex items-center justify-between px-3 py-2.5 border-b border-term-gray last:border-0"
              >
                <span className="text-xs text-term-white font-mono truncate flex-1">
                  {ex.name}
                </span>
                <span className="text-[10px] text-term-gray-light font-mono shrink-0 ml-2">
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
          <p className="text-[10px] text-term-gray-light uppercase tracking-widest mb-2">
            &gt; personal records
          </p>
          <div className="border border-term-amber">
            {prs.map((pr, i) => (
              <div
                key={`${pr.exercise_name}-${pr.record_type}-${i}`}
                className="flex items-center gap-2 px-3 py-2 border-b border-term-amber/30 last:border-0"
              >
                <Badge variant="amber">PR</Badge>
                <span className="text-xs text-term-white font-mono">
                  {pr.exercise_name}
                </span>
                <span className="text-[10px] text-term-amber font-mono ml-auto">
                  {formatRecordType(pr.record_type)}: {formatRecordValue(pr.record_type, Number(pr.value))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rank & Streak */}
      <div className="mb-4">
        <p className="text-[10px] text-term-gray-light uppercase tracking-widest mb-2">
          &gt; stats
        </p>
        <div className="border border-term-gray px-3 py-2 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-term-gray-light">rank</span>
            <span className="text-term-green font-bold">{profile.lifter_rank}</span>
          </div>
          {profile.current_week_streak > 0 && (
            <div className="flex justify-between text-xs font-mono">
              <span className="text-term-gray-light">weekly streak</span>
              <span className="text-term-white">{profile.current_week_streak} week{profile.current_week_streak !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      </div>

      {/* Achievements */}
      {newAchievements.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] text-term-gray-light uppercase tracking-widest mb-2">
            &gt; achievements unlocked
          </p>
          <div className="border border-term-green">
            {newAchievements.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 border-b border-term-green/30 last:border-0"
              >
                <span className="text-sm">{a.icon}</span>
                <div>
                  <p className="text-xs text-term-green font-mono">{a.name}</p>
                  <p className="text-[10px] text-term-gray-light">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <Button onClick={handleShare} className="flex-1">
          share link
        </Button>
        {!session.template_id && (
          <Button variant="ghost" onClick={() => setShowSaveTemplate(true)}>
            save template
          </Button>
        )}
        <Button variant="ghost" onClick={() => router.push("/workouts")}>
          back
        </Button>
      </div>

      {/* Save template dialog */}
      <SaveTemplateDialog
        open={showSaveTemplate}
        onClose={() => setShowSaveTemplate(false)}
        sessionId={session.id}
      />
    </div>
  );
}
