"use server";

import { createClient, requireAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cache } from "react";
import { getRankFromVolume, calculateVolume } from "@/lib/utils";
import { getWeekStartDate, getWeekEndDate, computeDisplayStreak, computeStreakUpdate } from "@/lib/streak";

export const getProfile = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
});

export async function updateProfile(updates: {
  default_rest_seconds?: number;
  timer_sound?: boolean;
  timer_vibration?: boolean;
  timer_flash?: boolean;
  display_name?: string;
  weekly_workout_goal?: number | null;
  week_start_day?: number;
  accent_color?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/profile");
  return { success: true };
}

export async function resetProfile() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const { supabase, user } = auth;


  const [profileResult, achievementsResult] = await Promise.all([
    supabase
      .from("profiles")
      .update({
        total_volume_kg: 0,
        lifter_rank: "ROOKIE",
        current_week_streak: 0,
        streak_last_completed_week: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id),
    supabase
      .from("user_achievements")
      .delete()
      .eq("user_id", user.id),
  ]);

  if (profileResult.error) return { error: profileResult.error.message };
  if (achievementsResult.error) return { error: achievementsResult.error.message };

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/progress");
  return { success: true };
}

export async function deleteAllHistory() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const { supabase, user } = auth;


  const [sessionsResult, prsResult, achievementsResult] = await Promise.all([
    supabase
      .from("workout_sessions")
      .delete()
      .eq("user_id", user.id),
    supabase
      .from("personal_records")
      .delete()
      .eq("user_id", user.id),
    supabase
      .from("user_achievements")
      .delete()
      .eq("user_id", user.id),
  ]);

  if (sessionsResult.error) return { error: sessionsResult.error.message };
  if (prsResult.error) return { error: prsResult.error.message };
  if (achievementsResult.error) return { error: achievementsResult.error.message };

  // Reset profile stats
  const { error } = await supabase
    .from("profiles")
    .update({
      total_volume_kg: 0,
      lifter_rank: "ROOKIE",
      current_week_streak: 0,
      streak_last_completed_week: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/progress");
  revalidatePath("/workouts");
  return { success: true };
}

export async function adminUpdateStats(updates: {
  total_volume_kg?: number;
  lifter_rank?: string;
  current_week_streak?: number;
}) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const { supabase, user } = auth;

  // When setting streak > 0, also set streak_last_completed_week so computeDisplayStreak works
  const finalUpdates: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
  if (updates.current_week_streak !== undefined && updates.current_week_streak > 0) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("week_start_day")
      .eq("id", user.id)
      .single();
    finalUpdates.streak_last_completed_week = getWeekStartDate(new Date(), prof?.week_start_day ?? 1);
  } else if (updates.current_week_streak === 0) {
    finalUpdates.streak_last_completed_week = null;
  }

  const { error } = await supabase
    .from("profiles")
    .update(finalUpdates)
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/progress");
  return { success: true };
}

export async function adminCreateDummyWorkout() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const { supabase, user } = auth;

  const exercises = [
    { name: "Bench Press", weightRange: [40, 100], repsRange: [5, 12] },
    { name: "Squat", weightRange: [60, 140], repsRange: [3, 10] },
    { name: "Deadlift", weightRange: [80, 180], repsRange: [3, 8] },
    { name: "Overhead Press", weightRange: [20, 60], repsRange: [6, 12] },
    { name: "Barbell Row", weightRange: [40, 100], repsRange: [6, 12] },
    { name: "Pull Up", weightRange: [0, 20], repsRange: [3, 15] },
    { name: "Dumbbell Curl", weightRange: [8, 24], repsRange: [8, 15] },
    { name: "Leg Press", weightRange: [80, 200], repsRange: [8, 15] },
  ];

  // Pick 3-5 random exercises
  const shuffled = exercises.sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, 3 + Math.floor(Math.random() * 3));

  // Create session
  const startedAt = new Date();
  startedAt.setMinutes(startedAt.getMinutes() - (30 + Math.floor(Math.random() * 60)));

  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: user.id,
      started_at: startedAt.toISOString(),
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (sessionError || !session) return { error: sessionError?.message ?? "Failed to create session" };

  // Create sets
  const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
  const sets = [];
  let setNumber = 1;

  for (const ex of picked) {
    const numSets = rand(3, 5);
    const weight = rand(ex.weightRange[0], ex.weightRange[1]);
    const reps = rand(ex.repsRange[0], ex.repsRange[1]);

    for (let i = 0; i < numSets; i++) {
      const setWeight = weight + rand(-5, 5);
      sets.push({
        session_id: session.id,
        exercise_name: ex.name,
        set_number: setNumber++,
        weight_kg: Math.max(0, setWeight),
        reps: reps + rand(-2, 2),
        rest_seconds: 60,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    }
  }

  const { error: setsError } = await supabase
    .from("workout_sets")
    .insert(sets);

  if (setsError) return { error: setsError.message };

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("total_volume_kg, weekly_workout_goal, week_start_day, current_week_streak, streak_last_completed_week")
    .eq("id", user.id)
    .single();

  if (currentProfile) {
    const sessionVolume = calculateVolume(sets);
    const newTotal = Number(currentProfile.total_volume_kg) + sessionVolume;
    const streakFields = await computeStreakUpdate(supabase, user.id, currentProfile);

    await supabase.from("profiles").update({
      total_volume_kg: newTotal,
      lifter_rank: getRankFromVolume(newTotal),
      updated_at: new Date().toISOString(),
      ...streakFields,
    }).eq("id", user.id);
  }

  revalidatePath("/");
  revalidatePath("/workouts");
  revalidatePath("/progress");
  return { success: true, sessionId: session.id };
}

export async function adminCheckAchievements() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth;
  const { supabase, user } = auth;

  // Find the latest completed session
  const { data: latestSession } = await supabase
    .from("workout_sessions")
    .select("id")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(1)
    .single();

  if (!latestSession) return { error: "No completed workouts found" };

  // Import and call checkAchievements
  const { checkAchievements } = await import("@/actions/achievements");
  const { newAchievements } = await checkAchievements(latestSession.id);

  revalidatePath("/progress");
  return { success: true, newAchievements };
}

export const getStreakData = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("weekly_workout_goal, week_start_day, current_week_streak, streak_last_completed_week")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.weekly_workout_goal) return null;

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

  const displayStreak = computeDisplayStreak(
    profile.current_week_streak,
    profile.streak_last_completed_week,
    profile.week_start_day,
    now
  );

  return {
    currentStreak: displayStreak,
    weeklyWorkoutGoal: profile.weekly_workout_goal,
    weekStartDay: profile.week_start_day,
    workoutsThisWeek: count ?? 0,
  };
});
