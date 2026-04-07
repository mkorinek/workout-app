"use client";

import { useCached } from "@/lib/cache/use-cached";
import { getSessions } from "@/actions/sessions";
import type { SessionsData } from "@/lib/cache/app-store";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteSessionButton } from "@/components/workout/delete-session-button";

export function WorkoutsClient({ initialSessions }: { initialSessions: SessionsData }) {
  const sessions = useCached("sessions", getSessions, initialSessions) ?? [];

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-text-primary">
          Workout Log
        </h1>
        <Link href="/workouts/new">
          <Button size="sm">+ New</Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-text-muted mb-4">
            No workouts yet. Start your first session.
          </p>
          <Link href="/workouts/new">
            <Button>Start Workout</Button>
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {sessions.map((session, i) => {
            const sets = session.workout_sets ?? [];
            const completedSets = sets.filter((s: { completed: boolean }) => s.completed).length;
            const totalVolume = sets
              .filter((s: { completed: boolean }) => s.completed)
              .reduce((sum: number, s: { weight_kg: number; reps: number }) => sum + Number(s.weight_kg) * s.reps, 0);
            const exercises = [...new Set(sets.map((s: { exercise_name: string }) => s.exercise_name))].filter(Boolean);
            const isActive = !session.completed_at;
            const templateName = (session.workout_templates as { name: string } | null)?.name;

            return (
              <Link
                key={session.id}
                href={`/workouts/${session.id}`}
                className={`hover:bg-surface-elevated/50 transition-colors p-4 block ${i < sessions.length - 1 ? "border-b border-border-subtle" : ""}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {templateName && (
                      <p className="text-sm font-semibold text-accent mb-1">{templateName}</p>
                    )}
                    <div className="flex gap-3 text-xs text-text-secondary">
                      <span>{completedSets} sets</span>
                      <span>{totalVolume.toLocaleString()} kg</span>
                    </div>
                    {exercises.length > 0 && (
                      <p className="text-xs text-text-muted mt-1 truncate">
                        {exercises.join(" / ")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-3">
                    {isActive ? (
                      <Badge variant="warning">Active</Badge>
                    ) : (
                      <Badge variant="success">Done</Badge>
                    )}
                    <DeleteSessionButton sessionId={session.id} />
                  </div>
                </div>

                <div className="flex justify-end mt-2">
                  <span className="text-[10px] text-text-muted tabular-nums">
                    {formatDate(session.started_at)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
