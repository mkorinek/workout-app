"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getRankFromVolume, calculateVolume } from "@/lib/utils";
import { getWeekStartDate, getWeekEndDate, getPreviousWeekStart } from "@/lib/streak";

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

  const { error } = await supabase
    .from("workout_sessions")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) return { error: error.message };

  // Fetch sets and profile in parallel
  const [{ data: sets }, { data: profile }] = await Promise.all([
    supabase
      .from("workout_sets")
      .select("weight_kg, reps, completed")
      .eq("session_id", sessionId),
    supabase
      .from("profiles")
      .select("total_volume_kg, weekly_workout_goal, week_start_day, current_week_streak, streak_last_completed_week")
      .eq("id", user.id)
      .single(),
  ]);

  if (sets && profile) {
    const sessionVolume = calculateVolume(sets);
    const newTotal = Number(profile.total_volume_kg) + sessionVolume;

    const profileUpdate: Record<string, unknown> = {
      total_volume_kg: newTotal,
      lifter_rank: getRankFromVolume(newTotal),
      updated_at: new Date().toISOString(),
    };

    // Weekly streak logic
    if (profile.weekly_workout_goal) {
      const now = new Date();
      const weekStart = getWeekStartDate(now, profile.week_start_day);
      const weekEnd = getWeekEndDate(weekStart);

      const { count } = await supabase
        .from("workout_sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .not("completed_at", "is", null)
        .gte("completed_at", weekStart + "T00:00:00.000Z")
        .lt("completed_at", weekEnd + "T00:00:00.000Z");

      const workoutsThisWeek = count ?? 0;

      if (workoutsThisWeek >= profile.weekly_workout_goal) {
        const lastWeek = profile.streak_last_completed_week;
        if (lastWeek === weekStart) {
          // Already counted this week — no change
        } else {
          const previousWeek = getPreviousWeekStart(weekStart, profile.week_start_day);
          if (lastWeek === previousWeek) {
            profileUpdate.current_week_streak = profile.current_week_streak + 1;
          } else {
            profileUpdate.current_week_streak = 1;
          }
          profileUpdate.streak_last_completed_week = weekStart;
        }
      }
    }

    await supabase
      .from("profiles")
      .update(profileUpdate)
      .eq("id", user.id);
  }

  revalidatePath("/workouts");
  return { success: true };
}

export async function deleteSession(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Verify ownership
  const { data: session } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) return { error: "Session not found" };

  // Cascade deletes workout_sets via FK
  const { error } = await supabase
    .from("workout_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) return { error: error.message };
  revalidatePath("/workouts");
  return { success: true };
}

export async function getSessionForTemplate(templateId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

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

  const { data: sets } = await supabase
    .from("workout_sets")
    .select("exercise_name, set_number, weight_kg, reps, rest_seconds")
    .eq("session_id", session.id)
    .order("set_number");

  return sets;
}
