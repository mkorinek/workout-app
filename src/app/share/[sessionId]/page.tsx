import { getPublicSessionSummary } from "@/actions/share";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";


function formatTopSet(sets: { weight_kg: number; reps: number }[]): string {
  if (sets.length === 0) return "";
  const top = sets.reduce(
    (best, s) => (s.weight_kg > best.weight_kg ? s : best),
    sets[0],
  );
  return `${top.weight_kg}kg × ${top.reps}`;
}

export default async function SharedWorkoutPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const summary = await getPublicSessionSummary(sessionId);

  if (!summary) {
    redirect("/workouts?error=workout_removed");
  }

  const {
    displayName,
    lifterRank,
    completedAt,
    totalVolume,
    duration,
    exerciseBreakdown,
    prs,
  } = summary;

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-text-primary">
              {displayName}&apos;s Workout
            </h1>
            <p className="text-xs text-accent font-medium mt-0.5">
              {lifterRank}
            </p>
          </div>
          <span className="text-xs text-text-muted tabular-nums">
            {formatDate(completedAt)}
          </span>
        </div>

        {/* Overview */}
        <div className="mb-6">
          <p className="text-xs font-medium text-text-secondary mb-3">
            Overview
          </p>
          <div className="card overflow-hidden">
            <div className="flex items-center px-4 py-2.5 border-b border-accent/20 bg-accent/[0.04]">
              <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-accent/60">
                Volume
              </span>
              <span className="w-20 text-right text-[10px] font-semibold uppercase tracking-wider text-accent/60">
                Duration
              </span>
              <span className="w-20 text-right text-[10px] font-semibold uppercase tracking-wider text-accent/60">
                Exercises
              </span>
            </div>
            <div className="flex items-center px-4 py-3">
              <span className="flex-1 text-lg font-bold tabular-nums text-accent">
                {totalVolume.toLocaleString()} kg
              </span>
              <span className="w-20 text-right text-sm font-medium tabular-nums text-accent">
                {duration} min
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
              Exercises
            </p>
            <div className="card overflow-hidden">
              <div className="flex items-center px-4 py-2.5 border-b border-accent/20 bg-accent/[0.04]">
                <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-accent/60">
                  Exercise
                </span>
                <span className="w-16 text-right text-[10px] font-semibold uppercase tracking-wider text-accent/60">
                  Sets
                </span>
                <span className="w-20 text-right text-[10px] font-semibold uppercase tracking-wider text-accent/60">
                  Best Set
                </span>
              </div>
              {exerciseBreakdown.map((ex, i) => {
                const exercisePrs = prs.filter(
                  (pr) => pr.exercise_name === ex.name,
                );
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
                          const label =
                            pr.record_type === "max_weight"
                              ? "W"
                              : pr.record_type === "max_reps"
                                ? "R"
                                : "V";
                          const formatted =
                            pr.record_type === "max_reps"
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

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-xs text-text-muted mb-3">
            Track your own workouts
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2.5 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
          >
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}
