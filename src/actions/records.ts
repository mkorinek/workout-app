"use server";

import { createClient, getAuthUser } from "@/lib/supabase/server";
import { cache } from "react";

export async function checkAndUpdatePR(
  exerciseName: string,
  weightKg: number,
  reps: number,
  setId: string
) {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return { newPRs: [] };

  const volume = weightKg * reps;
  const now = new Date().toISOString();

  // Fetch all current records in a single query
  const { data: currentRecords } = await supabase
    .from("personal_records")
    .select("record_type, value")
    .eq("user_id", user.id)
    .eq("exercise_name", exerciseName)
    .in("record_type", ["max_weight", "max_reps", "max_volume"]);

  const recordMap = new Map(
    (currentRecords ?? []).map((r) => [r.record_type, r])
  );
  const currentWeight = recordMap.get("max_weight") ?? null;
  const currentReps = recordMap.get("max_reps") ?? null;
  const currentVolume = recordMap.get("max_volume") ?? null;

  const newPRs: string[] = [];
  const upserts: PromiseLike<unknown>[] = [];

  const maybeUpsert = (recordType: string, value: number, current: { value: number } | null) => {
    if (!current || value > Number(current.value)) {
      newPRs.push(recordType);
      upserts.push(
        supabase
          .from("personal_records")
          .upsert(
            {
              user_id: user.id,
              exercise_name: exerciseName,
              record_type: recordType,
              value,
              achieved_at: now,
              set_id: setId,
            },
            { onConflict: "user_id,exercise_name,record_type" }
          )
          .select()
      );
    }
  };

  maybeUpsert("max_weight", weightKg, currentWeight);
  maybeUpsert("max_reps", reps, currentReps);
  maybeUpsert("max_volume", volume, currentVolume);

  if (upserts.length > 0) {
    await Promise.all(upserts);

  }

  return { newPRs };
}

export const getPersonalRecords = cache(async () => {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return [];

  const { data } = await supabase
    .from("personal_records")
    .select("id, exercise_name, record_type, value, achieved_at")
    .eq("user_id", user.id)
    .order("exercise_name");

  return data ?? [];
});

export async function getExerciseProgress(exerciseName: string) {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return [];

  const { data: sets } = await supabase
    .from("workout_sets")
    .select(`
      weight_kg,
      reps,
      completed_at,
      workout_sessions!inner(user_id, started_at)
    `)
    .eq("exercise_name", exerciseName)
    .eq("completed", true)
    .eq("workout_sessions.user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(500);

  if (!sets) return [];

  const grouped = new Map<string, { maxWeight: number; totalVolume: number; maxReps: number }>();

  for (const set of sets) {
    const session = set.workout_sessions as unknown as { started_at: string };
    const date = new Date(session.started_at).toISOString().split("T")[0];
    const existing = grouped.get(date) ?? { maxWeight: 0, totalVolume: 0, maxReps: 0 };

    existing.maxWeight = Math.max(existing.maxWeight, Number(set.weight_kg));
    existing.totalVolume += Number(set.weight_kg) * set.reps;
    existing.maxReps = Math.max(existing.maxReps, set.reps);

    grouped.set(date, existing);
  }

  return Array.from(grouped.entries()).map(([date, stats]) => ({
    date,
    ...stats,
  })).reverse();
}
