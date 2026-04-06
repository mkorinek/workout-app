"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getWeekStartDate, getWeekEndDate, computeDisplayStreak } from "@/lib/streak";

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function updateProfile(updates: {
  default_rest_seconds?: number;
  timer_sound?: boolean;
  timer_vibration?: boolean;
  timer_flash?: boolean;
  display_name?: string;
  weekly_workout_goal?: number | null;
  week_start_day?: number;
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

export async function getStreakData() {
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
}
