"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSession(templateId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      template_id: templateId || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { id: data.id };
}

export async function getSession(sessionId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("workout_sessions")
    .select("*, workout_sets(*)")
    .eq("id", sessionId)
    .order("set_number", { referencedTable: "workout_sets" })
    .single();

  return data;
}

export async function getSessions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("workout_sessions")
    .select("*, workout_templates(name), workout_sets(id, exercise_name, weight_kg, reps, completed)")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function addSet(
  sessionId: string,
  exerciseName: string,
  setNumber: number,
  weightKg: number,
  reps: number,
  restSeconds: number
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("workout_sets")
    .insert({
      session_id: sessionId,
      exercise_name: exerciseName,
      set_number: setNumber,
      weight_kg: weightKg,
      reps: reps,
      rest_seconds: restSeconds,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/workouts/${sessionId}`);
  return { data };
}

export async function completeSet(setId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_sets")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("id", setId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function uncompleteSet(setId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_sets")
    .update({ completed: false, completed_at: null })
    .eq("id", setId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateSet(
  setId: string,
  updates: { weight_kg?: number; reps?: number; rest_seconds?: number; exercise_name?: string }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_sets")
    .update(updates)
    .eq("id", setId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteSet(setId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("workout_sets")
    .delete()
    .eq("id", setId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function finishWorkout(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Mark session as completed
  const { error } = await supabase
    .from("workout_sessions")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) return { error: error.message };

  // Calculate session volume and update total
  const { data: sets } = await supabase
    .from("workout_sets")
    .select("weight_kg, reps, completed")
    .eq("session_id", sessionId);

  if (sets) {
    const sessionVolume = sets
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + Number(s.weight_kg) * s.reps, 0);

    // Update total volume
    const { data: profile } = await supabase
      .from("profiles")
      .select("total_volume_kg")
      .eq("id", user.id)
      .single();

    if (profile) {
      const newTotal = Number(profile.total_volume_kg) + sessionVolume;
      // Compute new rank
      const newRank = computeRank(newTotal);

      await supabase
        .from("profiles")
        .update({
          total_volume_kg: newTotal,
          lifter_rank: newRank,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }
  }

  revalidatePath("/workouts");
  return { success: true };
}

function computeRank(totalVolume: number): string {
  if (totalVolume >= 1_000_000) return "LEGEND";
  if (totalVolume >= 500_000) return "ELITE";
  if (totalVolume >= 250_000) return "VETERAN";
  if (totalVolume >= 100_000) return "HARDENED";
  if (totalVolume >= 25_000) return "REGULAR";
  if (totalVolume >= 5_000) return "INITIATE";
  return "ROOKIE";
}

export async function getSessionForTemplate(templateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get the most recent completed session using this template
  const { data: session } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("template_id", templateId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(1)
    .single();

  if (!session) return null;

  // Get its sets
  const { data: sets } = await supabase
    .from("workout_sets")
    .select("*")
    .eq("session_id", session.id)
    .order("set_number");

  return sets;
}
