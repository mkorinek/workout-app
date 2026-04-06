import { getSessions } from "@/actions/sessions";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteSessionButton } from "@/components/workout/delete-session-button";

export default async function WorkoutsPage() {
  const sessions = await getSessions();

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xs text-term-green uppercase tracking-widest">
          &gt; workout log
        </h1>
        <Link href="/workouts/new">
          <Button size="sm">+ new</Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <div className="border border-term-gray p-8 text-center">
          <pre className="text-term-gray-light text-xs mb-4">
{`> no workouts yet
> start your first session`}
          </pre>
          <Link href="/workouts/new">
            <Button>start workout</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {sessions.map((session) => {
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
                className="border border-term-gray hover:border-term-green-dim transition-colors p-3 block"
              >
                <div className="flex items-start justify-between">
                  <div>
                    {templateName && (
                      <p className="text-xs text-term-green mb-1">&gt; {templateName}</p>
                    )}
                    <div className="flex gap-3 text-[10px] text-term-gray-light uppercase tracking-widest">
                      <span>{completedSets} sets</span>
                      <span>{totalVolume.toLocaleString()}kg</span>
                    </div>
                    {exercises.length > 0 && (
                      <p className="text-[10px] text-term-gray mt-1 truncate">
                        {exercises.join(" / ")}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {isActive ? (
                      <Badge variant="amber">active</Badge>
                    ) : (
                      <Badge variant="green">done</Badge>
                    )}
                    <DeleteSessionButton sessionId={session.id} />
                  </div>
                </div>

                <div className="flex justify-end mt-1">
                  <span className="text-[10px] text-term-gray-light tabular-nums">
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
