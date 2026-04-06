"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkAndUpdatePR(
  exerciseName: string,
  weightKg: number,
  reps: number,
  setId: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { newPRs: [] };

  const newPRs: string[] = [];
  const volume = weightKg * reps;

  // Check max weight
  const { data: currentWeight } = await supabase
    .from("personal_records")
    .select("value")
    .eq("user_id", user.id)
    .eq("exercise_name", exerciseName)
    .eq("record_type", "max_weight")
    .single();

  if (!currentWeight || weightKg > Number(currentWeight.value)) {
    await supabase
      .from("personal_records")
      .upsert(
        {
          user_id: user.id,
          exercise_name: exerciseName,
          record_type: "max_weight",
          value: weightKg,
          achieved_at: new Date().toISOString(),
          set_id: setId,
        },
        { onConflict: "user_id,exercise_name,record_type" }
      );
    newPRs.push("max_weight");
  }

  // Check max reps
  const { data: currentReps } = await supabase
    .from("personal_records")
    .select("value")
    .eq("user_id", user.id)
    .eq("exercise_name", exerciseName)
    .eq("record_type", "max_reps")
    .single();

  if (!currentReps || reps > Number(currentReps.value)) {
    await supabase
      .from("personal_records")
      .upsert(
        {
          user_id: user.id,
          exercise_name: exerciseName,
          record_type: "max_reps",
          value: reps,
          achieved_at: new Date().toISOString(),
          set_id: setId,
        },
        { onConflict: "user_id,exercise_name,record_type" }
      );
    newPRs.push("max_reps");
  }

  // Check max volume (single set)
  const { data: currentVolume } = await supabase
    .from("personal_records")
    .select("value")
    .eq("user_id", user.id)
    .eq("exercise_name", exerciseName)
    .eq("record_type", "max_volume")
    .single();

  if (!currentVolume || volume > Number(currentVolume.value)) {
    await supabase
      .from("personal_records")
      .upsert(
        {
          user_id: user.id,
          exercise_name: exerciseName,
          record_type: "max_volume",
          value: volume,
          achieved_at: new Date().toISOString(),
          set_id: setId,
        },
        { onConflict: "user_id,exercise_name,record_type" }
      );
    newPRs.push("max_volume");
  }

  return { newPRs };
}

export async function getPersonalRecords() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("personal_records")
    .select("*")
    .eq("user_id", user.id)
    .order("exercise_name");

  return data ?? [];
}

export async function getExerciseProgress(exerciseName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get all completed sets for this exercise, ordered by date
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
    .order("completed_at", { ascending: true });

  if (!sets) return [];

  // Group by session date
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
  }));
}
