"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAchievements() {
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
}

export async function checkAchievements(sessionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { newAchievements: [] };

  const newAchievements: { name: string; description: string; icon: string }[] = [];

  // Get all achievement definitions
  const { data: allAchievements } = await supabase
    .from("achievements")
    .select("*");

  // Get already unlocked
  const { data: unlocked } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", user.id);

  const unlockedIds = new Set(unlocked?.map((u) => u.achievement_id) ?? []);

  if (!allAchievements) return { newAchievements };

  // Get user stats
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_volume_kg")
    .eq("id", user.id)
    .single();

  // Current session data
  const { data: currentSession } = await supabase
    .from("workout_sessions")
    .select("started_at, completed_at")
    .eq("id", sessionId)
    .single();

  const { data: currentSets } = await supabase
    .from("workout_sets")
    .select("*")
    .eq("session_id", sessionId);

  // Total completed workouts
  const { count: totalWorkouts } = await supabase
    .from("workout_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .not("completed_at", "is", null);

  // Total completed sets
  const { count: totalSets } = await supabase
    .from("workout_sets")
    .select("id", { count: "exact", head: true })
    .eq("completed", true)
    .in(
      "session_id",
      (await supabase
        .from("workout_sessions")
        .select("id")
        .eq("user_id", user.id)
      ).data?.map((s) => s.id) ?? []
    );

  // Streak calculation
  const { data: recentSessions } = await supabase
    .from("workout_sessions")
    .select("started_at")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(31);

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

  // Weekly workouts
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: weeklyWorkouts } = await supabase
    .from("workout_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .gte("started_at", weekAgo.toISOString());

  // Session stats
  const sessionVolume = currentSets
    ?.filter((s) => s.completed)
    .reduce((sum, s) => sum + Number(s.weight_kg) * s.reps, 0) ?? 0;
  const maxSetWeight = Math.max(...(currentSets?.map((s) => Number(s.weight_kg)) ?? [0]));
  const setsInSession = currentSets?.filter((s) => s.completed).length ?? 0;
  const uniqueExercises = new Set(currentSets?.map((s) => s.exercise_name)).size;

  // Session duration
  let durationMinutes = 0;
  if (currentSession?.started_at && currentSession?.completed_at) {
    durationMinutes = (new Date(currentSession.completed_at).getTime() - new Date(currentSession.started_at).getTime()) / 60000;
  }

  // After midnight check
  const startHour = currentSession ? new Date(currentSession.started_at).getHours() : 12;

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
      const { error } = await supabase
        .from("user_achievements")
        .insert({ user_id: user.id, achievement_id: achievement.id });

      if (!error) {
        newAchievements.push({
          name: achievement.name,
          description: achievement.category === "hidden"
            ? getHiddenDescription(achievement.condition_type)
            : achievement.description,
          icon: achievement.icon,
        });
      }
    }
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
