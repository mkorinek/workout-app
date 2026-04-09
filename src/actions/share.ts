"use server";

import { createClient } from "@/lib/supabase/server";

export async function getPublicSessionSummary(sessionId: string) {
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("workout_sessions")
    .select("*, workout_sets(*)")
    .eq("id", sessionId)
    .not("completed_at", "is", null)
    .order("set_number", { referencedTable: "workout_sets" })
    .single();

  if (!session) return null;

  // Fetch profile (public read via migration 00006) and PRs in parallel
  const sets = session.workout_sets ?? [];
  const setIds = sets.map((s: { id: string }) => s.id);

  const [{ data: profile }, { data: prs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, lifter_rank")
      .eq("id", session.user_id)
      .single(),
    setIds.length > 0
      ? supabase
          .from("personal_records")
          .select("exercise_name, record_type, value")
          .in("set_id", setIds)
      : Promise.resolve({ data: [] }),
  ]);

  // Build exercise breakdown
  const exerciseMap = new Map<
    string,
    { sets: { weight_kg: number; reps: number }[]; volume: number }
  >();
  let totalVolume = 0;

  for (const set of sets) {
    if (!set.completed) continue;
    const name = set.exercise_name;
    if (!exerciseMap.has(name)) {
      exerciseMap.set(name, { sets: [], volume: 0 });
    }
    const group = exerciseMap.get(name)!;
    const setVolume = Number(set.weight_kg) * set.reps;
    group.sets.push({ weight_kg: Number(set.weight_kg), reps: set.reps });
    group.volume += setVolume;
    totalVolume += setVolume;
  }

  const exerciseBreakdown = Array.from(exerciseMap.entries()).map(
    ([name, data]) => ({ name, ...data }),
  );

  const startedAt = new Date(session.started_at);
  const completedAt = new Date(session.completed_at);
  const duration = Math.round(
    (completedAt.getTime() - startedAt.getTime()) / 60000,
  );

  return {
    displayName: profile?.display_name ?? "Anonymous",
    lifterRank: profile?.lifter_rank ?? "ROOKIE",
    completedAt: session.completed_at,
    totalVolume,
    duration,
    exerciseBreakdown,
    prs: prs ?? [],
  };
}
