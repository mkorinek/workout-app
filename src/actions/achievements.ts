"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateVolume } from "@/lib/utils";
import { cache } from "react";

export const getAchievements = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { all: [], unlocked: [] };

  const [{ data: all }, { data: unlocked }] = await Promise.all([
    supabase.from("achievements").select("*").order("category"),
    supabase
      .from("user_achievements")
      .select("*, achievements(*)")
      .eq("user_id", user.id),
  ]);

  return {
    all: all ?? [],
    unlocked: unlocked ?? [],
  };
});

export async function checkAchievements(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { newAchievements: [] };

  // Fetch all independent data in parallel
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    { data: allAchievements },
    { data: unlocked },
    { data: currentSession },
    { data: currentSets },
    { count: totalWorkouts },
    { data: recentSessions },
    { count: weeklyWorkouts },
  ] = await Promise.all([
    supabase.from("achievements").select("id, name, description, category, condition_type, condition_value, icon"),
    supabase.from("user_achievements").select("achievement_id").eq("user_id", user.id),
    supabase.from("workout_sessions").select("started_at, completed_at").eq("id", sessionId).single(),
    supabase.from("workout_sets").select("exercise_name, weight_kg, reps, completed").eq("session_id", sessionId),
    supabase.from("workout_sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id).not("completed_at", "is", null),
    supabase.from("workout_sessions").select("started_at").eq("user_id", user.id).not("completed_at", "is", null).order("started_at", { ascending: false }).limit(31),
    supabase.from("workout_sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id).not("completed_at", "is", null).gte("started_at", weekAgo.toISOString()),
  ]);

  if (!allAchievements) return { newAchievements: [] };

  const unlockedIds = new Set(unlocked?.map((u) => u.achievement_id) ?? []);

  // Total completed sets — count via completed sets in user's sessions
  // Use a simpler approach: count from workout_sets joined to user sessions
  const { count: totalSets } = await supabase
    .from("workout_sets")
    .select("id, workout_sessions!inner(user_id)", { count: "exact", head: true })
    .eq("completed", true)
    .eq("workout_sessions.user_id", user.id);

  // Streak calculation
  let streak = 0;
  if (recentSessions && recentSessions.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = new Set(
      recentSessions.map((s) => new Date(s.started_at).toISOString().split("T")[0])
    );
    for (let i = 0; i < 31; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (dates.has(d.toISOString().split("T")[0])) {
        streak++;
      } else {
        break;
      }
    }
  }

  // Session stats
  const sessionVolume = calculateVolume(currentSets ?? []);
  const maxSetWeight = Math.max(...(currentSets?.map((s) => Number(s.weight_kg)) ?? [0]));
  const setsInSession = currentSets?.filter((s) => s.completed).length ?? 0;
  const uniqueExercises = new Set(currentSets?.map((s) => s.exercise_name)).size;

  let durationMinutes = 0;
  if (currentSession?.started_at && currentSession?.completed_at) {
    durationMinutes = (new Date(currentSession.completed_at).getTime() - new Date(currentSession.started_at).getTime()) / 60000;
  }

  const startHour = currentSession ? new Date(currentSession.started_at).getHours() : 12;

  const newAchievements: { name: string; description: string; icon: string }[] = [];
  const toInsert: { user_id: string; achievement_id: string }[] = [];

  for (const achievement of allAchievements) {
    if (unlockedIds.has(achievement.id)) continue;

    let met = false;
    switch (achievement.condition_type) {
      case "total_workouts":
        met = (totalWorkouts ?? 0) >= achievement.condition_value;
        break;
      case "total_sets":
        met = (totalSets ?? 0) >= achievement.condition_value;
        break;
      case "single_set_weight":
        met = maxSetWeight >= achievement.condition_value;
        break;
      case "session_volume":
        met = sessionVolume >= achievement.condition_value;
        break;
      case "streak_days":
        met = streak >= achievement.condition_value;
        break;
      case "weekly_workouts":
        met = (weeklyWorkouts ?? 0) >= achievement.condition_value;
        break;
      case "workout_after_midnight":
        met = startHour >= 0 && startHour < 5;
        break;
      case "workout_duration_minutes":
        met = durationMinutes >= achievement.condition_value;
        break;
      case "exercises_in_session":
        met = uniqueExercises === achievement.condition_value && setsInSession > 0;
        break;
      case "sets_in_session":
        met = setsInSession >= achievement.condition_value;
        break;
    }

    if (met) {
      toInsert.push({ user_id: user.id, achievement_id: achievement.id });
      newAchievements.push({
        name: achievement.name,
        description: achievement.category === "hidden"
          ? getHiddenDescription(achievement.condition_type)
          : achievement.description,
        icon: achievement.icon,
      });
    }
  }

  // Batch insert all unlocked achievements and update count
  if (toInsert.length > 0) {
    await Promise.all([
      supabase.from("user_achievements").insert(toInsert),
      supabase.rpc("increment_achievement_count", {
        user_id_input: user.id,
        amount: toInsert.length,
      }),
    ]);
  }

  return { newAchievements };
}

function getHiddenDescription(conditionType: string): string {
  switch (conditionType) {
    case "workout_after_midnight": return "Worked out after midnight";
    case "workout_duration_minutes": return "Workout lasted over 2 hours";
    case "exercises_in_session": return "Completed a workout with only 1 exercise";
    case "sets_in_session": return "Completed 100+ sets in one session";
    default: return "Secret achievement unlocked";
  }
}
