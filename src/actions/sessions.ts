"use server";

import { createClient, getAuthUser } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { getRankFromVolume, calculateVolume } from "@/lib/utils";
import { computeStreakUpdate } from "@/lib/streak";

export async function createSession(templateId?: string) {
  const supabase = await createClient();
  const user = await getAuthUser();
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

export const getSessions = cache(async () => {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return [];

  const { data } = await supabase
    .from("workout_sessions")
    .select("*, workout_templates(name), workout_sets(id, exercise_name, weight_kg, reps, completed)")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(50);

  return data ?? [];
});

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
  // Skip revalidatePath — client manages state optimistically
  return { data };
}

export async function addSets(
  sessionId: string,
  sets: {
    exerciseName: string;
    setNumber: number;
    weightKg: number;
    reps: number;
    restSeconds: number;
  }[]
) {
  const supabase = await createClient();

  const rows = sets.map((s) => ({
    session_id: sessionId,
    exercise_name: s.exerciseName,
    set_number: s.setNumber,
    weight_kg: s.weightKg,
    reps: s.reps,
    rest_seconds: s.restSeconds,
  }));

  const { data, error } = await supabase
    .from("workout_sets")
    .insert(rows)
    .select();

  if (error) return { error: error.message };
  // Skip revalidatePath — client manages state optimistically
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
  updates: { weight_kg?: number; reps?: number; rest_seconds?: number; exercise_name?: string; note?: string }
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
  const user = await getAuthUser();
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

    const streakFields = await computeStreakUpdate(supabase, user.id, profile);

    await supabase
      .from("profiles")
      .update({
        total_volume_kg: newTotal,
        lifter_rank: getRankFromVolume(newTotal),
        updated_at: new Date().toISOString(),
        ...streakFields,
      })
      .eq("id", user.id);
  }

  revalidatePath("/workouts");
  revalidatePath("/progress");
  revalidatePath("/profile");
  return { success: true };
}

export async function deleteSession(sessionId: string) {
  const supabase = await createClient();
  const user = await getAuthUser();
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

export async function getSessionSummary(sessionId: string) {
  const supabase = await createClient();
  const user = await getAuthUser();
  if (!user) return null;

  // Fetch session, profile, and set IDs in parallel
  const [{ data: session }, { data: profile }] = await Promise.all([
    supabase
      .from("workout_sessions")
      .select("*, workout_templates(name), workout_sets(*)")
      .eq("id", sessionId)
      .order("set_number", { referencedTable: "workout_sets" })
      .single(),
    supabase
      .from("profiles")
      .select("display_name, lifter_rank, current_week_streak, total_volume_kg")
      .eq("id", user.id)
      .single(),
  ]);

  if (!session || !session.completed_at) return null;

  const sets = session.workout_sets ?? [];
  const setIds = sets.map((s: { id: string }) => s.id);

  // Fetch PRs and achievements in parallel
  const [{ data: prs }, { data: userAchievements }] = await Promise.all([
    setIds.length > 0
      ? supabase
          .from("personal_records")
          .select("exercise_name, record_type, value")
          .in("set_id", setIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", user.id)
      .gte("unlocked_at", session.started_at)
      .lte(
        "unlocked_at",
        new Date(new Date(session.completed_at).getTime() + 30000).toISOString()
      ),
  ]);

  // Build exercise breakdown
  const exerciseMap = new Map<string, { sets: { weight_kg: number; reps: number }[]; volume: number }>();
  for (const set of sets) {
    if (!set.completed) continue;
    const name = set.exercise_name;
    if (!exerciseMap.has(name)) {
      exerciseMap.set(name, { sets: [], volume: 0 });
    }
    const group = exerciseMap.get(name)!;
    group.sets.push({ weight_kg: Number(set.weight_kg), reps: set.reps });
    group.volume += Number(set.weight_kg) * set.reps;
  }

  const exerciseBreakdown = Array.from(exerciseMap.entries()).map(([name, data]) => ({
    name,
    ...data,
  }));

  // Duration in minutes
  const duration = Math.round(
    (new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000
  );

  return {
    session: {
      id: session.id,
      started_at: session.started_at,
      completed_at: session.completed_at,
      template_id: session.template_id,
      templateName: (session.workout_templates as { name: string } | null)?.name ?? null,
    },
    totalVolume: calculateVolume(sets),
    exerciseBreakdown,
    prs: prs ?? [],
    profile: profile ?? { display_name: null, lifter_rank: "ROOKIE", current_week_streak: 0, total_volume_kg: 0 },
    newAchievements: (userAchievements ?? []).map((ua: { achievements: { name: string; description: string; icon: string } }) => ({
      name: ua.achievements.name,
      description: ua.achievements.description,
      icon: ua.achievements.icon,
    })),
    duration,
  };
}

export async function getSessionForTemplate(templateId: string) {
  const supabase = await createClient();
  const user = await getAuthUser();
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
